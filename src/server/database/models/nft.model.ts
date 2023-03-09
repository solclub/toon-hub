import mongoose, { model, Schema } from "mongoose";

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

export interface NFTArt<T extends GolemArtEnum | DemonArtEnum>
  extends Record<string, unknown> {
  type: T;
  image: string;
}

export interface GolemNFT extends RudeNFT {
  upgradedImagesList?: NFTArt<GolemArtEnum>[];
}

export interface DemonNFT extends RudeNFT {
  upgradedImagesList?: NFTArt<DemonArtEnum>[];
}

export enum GolemArtEnum {
  Legacy = "LEGACY",
  Modern = "MODERN",
  Cartoon = "CARTOON",
}

export enum DemonArtEnum {
  Modern = "MODERN",
  Cartoon = "CARTOON",
}

// const GolemArtsEnumSchema = new Schema({
//   name: String,
//   role: {
//     type: String,
//     enum: Object.values(GolemArtEnum),
//   },
// });

// const DemonArtsEnumSchema = new Schema({
//   name: String,
//   role: {
//     type: String,
//     enum: Object.values(DemonArtEnum),
//   },
// });

const NFTAttributeSchema = new Schema<NFTAttribute>({
  name: String,
  value: String,
  rarity: Number,
});

const GolemArtVersionSchema = new Schema<NFTArt<GolemArtEnum>>({
  image: String,
  type: String,
});

const DemonArtVersionSchema = new Schema<NFTArt<DemonArtEnum>>({
  image: String,
  type: String,
});

const RudeNFTSchema = new Schema<RudeNFT>({
  id: String,
  name: String,
  mint: String,
  image: String,
  rudeScore: Number,
  attributes: [NFTAttributeSchema],
  rudeRank: Number,
  localImage: String,
  upgraded: Boolean,
  upgradedCount: Number,
});

const GolemSchema = RudeNFTSchema.discriminator(
  "GolemSchema",
  new Schema<GolemNFT>({
    upgradedImagesList: [GolemArtVersionSchema],
  })
);

const DemonSchema = RudeNFTSchema.discriminator(
  "DemonSchema",
  new Schema<DemonNFT>({
    upgradedImagesList: [DemonArtVersionSchema],
  })
);

const rudeNFTModels = {
  GolemModel: () => {
    return (
      (mongoose.models?.GolemNFT as mongoose.Model<GolemNFT>) ||
      model<GolemNFT>("GolemNFT", GolemSchema, "golems")
    );
  },
  DemonModel: () => {
    return (
      (mongoose.models?.DemonNFT as mongoose.Model<DemonNFT>) ||
      model<DemonNFT>("DemonNFT", DemonSchema, "demons")
    );
  },
};

export default rudeNFTModels;
