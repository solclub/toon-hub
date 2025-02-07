import mongoose, { Schema, model } from "mongoose";

export interface FeaturedNFT {
  wallet: string;
  mint: string;
  createdAt: Date;
  featured: boolean;
  nftType: string;
  featuredDate: Date;
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
  createdAt: {
    type: Date,
    required: true,
  },
  nftType: {
    type: String,
    required: true,
  },
  featuredDate: {
    type: Date,
    required: false,
  },
  featured: {
    type: Boolean,
    required: true,
  },
});

const featuredModel = () => {
  return (
    (mongoose.models?.FeaturedNFT as mongoose.Model<FeaturedNFT>) ||
    model<FeaturedNFT>("FeaturedNFT", featuredNFTSchema, "featured_nfts")
  );
};

export default featuredModel;
