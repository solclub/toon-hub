import type { ObjectId } from "mongodb";
import mongoose, { Schema, model } from "mongoose";

export const EnemyDifficulties = ["EASY", "MEDIUM", "HARD"] as const;
export type EnemyDifficulty = (typeof EnemyDifficulties)[number];

export const EnemyTypes = ["BOSS", "MINION", "ELITE"] as const;
export type EnemyType = (typeof EnemyTypes)[number];

export interface Enemy {
  _id: ObjectId;
  name: string;
  image: string;
  difficulty: EnemyDifficulty;
  type: EnemyType;
  maxHealth: number;
  currentHealth: number;
  gameSessionId?: ObjectId;
  isDefeated: boolean;
  totalDamageReceived: number;
  totalPowerReceived: number;
  createdAt: Date;
  updatedAt: Date;
}

const enemySchema: Schema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  difficulty: {
    type: String,
    enum: EnemyDifficulties,
    required: true,
  },
  type: {
    type: String,
    enum: EnemyTypes,
    required: true,
  },
  maxHealth: { type: Number, required: true },
  currentHealth: { type: Number, required: true },
  gameSessionId: { 
    type: Schema.Types.ObjectId, 
    ref: "GameSession",
    index: true 
  },
  isDefeated: { type: Boolean, default: false },
  totalDamageReceived: { type: Number, default: 0, min: 0 },
  totalPowerReceived: { type: Number, default: 0, min: 0 },
}, {
  timestamps: true
});

const enemyModel = () => {
  return (
    (mongoose.models?.Enemy as mongoose.Model<Enemy>) ||
    model<Enemy>("Enemy", enemySchema, "enemies")
  );
};

export default enemyModel;