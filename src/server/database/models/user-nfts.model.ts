import mongoose, { model, Schema } from "mongoose";
import { NFTType } from "./nft.model";

export enum GolemUpgrades {
  ORIGINAL = "ORIGINAL",
  REWORK = "REWORK",
  CARTOON = "CARTOON",
}

export enum DemonUpgrades {
  ORIGINAL = "ORIGINAL",
  CARTOON = "CARTOON",
}

export interface UserNFT {
  mint: string;
  wallet: string;
  current: DemonUpgrades | GolemUpgrades;
  images: Map<DemonUpgrades | GolemUpgrades | string, string>;
  type: NFTType;
  active: boolean;
}

const RudeNFTSchema = new Schema<UserNFT>({
  mint: String,
  wallet: String,
  current: {
    type: String,
    enum: [...Object.values(GolemUpgrades), ...Object.values(DemonUpgrades)],
  },
  images: { type: Map, of: String },
  type: {
    type: String,
    enum: Object.values(NFTType),
  },
  active: { type: Boolean, default: true },
});

const UserNFTsModel = {
  UserNFTsModel: () => {
    return (
      (mongoose.models?.UserNFT as mongoose.Model<UserNFT>) ||
      model<UserNFT>("UserNFT", RudeNFTSchema, "user_nfts")
    );
  },
};

export default UserNFTsModel;
