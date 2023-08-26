import React from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import classNames from "classnames";
import FrameBox, { FrameType } from "./FrameBox";
import type { WeaponRarity } from "server/database/models/weapon.model";
import EmptyWeaponImage from "assets/weapons/no-weapon.png";

type Props = {
  url?: string | StaticImageData | undefined;
  rarity?: WeaponRarity;
  className?: string;
  name?: string;
};

const RarityColors: Record<WeaponRarity, string> = {
  NONE: "drop-shadow-none",
  COMMON: "drop-shadow-common",
  RARE: "drop-shadow-rare",
  EPIC: "drop-shadow-epic",
  LEGENDARY: "drop-shadow-legendary",
  MYTHIC: "drop-shadow-mythic",
  SECRET: "drop-shadow-secret",
};

export const EquipmentRarityLabels: Record<WeaponRarity, string> = {
  NONE: "None",
  COMMON: "Common",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
  MYTHIC: "Mythic",
  SECRET: "Secret",
};
export type EquipmentRarityLabelsType = keyof typeof EquipmentRarityLabels;

const Equipment = (equipment: Props) => {
  const { url, rarity, className, name } = equipment;
  return (
    <div className={classNames(RarityColors[rarity ?? "NONE"], className, "relative ")}>
      <FrameBox frameType={FrameType.default}>
        <Image src={url ?? EmptyWeaponImage} alt={name ?? "empty"} width={100} height={100}></Image>

        <label
          htmlFor={name}
          className="absolute top-0 left-0 z-50 block w-full cursor-pointer"
          style={{ height: 100 }}
        ></label>
      </FrameBox>
    </div>
  );
};
export default Equipment;
