import { NFTType } from "server/database/models/nft.model";
import mongoose, { model } from "mongoose";

export enum PaymentType {
  RUDE = "RUDE",
  RUDE_BTF = "RUDE_BTF",
  SOL = "SOL",
  BTF = "BTF",
}

export enum PaymentToken {
  RUDE = "RUDE",
  SOL = "SOL",
  BTF = "BTF",
}

export enum ProductType {
  NFT_UPGRADE = "NFT_UPGRADE",
  NFT_FEATURE = "NFT_FEATURE",
  NFT_ART_SWAP = "NFT_ART_SWAP",
  WEAPONS_SLOT_1 = "WEAPONS_SLOT_1",
  WEAPONS_SLOT_2 = "WEAPONS_SLOT_2",
  WEAPONS_SLOT_3 = "WEAPONS_SLOT_3",
  WEAPONS_SLOT_4 = "WEAPONS_SLOT_4",
}

export interface PaymentOption {
  type: PaymentType;
  order: number;
  enabled: boolean;
  amounts: Amount[];
}

export interface Amount {
  token: PaymentToken;
  amount: number;
}

export interface ProductOption {
  key: string;
  name: string;
  isAvailable: boolean;
  paymentOptions?: PaymentOption[];
}

export interface Product {
  collectionName?: NFTType;
  type: ProductType;
  enabled: boolean;
  options: ProductOption[];
}

const productSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      enum: Object.values(NFTType),
    },
    type: { type: String, enum: Object.values(ProductType), required: true },
    enabled: { type: Boolean, required: true },
    options: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        isAvailable: { type: Boolean, required: true },
        paymentOptions: [
          {
            type: { type: String, enum: Object.values(PaymentType), required: true },
            order: { type: Number, required: true },
            enabled: { type: Boolean, required: true },
            amounts: [
              {
                token: { type: String, enum: Object.values(PaymentToken), required: true },
                amount: { type: Number, required: true },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const catalogModel = () => {
  return (
    (mongoose.models?.Catalog as mongoose.Model<Product>) ||
    model<Product>("Catalog", productSchema, "catalog")
  );
};

export default catalogModel;
