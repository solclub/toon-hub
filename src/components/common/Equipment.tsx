import React from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import classNames from "classnames";
import FrameBox, { FrameType } from "./FrameBox";

type Props = {
  url: string | StaticImageData;
  rarity: EquipmentRarity;
  className?: string;
  width?: number;
  height?: number;
  profileView?: boolean;
  revealed?: boolean;
  price?: string;
  name: string;
  event?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RarityColors: any = {
  COMMON: "drop-shadow-common",
  RARE: "drop-shadow-rare",
  EPIC: "drop-shadow-epic",
  LEGENDARY: "drop-shadow-legendary",
  MYTHIC: "drop-shadow-mythic",
  SECRET: "drop-shadow-secret",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EquipmentRarityLabels: any = {
  COMMON: "Common",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
  MYTHIC: "Mythic",
  SECRET: "Secret",
};

export enum EquipmentRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  SUPER_RARE = "SUPER_RARE",
  LEGEND = "LEGEND",
  ULTRA_LEGEND = "ULTRA_LEGEND",
  SECRET = "SECRET",
}

const Equipment = (equipment: Props) => {
  const {
    url,
    rarity,
    className,
    width,
    height,
    revealed,
    price,
    name,
    event,
  } = equipment;
  return (
    <div
      className={classNames(
        revealed ? RarityColors[rarity] : "",
        className,
        "relative "
      )}
    >
      <FrameBox frameType={!revealed ? FrameType.green : FrameType.default}>
        {url && revealed && (
          <Image
            src={url}
            alt="Artifact equiped"
            width={width || 100}
            height={height || 100}
          ></Image>
        )}
        {!revealed && (
          <div
            className={classNames(
              "flex h-full w-[100px] items-center justify-center bg-slate-900 text-6xl font-extrabold text-gray-300"
            )}
          >
            +
          </div>
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
//{ "bg-green-400 text-black": !x.revealed }
export default Equipment;
