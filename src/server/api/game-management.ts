import { z } from "zod";
import { router, adminProcedure } from "./trpc/trpc-context";
import { TRPCError } from "@trpc/server";
import gameConfigService from "../services/game-config-service";
import enemyModel from "../database/models/enemy.model";
import gameSessionModel from "../database/models/game-session.model";
import logWithTimestamp from "utils/logs";

export const gameManagementRouter = router({
  startGame: adminProcedure
    .input(
      z.object({
        enemyId: z.string(),
        durationMinutes: z.number().min(1).max(1440), // Max 24 hours
        startTime: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {

        const session = await gameConfigService.startGameSession({
          enemyId: input.enemyId,
          durationMinutes: input.durationMinutes,
          startTime: input.startTime,
        });

        logWithTimestamp(`Game started by admin: ${ctx.session.user.walletId}`);
        return {
          success: true,
          session,
          message: `Game session started successfully for ${input.durationMinutes} minutes`,
        };
      } catch (error) {
        logWithTimestamp(`Error starting game: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to start game",
        });
      }
    }),

  endGame: adminProcedure
    .input(
      z.object({
        reason: z.enum(["MANUAL_END", "TIME_EXPIRED", "ENEMY_DEFEATED"]).default("MANUAL_END"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {

        const session = await gameConfigService.endGameSession(input.reason);
        
        logWithTimestamp(`Game ended by admin: ${ctx.session.user.walletId} with reason: ${input.reason}`);
        return {
          success: true,
          session,
          message: `Game session ended successfully`,
        };
      } catch (error) {
        logWithTimestamp(`Error ending game: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to end game",
        });
      }
    }),

  getGameStatus: adminProcedure.query(async () => {
    try {

      const activeSession = await gameConfigService.getCurrentActiveSession();
      if (!activeSession) {
        return {
          hasActiveGame: false,
          activeSession: null,
          stats: null,
        };
      }

      const stats = await gameConfigService.getGameStatistics(activeSession._id);
      
      return {
        hasActiveGame: true,
        activeSession,
        stats,
      };
    } catch (error) {
      logWithTimestamp(`Error getting game status: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get game status",
      });
    }
  }),

  createEnemy: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        image: z.string().min(1),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        type: z.enum(["BOSS", "MINION", "ELITE"]),
        maxHealth: z.number().min(1).max(100000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Enemy = enemyModel();
        const enemy = new Enemy({
          name: input.name,
          image: input.image,
          difficulty: input.difficulty,
          type: input.type,
          maxHealth: input.maxHealth,
          currentHealth: input.maxHealth,
          isDefeated: false,
          totalDamageReceived: 0,
          totalPowerReceived: 0,
        });

        await enemy.save();
        
        logWithTimestamp(`Enemy created by admin: ${ctx.session.user.walletId} - ${enemy.name}`);
        return {
          success: true,
          enemy,
          message: `Enemy "${enemy.name}" created successfully`,
        };
      } catch (error) {
        logWithTimestamp(`Error creating enemy: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create enemy",
        });
      }
    }),

  getEnemies: adminProcedure.query(async () => {
    try {
      const Enemy = enemyModel();
      const enemies = await Enemy.find().sort({ createdAt: -1 }).lean();
      
      return enemies;
    } catch (error) {
      logWithTimestamp(`Error getting enemies: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get enemies",
      });
    }
  }),

  getGameHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const GameSession = gameSessionModel();
        const sessions = await GameSession.find()
          .populate('enemyId')
          .sort({ createdAt: -1 })
          .limit(input.limit)
          .skip(input.offset)
          .lean();

        const total = await GameSession.countDocuments();

        return {
          sessions,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        logWithTimestamp(`Error getting game history: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get game history",
        });
      }
    }),

  updateEnemyHealth: adminProcedure
    .input(
      z.object({
        enemyId: z.string(),
        newHealth: z.number().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Enemy = enemyModel();
        const enemy = await Enemy.findByIdAndUpdate(
          input.enemyId,
          { currentHealth: input.newHealth },
          { new: true }
        );

        if (!enemy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enemy not found",
          });
        }

        // Check if enemy is now defeated
        if (input.newHealth <= 0 && !enemy.isDefeated) {
          await Enemy.findByIdAndUpdate(input.enemyId, { isDefeated: true });
          
          // End game session if active
          const activeSession = await gameConfigService.getCurrentActiveSession();
          if (activeSession && activeSession.enemy._id.toString() === input.enemyId) {
            await gameConfigService.endGameSession("ENEMY_DEFEATED");
          }
        }

        logWithTimestamp(`Enemy health updated by admin: ${ctx.session.user.walletId} - ${enemy.name} to ${input.newHealth}`);
        return {
          success: true,
          enemy,
          message: `Enemy health updated to ${input.newHealth}`,
        };
      } catch (error) {
        logWithTimestamp(`Error updating enemy health: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update enemy health",
        });
      }
    }),

  updateEnemy: adminProcedure
    .input(
      z.object({
        enemyId: z.string(),
        name: z.string().min(1).max(100).optional(),
        image: z.string().min(1).optional(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
        type: z.enum(["BOSS", "MINION", "ELITE"]).optional(),
        maxHealth: z.number().min(1).max(100000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Enemy = enemyModel();
        const updateData: Record<string, unknown> = {};
        
        if (input.name) updateData.name = input.name;
        if (input.image) updateData.image = input.image;
        if (input.difficulty) updateData.difficulty = input.difficulty;
        if (input.type) updateData.type = input.type;
        if (input.maxHealth) {
          updateData.maxHealth = input.maxHealth;
          // If increasing max health, also increase current health
          const currentEnemy = await Enemy.findById(input.enemyId);
          if (currentEnemy && input.maxHealth > currentEnemy.maxHealth) {
            updateData.currentHealth = Math.min(input.maxHealth, currentEnemy.currentHealth + (input.maxHealth - currentEnemy.maxHealth));
          }
        }

        const enemy = await Enemy.findByIdAndUpdate(
          input.enemyId,
          updateData,
          { new: true }
        );

        if (!enemy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enemy not found",
          });
        }

        logWithTimestamp(`Enemy updated by admin: ${ctx.session.user.walletId} - ${enemy.name}`);
        return {
          success: true,
          enemy,
          message: `Enemy "${enemy.name}" updated successfully`,
        };
      } catch (error) {
        logWithTimestamp(`Error updating enemy: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update enemy",
        });
      }
    }),

  deleteEnemy: adminProcedure
    .input(
      z.object({
        enemyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Enemy = enemyModel();
        
        // Check if enemy is used in any active game session
        const GameSession = gameSessionModel();
        const activeSession = await GameSession.findOne({ 
          enemyId: input.enemyId, 
          status: 'ACTIVE' 
        });
        
        if (activeSession) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Cannot delete enemy that is currently in an active game session",
          });
        }

        const enemy = await Enemy.findByIdAndDelete(input.enemyId);

        if (!enemy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enemy not found",
          });
        }

        logWithTimestamp(`Enemy deleted by admin: ${ctx.session.user.walletId} - ${enemy.name}`);
        return {
          success: true,
          message: `Enemy "${enemy.name}" deleted successfully`,
        };
      } catch (error) {
        logWithTimestamp(`Error deleting enemy: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete enemy",
        });
      }
    }),

  getEnemy: adminProcedure
    .input(
      z.object({
        enemyId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const Enemy = enemyModel();
        const enemy = await Enemy.findById(input.enemyId).lean();

        if (!enemy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enemy not found",
          });
        }

        return enemy;
      } catch (error) {
        logWithTimestamp(`Error getting enemy: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get enemy",
        });
      }
    }),

  // Game Session Management
  createGameSession: adminProcedure
    .input(
      z.object({
        enemyId: z.string(),
        startTime: z.date(),
        scheduledEndTime: z.date(),
        status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).default("PENDING"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate enemy exists
        const Enemy = enemyModel();
        const enemy = await Enemy.findById(input.enemyId);
        if (!enemy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enemy not found",
          });
        }

        // Validate times
        if (input.scheduledEndTime <= input.startTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scheduled end time must be after start time",
          });
        }

        // Check if trying to create an ACTIVE session when one already exists
        const GameSession = gameSessionModel();
        if (input.status === "ACTIVE") {
          const existingActiveSession = await GameSession.findOne({ isActive: true });
          if (existingActiveSession) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "An active game session already exists. Only one active session is allowed at a time.",
            });
          }
        }

        const gameSession = new GameSession({
          enemyId: input.enemyId,
          status: input.status,
          startTime: input.startTime,
          scheduledEndTime: input.scheduledEndTime,
          isActive: input.status === "ACTIVE",
          totalDamageDealt: 0,
          totalPowerDealt: 0,
          participantCount: 0,
          battleCount: 0,
        });

        await gameSession.save();
        
        logWithTimestamp(`Game session created by admin: ${ctx.session.user.walletId} - Enemy: ${enemy.name}`);
        return {
          success: true,
          gameSession,
          message: `Game session created successfully for enemy "${enemy.name}"`,
        };
      } catch (error) {
        logWithTimestamp(`Error creating game session: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create game session",
        });
      }
    }),

  getAllGameSessions: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const GameSession = gameSessionModel();
        const filter: Record<string, unknown> = {};
        
        if (input.status) {
          filter.status = input.status;
        }

        const sessions = await GameSession.find(filter)
          .populate("enemyId")
          .sort({ createdAt: -1 })
          .limit(input.limit)
          .skip(input.offset)
          .lean();

        const total = await GameSession.countDocuments(filter);

        return {
          sessions,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        logWithTimestamp(`Error getting game sessions: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get game sessions",
        });
      }
    }),

  updateGameSession: adminProcedure
    .input(
      z.object({
        sessionId: z.string(),
        enemyId: z.string().optional(),
        startTime: z.date().optional(),
        scheduledEndTime: z.date().optional(),
        status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
        winCondition: z.enum(["ENEMY_DEFEATED", "TIME_EXPIRED", "MANUAL_END"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const GameSession = gameSessionModel();
        const session = await GameSession.findById(input.sessionId);
        
        if (!session) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game session not found",
          });
        }

        // If changing enemy, validate it exists
        if (input.enemyId) {
          const Enemy = enemyModel();
          const enemy = await Enemy.findById(input.enemyId);
          if (!enemy) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Enemy not found",
            });
          }
        }

        // Validate time changes
        const newStartTime = input.startTime || session.startTime;
        const newEndTime = input.scheduledEndTime || session.scheduledEndTime;
        if (newEndTime <= newStartTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scheduled end time must be after start time",
          });
        }

        // Handle status changes
        if (input.status) {
          // If changing to ACTIVE, ensure no other active session exists
          if (input.status === "ACTIVE" && session.status !== "ACTIVE") {
            const existingActiveSession = await GameSession.findOne({ 
              isActive: true, 
              _id: { $ne: input.sessionId } 
            });
            if (existingActiveSession) {
              throw new TRPCError({
                code: "CONFLICT",
                message: "An active game session already exists. Only one active session is allowed at a time.",
              });
            }
          }
        }

        const updateData: Record<string, unknown> = {};
        if (input.enemyId) updateData.enemyId = input.enemyId;
        if (input.startTime) updateData.startTime = input.startTime;
        if (input.scheduledEndTime) updateData.scheduledEndTime = input.scheduledEndTime;
        if (input.status) {
          updateData.status = input.status;
          updateData.isActive = input.status === "ACTIVE";
          if (input.status === "COMPLETED" && !session.endTime) {
            updateData.endTime = new Date();
          }
        }
        if (input.winCondition) updateData.winCondition = input.winCondition;

        const updatedSession = await GameSession.findByIdAndUpdate(
          input.sessionId,
          updateData,
          { new: true }
        ).populate("enemyId");

        logWithTimestamp(`Game session updated by admin: ${ctx.session.user.walletId}`);
        return {
          success: true,
          gameSession: updatedSession,
          message: "Game session updated successfully",
        };
      } catch (error) {
        logWithTimestamp(`Error updating game session: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update game session",
        });
      }
    }),

  deleteGameSession: adminProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const GameSession = gameSessionModel();
        const session = await GameSession.findById(input.sessionId);

        if (!session) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game session not found",
          });
        }

        // Prevent deletion of active sessions
        if (session.status === "ACTIVE" || session.isActive) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Cannot delete an active game session. Please end the session first.",
          });
        }

        await GameSession.findByIdAndDelete(input.sessionId);

        logWithTimestamp(`Game session deleted by admin: ${ctx.session.user.walletId}`);
        return {
          success: true,
          message: "Game session deleted successfully",
        };
      } catch (error) {
        logWithTimestamp(`Error deleting game session: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete game session",
        });
      }
    }),

  getGameSession: adminProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const GameSession = gameSessionModel();
        const session = await GameSession.findById(input.sessionId)
          .populate("enemyId")
          .lean();

        if (!session) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game session not found",
          });
        }

        return session;
      } catch (error) {
        logWithTimestamp(`Error getting game session: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get game session",
        });
      }
    }),
});