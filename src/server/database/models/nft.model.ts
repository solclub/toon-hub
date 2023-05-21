import mongoose, { model, Schema } from "mongoose";

export enum NFTType {
  GOLEM = "GOLEM",
  DEMON = "DEMON",
}

export enum GolemUpgrades {
  ORIGINAL = "ORIGINAL",
  REWORK = "REWORK",
  CARTOON = "CARTOON",
}

export enum DemonUpgrades {
  ORIGINAL = "ORIGINAL",
  CARTOON = "CARTOON",
}
export interface RudeNFT {
  id: string;
  name: string;
  mint: string;
  image: string;
  rudeScore: number;
  attributes: NFTAttribute[];
  current: DemonUpgrades | GolemUpgrades;
  images: Map<DemonUpgrades | GolemUpgrades | string, string>;
  type?: NFTType;
  rudeRank: number;
  tier?: number;
  power?: number;
}

export interface NFTAttribute extends Record<string, unknown> {
  name: string;
  value: string;
  rarity: number;
}

export const NFTAttributeSchema = new Schema<NFTAttribute>({
  name: String,
  value: String,
  rarity: Number,
});

const RudeNFTSchema = new Schema<RudeNFT>({
  id: String,
  name: String,
  mint: String,
  image: String,
  rudeScore: Number,
  attributes: [NFTAttributeSchema],
  current: {
    type: String,
    enum: [...Object.values(GolemUpgrades), ...Object.values(DemonUpgrades)],
  },
  images: { type: Map, of: String },
  rudeRank: Number,

  type: {
    type: String,
    enum: Object.values(NFTType),
  },
  tier: Number,
  power: Number,
});

const rudeNFTModels = {
  GolemModel: () => {
    return (
      (mongoose.models?.GolemNFT as mongoose.Model<RudeNFT>) ||
      model<RudeNFT>("GolemNFT", RudeNFTSchema, "golems")
    );
  },
  DemonModel: () => {
    return (
      (mongoose.models?.DemonNFT as mongoose.Model<RudeNFT>) ||
      model<RudeNFT>("DemonNFT", RudeNFTSchema, "demons")
    );
  },
};

export default rudeNFTModels;
