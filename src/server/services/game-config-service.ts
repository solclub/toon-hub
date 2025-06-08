import { ObjectId } from "mongodb";
import enemyModel, { type Enemy } from "../database/models/enemy.model";
import gameSessionModel, { type GameSession, type WinConditionType } from "../database/models/game-session.model";
import battleResultModel from "../database/models/battle-result.model";
import logWithTimestamp from "utils/logs";

export interface CreateGameSessionInput {
  enemyId: string;
  durationMinutes: number;
  startTime?: Date;
}

export interface GameSessionWithEnemy extends GameSession {
  enemy: Enemy;
}

class GameConfigService {
  async getCurrentActiveSession(): Promise<GameSessionWithEnemy | null> {
    try {
      const GameSession = gameSessionModel();
      const Enemy = enemyModel();
      
      const session = await GameSession.findOne({ isActive: true }).lean();
      
      if (!session) return null;
      
      // Manually fetch the enemy data
      const enemy = await Enemy.findById(session.enemyId).lean();
      if (!enemy) {
        throw new Error("Enemy not found for active session");
      }
      
      return {
        ...session,
        enemy: enemy as Enemy
      } as GameSessionWithEnemy;
    } catch (error) {
      logWithTimestamp(`Error getting active session: ${error}`);
      throw new Error("Failed to get active game session");
    }
  }

  async startGameSession(input: CreateGameSessionInput): Promise<GameSession> {
    try {
      const GameSession = gameSessionModel();
      const Enemy = enemyModel();

      // Check if there's already an active session
      const existingSession = await GameSession.findOne({ isActive: true });
      if (existingSession) {
        throw new Error("There is already an active game session");
      }

      // Validate enemy exists
      const enemy = await Enemy.findById(input.enemyId);
      if (!enemy) {
        throw new Error("Enemy not found");
      }

      const startTime = input.startTime || new Date();
      const scheduledEndTime = new Date(startTime.getTime() + input.durationMinutes * 60 * 1000);

      // Create new game session
      const session = new GameSession({
        enemyId: new ObjectId(input.enemyId),
        status: "ACTIVE",
        startTime,
        scheduledEndTime,
        isActive: true,
        totalDamageDealt: 0,
        totalPowerDealt: 0,
        participantCount: 0,
        battleCount: 0
      });

      await session.save();

      // Update enemy with game session reference
      await Enemy.findByIdAndUpdate(input.enemyId, {
        gameSessionId: session._id,
        isDefeated: false,
        totalDamageReceived: 0,
        totalPowerReceived: 0,
        currentHealth: enemy.maxHealth // Reset health for new session
      });

      logWithTimestamp(`Game session started: ${session._id} for enemy: ${enemy.name}`);
      return session;
    } catch (error) {
      logWithTimestamp(`Error starting game session: ${error}`);
      throw error;
    }
  }

  async endGameSession(winCondition: WinConditionType): Promise<GameSession> {
    try {
      const GameSession = gameSessionModel();
      
      const session = await GameSession.findOne({ isActive: true });
      if (!session) {
        throw new Error("No active game session found");
      }

      // Update session
      session.status = "COMPLETED";
      session.endTime = new Date();
      session.isActive = false;
      session.winCondition = winCondition;
      
      await session.save();

      // Update enemy status
      const Enemy = enemyModel();
      await Enemy.findByIdAndUpdate(session.enemyId, {
        isDefeated: winCondition === "ENEMY_DEFEATED"
      });

      logWithTimestamp(`Game session ended: ${session._id} with condition: ${winCondition}`);
      return session;
    } catch (error) {
      logWithTimestamp(`Error ending game session: ${error}`);
      throw error;
    }
  }

  async checkGameEndConditions(sessionId: ObjectId): Promise<boolean> {
    try {
      const GameSession = gameSessionModel();
      const Enemy = enemyModel();
      
      const session = await GameSession.findById(sessionId);
      if (!session || !session.isActive) return false;

      const enemy = await Enemy.findById(session.enemyId);
      if (!enemy) return false;

      // Check if enemy is defeated
      if (enemy.currentHealth <= 0) {
        await this.endGameSession("ENEMY_DEFEATED");
        return true;
      }

      // Check if time has expired
      if (new Date() >= session.scheduledEndTime) {
        await this.endGameSession("TIME_EXPIRED");
        return true;
      }

      return false;
    } catch (error) {
      logWithTimestamp(`Error checking game end conditions: ${error}`);
      return false;
    }
  }

  async getGameStatistics(sessionId?: ObjectId): Promise<{
    totalParticipants: number;
    totalBattles: number;
    totalDamage: number;
    totalPower: number;
    topDamageDealer?: { wallet: string; totalDamage: number };
  }> {
    try {
      const BattleResult = battleResultModel();
      
      let matchCondition = {};
      if (sessionId) {
        matchCondition = { gameSessionId: sessionId };
      } else {
        // Get current active session stats
        const activeSession = await this.getCurrentActiveSession();
        if (activeSession) {
          matchCondition = { gameSessionId: activeSession._id };
        }
      }

      const stats = await BattleResult.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalParticipants: { $addToSet: "$userWallet" },
            totalBattles: { $sum: 1 },
            totalDamage: { $sum: { $cond: ["$success", 1, 0] } },
            totalPower: { $sum: { $cond: ["$success", "$powerDealt", 0] } }
          }
        },
        {
          $project: {
            totalParticipants: { $size: "$totalParticipants" },
            totalBattles: 1,
            totalDamage: 1,
            totalPower: 1
          }
        }
      ]);

      // Get top damage dealer
      const topDealer = await BattleResult.aggregate([
        { $match: { ...matchCondition, success: true } },
        {
          $group: {
            _id: "$userWallet",
            totalDamage: { $sum: 1 },
            totalPower: { $sum: "$powerDealt" }
          }
        },
        { $sort: { totalPower: -1 } },
        { $limit: 1 }
      ]);

      const result = stats[0] || {
        totalParticipants: 0,
        totalBattles: 0,
        totalDamage: 0,
        totalPower: 0
      };

      if (topDealer.length > 0) {
        result.topDamageDealer = {
          wallet: topDealer[0]._id,
          totalDamage: topDealer[0].totalPower
        };
      }

      return result;
    } catch (error) {
      logWithTimestamp(`Error getting game statistics: ${error}`);
      throw new Error("Failed to get game statistics");
    }
  }
}

const gameConfigService = new GameConfigService();
export default gameConfigService;