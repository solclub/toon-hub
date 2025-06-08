import type { ObjectId } from "mongodb";
import mongoose, { Schema, model } from "mongoose";

export interface BattleResult {
  _id: ObjectId;
  characterMint: string;
  userWallet: string;
  enemyId: ObjectId;
  gameSessionId: ObjectId;
  powerDealt: number;
  characterPower: number;
  success: boolean;
  timestamp: Date;
  characterName?: string;
  characterType?: "GOLEM" | "DEMON";
}

const battleResultSchema: Schema = new Schema({
  characterMint: { type: String, required: true, index: true },
  userWallet: { type: String, required: true, index: true },
  enemyId: { type: Schema.Types.ObjectId, required: true, ref: "Enemy", index: true },
  gameSessionId: { type: Schema.Types.ObjectId, required: true, ref: "GameSession", index: true },
  powerDealt: { type: Number, required: true, min: 0 },
  characterPower: { type: Number, required: true, min: 0 },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  characterName: { type: String },
  characterType: { type: String, enum: ["GOLEM", "DEMON"] },
});

// Compound indexes for efficient queries
battleResultSchema.index({ enemyId: 1, timestamp: -1 });
battleResultSchema.index({ gameSessionId: 1, success: 1 });
battleResultSchema.index({ userWallet: 1, gameSessionId: 1 });

const battleResultModel = () => {
  return (
    (mongoose.models?.BattleResult as mongoose.Model<BattleResult>) ||
    model<BattleResult>("BattleResult", battleResultSchema, "battle_results")
  );
};

export default battleResultModel;