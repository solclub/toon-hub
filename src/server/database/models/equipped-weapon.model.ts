import mongoose, { model, Schema } from "mongoose";
import type { PowerType } from "./weapon.model";
import { PowerTypes, WeaponRarities, type WeaponRarity } from "./weapon.model";

const SlotStatuses = ["revealed", "unlocked", "locked"] as const;
export type SlotStatus = (typeof SlotStatuses)[number];

export interface ItemMetadata {
  name?: string;
  image?: string;
  rarity?: WeaponRarity;
  powerType?: PowerType;
  powerValue?: number;
  computedPowerValue?: number;
  slotNumber: number;
}

export interface Slot {
  status: SlotStatus;
  itemId?: string;
  itemMetadata?: ItemMetadata;
  updatedAt?: Date;
}

export interface WarriorEquipment {
  warriorId: string;
  ownerId: string;
  slots: Slot[];
  warriorWeaponsPower: number;
  warriorTotalPower: number;
}

const itemMetadataSchema = new Schema({
  rarity: { type: String, required: true, enum: WeaponRarities },
  name: { type: String, required: true },
  image: { type: String, required: true },
  powerType: {
    type: String,
    enum: PowerTypes,
    required: true,
  },
  powerValue: { type: Number, required: true },
  computedPowerValue: { type: Number, required: true },
  slotNumber: { type: Number, required: true },
});

const slotSchema = new Schema({
  status: { type: String, required: true, enum: SlotStatuses },
  itemId: { type: String },
  itemMetadata: { type: itemMetadataSchema },
  updatedAt: { type: Date },
});

const warriorEquipmentSchema = new Schema({
  warriorId: { type: String, required: true },
  ownerId: { type: String, required: true },
  slots: { type: [slotSchema], required: true },
  warriorWeaponsPower: { type: Number, required: true },
  warriorTotalPower: { type: Number, required: true },
});

const WarriorEquipmentModel = () => {
  return (
    (mongoose.models?.WarriorEquipment as mongoose.Model<WarriorEquipment>) ||
    model<WarriorEquipment>("WarriorEquipment", warriorEquipmentSchema, "equipped_weapons")
  );
};

export default WarriorEquipmentModel;
