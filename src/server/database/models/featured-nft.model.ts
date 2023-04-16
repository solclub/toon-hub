import mongoose, { Schema, model } from "mongoose";

export interface FeaturedNFT {
  wallet: string;
  mint: string;
  lastFeatured: Date;
}

const featuredNFTSchema = new Schema({
  wallet: {
    type: String,
    required: true,
  },
  mint: {
    type: String,
    required: true,
  },
  lastFeatured: {
    type: Date,
    required: true,
  },
});

const featuredModel = () => {
  return (
    (mongoose.models?.Transactions as mongoose.Model<FeaturedNFT>) ||
    model<FeaturedNFT>("FeaturedNFT", featuredNFTSchema, "featured-nfts")
  );
};

export default featuredModel;
