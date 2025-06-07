import { z } from "zod";
import { router, protectedProcedure } from "./trpc/trpc-context";
import { TRPCError } from "@trpc/server";
import gameConfigService from "../services/game-config-service";
import enemyModel from "../database/models/enemy.model";
import gameSessionModel from "../database/models/game-session.model";
import logWithTimestamp from "utils/logs";

export const gameManagementRouter = router({
  startGame: protectedProcedure
    .input(
      z.object({
        enemyId: z.string(),
        durationMinutes: z.number().min(1).max(1440), // Max 24 hours
        startTime: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // For now, just check if user is authenticated
        // TODO: Implement proper admin role checking
        if (!ctx.session.user) {
          throw new TRPCError({
            code: "FORBIDDEN", 
            message: "Authentication required",
          });
        }

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

  endGame: protectedProcedure
    .input(
      z.object({
        reason: z.enum(["MANUAL_END", "TIME_EXPIRED", "ENEMY_DEFEATED"]).default("MANUAL_END"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session.user) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Authentication required",
          });
        }

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

  getGameStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Authentication required",
        });
      }

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

  createEnemy: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        image: z.string().url(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        type: z.enum(["BOSS", "MINION", "ELITE"]),
        maxHealth: z.number().min(1).max(100000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session.user) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Authentication required",
          });
        }

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

  getEnemies: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Authentication required",
        });
      }

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

  getGameHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session.user) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Authentication required",
          });
        }

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

  updateEnemyHealth: protectedProcedure
    .input(
      z.object({
        enemyId: z.string(),
        newHealth: z.number().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session.user) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Authentication required",
          });
        }

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
});