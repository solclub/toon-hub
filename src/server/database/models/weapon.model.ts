import mongoose, { Schema, model } from "mongoose";

export const PowerTypes = ["fixed", "multiplier"] as const;
export type PowerType = (typeof PowerTypes)[number];

export const WeaponRarities = [
  "NONE",
  "COMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "SECRET",
] as const;
export type WeaponRarity = (typeof WeaponRarities)[number];

export interface Weapon {
  name: string;
  image: string;
  rarity: WeaponRarity;
  powerType: PowerType;
  powerValue: number;
  slotNumber: number;
  dropRate: number;
}

const weaponSchema: Schema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  rarity: {
    type: String,
    enum: WeaponRarities,
    required: true,
  },
  powerType: { type: String, enum: PowerTypes, required: true },
  powerValue: { type: Number, required: true },
  slotNumber: { type: Number, required: true },
  dropRate: { type: Number, required: true },
});

const weaponModel = () => {
  return (
    (mongoose.models?.Weapon as mongoose.Model<Weapon>) ||
    model<Weapon>("Weapon", weaponSchema, "weapons")
  );
};

export default weaponModel;
