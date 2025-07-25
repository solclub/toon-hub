import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc/trpc-context";
import enemyModel, { type EnemyDifficulty } from "../database/models/enemy.model";
import battleResultModel from "../database/models/battle-result.model";
import gameSessionModel from "../database/models/game-session.model";
import gameConfigService from "../services/game-config-service";
import { getUserNFTbyMint } from "../services/nfts-service";
import logWithTimestamp from "utils/logs";
import { ObjectId } from "mongodb";
import { Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, SystemInstruction } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, decodeTransferInstruction } from "@solana/spl-token";
import { connection } from "../services/connections/web3-public";
import { env as clientEnv } from "env/client.mjs";

const getWinProbability = (difficulty: EnemyDifficulty): number => {
  switch (difficulty) {
    case "EASY":
      return 0.7;
    case "MEDIUM":
      return 0.5;
    case "HARD":
      return 0.3;
    default:
      return 0.5;
  }
};

interface BattleOutcome {
  characterMint: string;
  characterName: string;
  characterPower: number;
  success: boolean;
  powerDealt: number;
}

export const conquestRouter = router({
  getCurrentActiveGame: publicProcedure.query(async () => {
    try {
      const gameSession = await gameConfigService.getCurrentActiveSession();
      if (!gameSession) {
        return { 
          hasActiveGame: false, 
          enemy: null, 
          session: null 
        };
      }

      const stats = await gameConfigService.getGameStatistics(gameSession._id);
      
      return {
        hasActiveGame: true,
        enemy: gameSession.enemy,
        session: {
          ...gameSession,
          stats
        }
      };
    } catch (error) {
      logWithTimestamp(`Error fetching active game: ${error}`);
      throw new Error("Failed to fetch active game");
    }
  }),

  getCurrentEnemy: publicProcedure.query(async () => {
    try {
      const gameSession = await gameConfigService.getCurrentActiveSession();
      if (!gameSession) {
        throw new Error("No active game session");
      }
      return gameSession.enemy;
    } catch (error) {
      logWithTimestamp(`Error fetching current enemy: ${error}`);
      throw new Error("Failed to fetch current enemy");
    }
  }),

  attackEnemy: protectedProcedure
    .input(
      z.object({
        enemyId: z.string(),
        characterMints: z.array(z.string()).min(1).max(20),
        isBulkAttack: z.boolean(),
        serializedTransaction: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userWallet = ctx.session.user.walletId;
        if (!userWallet) {
          throw new Error("User wallet not found");
        }

        // Get active game session
        const gameSession = await gameConfigService.getCurrentActiveSession();
        if (!gameSession || !gameSession.isActive) {
          throw new Error("No active game session");
        }

        // Validate enemy belongs to current session
        if (gameSession.enemy._id.toString() !== input.enemyId) {
          throw new Error("Enemy does not belong to current game session");
        }

        // Check if enemy is already defeated
        if (gameSession.enemy.isDefeated || gameSession.enemy.currentHealth <= 0) {
          throw new Error("Enemy is already defeated");
        }

        // Verify payment transaction
        try {
          const paymentResult = await verifyPaymentTransaction(
            input.serializedTransaction,
            userWallet,
            input.isBulkAttack
          );
          if (!paymentResult.valid) {
            throw new Error(paymentResult.error || "Payment verification failed");
          }
        } catch (error) {
          throw new Error(`Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }

        // Validate and get character data
        const characterData = await Promise.all(
          input.characterMints.map(async (mint) => {
            const nftData = await getUserNFTbyMint(userWallet, mint);
            if (!nftData || !nftData.mint) {
              throw new Error(`Character ${mint} not found or not owned by user`);
            }
            return {
              mint: nftData.mint,
              name: nftData.name,
              power: nftData.power || nftData.rudeScore || 100, // Fallback to rudeScore or 100
              type: nftData.type
            };
          })
        );

        const winProbability = getWinProbability(gameSession.enemy.difficulty);
        const battleOutcomes: BattleOutcome[] = [];
        const combatLog: string[] = [];
        let totalPowerDealt = 0;
        let totalDamageDealt = 0;

        // Process battles
        for (const character of characterData) {
          const success = Math.random() < winProbability;
          const powerDealt = success ? character.power : 0;
          
          battleOutcomes.push({
            characterMint: character.mint,
            characterName: character.name,
            characterPower: character.power,
            success,
            powerDealt
          });

          if (success) {
            totalPowerDealt += powerDealt;
            totalDamageDealt += 1; // Each successful hit = 1 damage point
            combatLog.push(`${character.name} hit for ${powerDealt} power!`);
          } else {
            combatLog.push(`${character.name} missed the enemy.`);
          }

          // Store battle result for all attempts (both wins and losses)
          const battleResult = new (battleResultModel())({
            characterMint: character.mint,
            userWallet,
            enemyId: new ObjectId(input.enemyId),
            gameSessionId: gameSession._id,
            powerDealt,
            characterPower: character.power,
            success: success,
            characterName: character.name,
            characterType: character.type
          });
          await battleResult.save();
        }

        // Update enemy health and stats
        const Enemy = enemyModel();
        const updatedEnemy = await Enemy.findByIdAndUpdate(
          input.enemyId,
          {
            $inc: {
              totalDamageReceived: totalDamageDealt,
              totalPowerReceived: totalPowerDealt,
              currentHealth: -totalDamageDealt
            }
          },
          { new: true }
        );

        if (!updatedEnemy) {
          throw new Error("Failed to update enemy");
        }

        // Update game session stats
        const GameSession = gameSessionModel();
        await GameSession.findByIdAndUpdate(gameSession._id, {
          $inc: {
            totalDamageDealt: totalDamageDealt,
            totalPowerDealt: totalPowerDealt,
            battleCount: battleOutcomes.length,
            participantCount: 1 // This will be deduplicated in real aggregations
          }
        });

        // Ensure health doesn't go below 0
        if (updatedEnemy.currentHealth < 0) {
          updatedEnemy.currentHealth = 0;
          await updatedEnemy.save();
        }

        combatLog.push(`Total power dealt: ${totalPowerDealt}`);
        combatLog.push(`Total damage dealt: ${totalDamageDealt}`);
        
        // Check if enemy is defeated
        if (updatedEnemy.currentHealth <= 0) {
          combatLog.push("🎉 Enemy defeated! Victory!");
          await gameConfigService.endGameSession("ENEMY_DEFEATED");
        }

        // Check other end conditions
        await gameConfigService.checkGameEndConditions(gameSession._id);

        return {
          enemy: updatedEnemy,
          battleOutcomes,
          combatLog,
          totalPowerDealt,
          totalDamageDealt,
          gameEnded: updatedEnemy.currentHealth <= 0
        };

      } catch (error) {
        logWithTimestamp(`Error in attackEnemy: ${error}`);
        throw error;
      }
    }),

  getUserBattleStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userWallet = ctx.session.user.walletId;
      if (!userWallet) {
        throw new Error("User wallet not found");
      }

      const gameSession = await gameConfigService.getCurrentActiveSession();
      if (!gameSession) {
        return {
          totalBattles: 0,
          totalWins: 0,
          totalPowerDealt: 0,
          winRate: 0
        };
      }

      const BattleResult = battleResultModel();
      const stats = await BattleResult.aggregate([
        { 
          $match: { 
            userWallet, 
            gameSessionId: gameSession._id 
          } 
        },
        {
          $group: {
            _id: null,
            totalBattles: { $sum: 1 },
            totalWins: { $sum: { $cond: ["$success", 1, 0] } },
            totalPowerDealt: { $sum: "$powerDealt" }
          }
        }
      ]);

      // Get best performing warrior
      const bestWarrior = await BattleResult.aggregate([
        { 
          $match: { 
            userWallet, 
            gameSessionId: gameSession._id 
          } 
        },
        {
          $group: {
            _id: "$characterMint",
            totalDamage: { $sum: "$powerDealt" },
            characterName: { $first: "$characterName" },
            characterType: { $first: "$characterType" },
            battles: { $sum: 1 }
          }
        },
        { $sort: { totalDamage: -1 } },
        { $limit: 1 }
      ]);

      const result = stats[0] || {
        totalBattles: 0,
        totalWins: 0,
        totalPowerDealt: 0
      };

      return {
        ...result,
        winRate: result.totalBattles > 0 ? (result.totalWins / result.totalBattles) : 0,
        bestWarrior: bestWarrior[0] || null
      };

    } catch (error) {
      logWithTimestamp(`Error getting user battle stats: ${error}`);
      throw new Error("Failed to get user battle stats");
    }
  }),

  getGameLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50)
      })
    )
    .query(async ({ input }) => {
      try {
        const gameSession = await gameConfigService.getCurrentActiveSession();
        if (!gameSession) {
          return [];
        }

        const BattleResult = battleResultModel();
        const leaderboard = await BattleResult.aggregate([
          { 
            $match: { 
              gameSessionId: gameSession._id,
              success: true 
            } 
          },
          {
            $group: {
              _id: "$userWallet",
              totalWins: { $sum: 1 },
              totalPowerDealt: { $sum: "$powerDealt" },
              bestCharacter: { $first: "$characterName" },
              lastBattle: { $max: "$timestamp" }
            }
          },
          { $sort: { totalPowerDealt: -1, totalWins: -1 } },
          { $limit: input.limit },
          {
            $project: {
              userWallet: "$_id",
              totalWins: 1,
              totalPowerDealt: 1,
              bestCharacter: 1,
              lastBattle: 1,
              _id: 0
            }
          }
        ]);

        return leaderboard.map((entry, index) => ({
          rank: index + 1,
          ...entry
        }));

      } catch (error) {
        logWithTimestamp(`Error getting game leaderboard: ${error}`);
        throw new Error("Failed to get game leaderboard");
      }
    }),
});

// Payment verification function
interface PaymentVerificationResult {
  valid: boolean;
  error?: string;
  txSignature?: string;
}

async function verifyPaymentTransaction(
  serializedTransaction: string,
  userWallet: string,
  isBulkAttack: boolean
): Promise<PaymentVerificationResult> {
  try {
    // Deserialize the transaction
    const transactionBuffer = Buffer.from(serializedTransaction, "base64");
    const transaction = Transaction.from(transactionBuffer);
    
    // Define expected amounts
    const expectedRudeAmount = 100; // 100 RUDE for simple fight
    const expectedSolAmount = 0.01; // 0.01 SOL for bulk fight
    
    // Get treasury wallets (where payments go)
    const rudeTreasuryWallet = new PublicKey(clientEnv.NEXT_PUBLIC_RUDE_SINK_KEY);
    const solTreasuryWallet = new PublicKey(clientEnv.NEXT_PUBLIC_SOLANA_SINK_KEY);
    const userPublicKey = new PublicKey(userWallet);
    
    // Verify the fee payer is set correctly (should be the user wallet)
    if (!transaction.feePayer || !transaction.feePayer.equals(userPublicKey)) {
      return { valid: false, error: "Invalid transaction fee payer" };
    }
    
    if (isBulkAttack) {
      // Verify SOL payment for bulk attack
      const solTransferInstruction = transaction.instructions.find(instruction => {
        // Check if it's a system transfer instruction (SOL transfer)
        return instruction.programId.equals(SystemProgram.programId);
      });
      
      if (!solTransferInstruction) {
        return { valid: false, error: "No SOL transfer instruction found" };
      }
      
      // Parse the instruction data to verify amount and recipient
      try {
        const decodedInstruction = SystemInstruction.decodeTransfer(solTransferInstruction);
        const expectedLamports = expectedSolAmount * LAMPORTS_PER_SOL;
        
        // Verify the transfer amount  
        if (decodedInstruction.lamports.toString() !== expectedLamports.toString()) {
          return { 
            valid: false, 
            error: `Invalid SOL amount. Expected: ${expectedLamports} lamports, got: ${decodedInstruction.lamports}` 
          };
        }
        
        // Verify the recipient (treasury wallet)
        if (!decodedInstruction.toPubkey.equals(solTreasuryWallet)) {
          return { valid: false, error: "Invalid SOL transfer recipient" };
        }
        
        // Verify the sender (user wallet)
        if (!decodedInstruction.fromPubkey.equals(userPublicKey)) {
          return { valid: false, error: "Invalid SOL transfer sender" };
        }
        
      } catch (parseError) {
        return { valid: false, error: "Failed to parse SOL transfer instruction" };
      }
      
    } else {
      // Verify RUDE token payment for simple fight
      const rudeMintKey = new PublicKey(clientEnv.NEXT_PUBLIC_RUDE_TOKEN_KEY);
      const userRudeAta = await getAssociatedTokenAddress(rudeMintKey, userPublicKey);
      const treasuryRudeAta = await getAssociatedTokenAddress(rudeMintKey, rudeTreasuryWallet);
      
      const tokenTransferInstruction = transaction.instructions.find(instruction => {
        return instruction.programId.equals(TOKEN_PROGRAM_ID);
      });
      
      if (!tokenTransferInstruction) {
        return { valid: false, error: "No RUDE token transfer instruction found" };
      }
      
      // Verify token transfer instruction details
      try {
        const decodedTransfer = decodeTransferInstruction(tokenTransferInstruction);
        
        // RUDE tokens have 9 decimals, so 100 tokens = 100 * 10^9
        const expectedTokenAmount = BigInt(expectedRudeAmount) * BigInt(Math.pow(10, 9));
        
        // Verify the transfer amount
        if (decodedTransfer.data.amount !== expectedTokenAmount) {
          return { 
            valid: false, 
            error: `Invalid RUDE token amount. Expected: ${expectedTokenAmount.toString()}, got: ${decodedTransfer.data.amount.toString()}` 
          };
        }
        
        // Verify source account (user's RUDE ATA)
        if (!decodedTransfer.keys.source.pubkey.equals(userRudeAta)) {
          return { valid: false, error: "Invalid token transfer source account" };
        }
        
        // Verify destination account (treasury RUDE ATA)
        if (!decodedTransfer.keys.destination.pubkey.equals(treasuryRudeAta)) {
          return { valid: false, error: "Invalid token transfer destination account" };
        }
        
        // Verify authority (user wallet)
        if (!decodedTransfer.keys.owner.pubkey.equals(userPublicKey)) {
          return { valid: false, error: "Invalid token transfer authority" };
        }
        
      } catch (parseError) {
        return { valid: false, error: "Failed to parse RUDE token transfer instruction" };
      }
    }
    
    // Verify the transaction has a recent blockhash
    if (!transaction.recentBlockhash) {
      return { valid: false, error: "Transaction missing recent blockhash" };
    }
    
    // Send the transaction to the blockchain using the original serialized bytes
    // Note: The transaction should be already signed by the client
    const signature = await connection.sendRawTransaction(transactionBuffer, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    
    // Wait for confirmation
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
    
    logWithTimestamp(`Payment transaction confirmed: ${signature}`);
    
    return {
      valid: true,
      txSignature: signature,
    };
    
  } catch (error) {
    logWithTimestamp(`Payment verification failed: ${error}`);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown payment error"
    };
  }
}