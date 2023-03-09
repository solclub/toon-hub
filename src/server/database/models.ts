import type { WithId, Document, ObjectId } from "mongodb";
import mongoose, { model, Schema } from "mongoose";

export interface IUser {
  id: string;
  WalletId: string;
  twitterVerified: boolean;
  discordVerified: boolean;
  twitterDetails: ProviderDetails | null;
  discordDetails: ProviderDetails | null;
  totalPower: number;
  totalTraining: number;
  totalWarriors: number;
  golemNumbers: number[] | null;
  golemKeys: string[] | null;
  demonNumbers: number[] | null;
  demonKeys: string[] | null;
}

export type ProviderDetails = {
  username: string;
  name: string;
  email: string;
  image: string;
  provider: string;
};

const userSchema = new Schema<IUser>();
const userModel = () => {
  return mongoose.models && mongoose.models.User
    ? mongoose.models.User
    : model<IUser>("User", userSchema);
};

export interface RudeNFT {
  id: string;
  name: string;
  mint: string;
  image: string;
  rudeScore: number;
  attributes: NFTAttribute[];
  rudeRank: number;
  localImage?: string;
  upgraded?: boolean;
  upgradedCount?: number;
}

export interface NFTAttribute extends Record<string, unknown> {
  name: string;
  value: string;
  rarity: number;
}

export interface NFTArt<T extends GolemArtsVersion | DemonArtVersion>
  extends Record<string, unknown> {
  type: T;
  image: string;
}

export interface GolemNFT extends RudeNFT {
  upgradedImagesList?: NFTArt<GolemArtsVersion>[];
}

export interface DemonNFT extends RudeNFT {
  upgradedImagesList?: NFTArt<DemonArtVersion>[];
}

export enum GolemArtsVersion {
  Legacy = "LEGACY",
  Modern = "MODERN",
  Cartoon = "CARTOON",
}

export enum DemonArtVersion {
  Modern = "MODERN",
  Cartoon = "CARTOON",
}
