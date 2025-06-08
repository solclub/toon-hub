import type { ObjectId } from "mongodb";
import mongoose, { Schema, model } from "mongoose";

export const GameSessionStatus = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export type GameSessionStatusType = (typeof GameSessionStatus)[number];

export const WinCondition = ["ENEMY_DEFEATED", "TIME_EXPIRED", "MANUAL_END"] as const;
export type WinConditionType = (typeof WinCondition)[number];

export interface GameSession {
  _id: ObjectId;
  enemyId: ObjectId;
  status: GameSessionStatusType;
  startTime: Date;
  endTime?: Date;
  scheduledEndTime: Date;
  totalDamageDealt: number;
  totalPowerDealt: number;
  participantCount: number;
  battleCount: number;
  winCondition?: WinConditionType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gameSessionSchema: Schema = new Schema({
  enemyId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: "Enemy",
    index: true 
  },
  status: {
    type: String,
    enum: GameSessionStatus,
    default: "PENDING",
    required: true
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  scheduledEndTime: { type: Date, required: true },
  totalDamageDealt: { type: Number, default: 0, min: 0 },
  totalPowerDealt: { type: Number, default: 0, min: 0 },
  participantCount: { type: Number, default: 0, min: 0 },
  battleCount: { type: Number, default: 0, min: 0 },
  winCondition: {
    type: String,
    enum: WinCondition
  },
  isActive: { type: Boolean, default: false, index: true },
}, {
  timestamps: true
});

// Ensure only one active session at a time
gameSessionSchema.index({ isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});

gameSessionSchema.index({ status: 1, startTime: -1 });

const gameSessionModel = () => {
  return (
    (mongoose.models?.GameSession as mongoose.Model<GameSession>) ||
    model<GameSession>("GameSession", gameSessionSchema, "game_sessions")
  );
};

export default gameSessionModel;