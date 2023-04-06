import type { NFTType } from "server/database/models/nft.model";

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
  collection?: NFTType;
  type: ProductType;
  enabled: boolean;
  options: ProductOption[];
}
