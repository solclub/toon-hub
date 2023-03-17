import mongoose, { model, Schema } from "mongoose";

export interface RudeNFT {
  id: string;
  name: string;
  mint: string;
  image: string;
  rudeScore: number;
  attributes: NFTAttribute[];
  rudeRank: number;
}

export interface NFTAttribute extends Record<string, unknown> {
  name: string;
  value: string;
  rarity: number;
}

const NFTAttributeSchema = new Schema<NFTAttribute>({
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
  rudeRank: Number,
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
