import type { StaticImageData } from "next/image";
import type { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";

export enum PriceUnit {
  RUDE = "RUDE",
  SOL = "SOL",
}

export type NFTUpgrade = {
  name: string;
  type: GolemUpgrades | DemonUpgrades;
  price: number;
  priceUnit: PriceUnit;
};

export type Weapon = {
  image: string | StaticImageData;
  name: string;
  points: number;
  price: string;
  rarity: string;
  expireDate: Date;
  owned: boolean;
};
