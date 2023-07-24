import React from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import classNames from "classnames";
import FrameBox, { FrameType } from "./FrameBox";
import type { WeaponRarity } from "server/database/models/weapon.model";

type Props = {
  url: string | StaticImageData;
  rarity: WeaponRarity;
  className?: string;
  width?: number;
  height?: number;
  profileView?: boolean;
  revealed?: boolean;
  price?: string;
  name: string;
  event?: () => void;
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

const Equipment = (equipment: Props) => {
  const { url, rarity, className, width, height, revealed, price, name, event } = equipment;
  return (
    <div className={classNames(RarityColors[rarity], className, "relative ")}>
      <FrameBox frameType={!revealed ? FrameType.green : FrameType.default}>
        {url && (
          <Image src={url} alt="weapon equiped" width={width || 100} height={height || 100}></Image>
        )}

        <label
          htmlFor={name}
          className="absolute top-0 left-0 z-50 block w-full cursor-pointer"
          style={{ height: height || 100 }}
        ></label>
      </FrameBox>
      {!revealed && (
        <>
          <div className="absolute -bottom-2 left-0 z-50 w-full">
            <button
              onClick={event}
              className="z-50 rounded-full bg-green-400 px-3 py-1 text-xs font-thin text-black"
            >
              buy
            </button>
          </div>
          <div className="absolute top-4 w-full text-green-400">{price}</div>
        </>
      )}
    </div>
  );
};
export default Equipment;
