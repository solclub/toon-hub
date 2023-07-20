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
  slotNumber: number;
}

export interface Slot {
  status: SlotStatus;
  itemId?: Schema.Types.ObjectId;
  itemMetadata?: ItemMetadata;
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
  powerType: {
    type: String,
    enum: PowerTypes,
    required: true,
  },
  powerValue: { type: Number, required: true },
  slotNumber: { type: Number, required: true, enum: SlotStatuses },
});

const slotSchema = new Schema({
  status: { type: String, required: true },
  itemId: { type: Schema.Types.ObjectId },
  itemMetadata: { type: itemMetadataSchema },
});

const warriorEquipmentSchema = new Schema({
  warriorId: { type: String, required: true },
  ownerId: { type: String, required: true },
  slots: { type: [slotSchema], required: true },
  warriorWeaponsPower: { type: Number, required: true },
  warriorTotalPower: { type: Number, required: true },
});

const warriorEquipmentModel = () => {
  return (
    (mongoose.models?.WarriorEquipment as mongoose.Model<WarriorEquipment>) ||
    model<WarriorEquipment>("WarriorEquipment", warriorEquipmentSchema, "equipped_weapons")
  );
};

export default warriorEquipmentModel;
