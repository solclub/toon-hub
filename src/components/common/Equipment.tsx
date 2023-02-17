import React from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import classNames from "classnames";

type Props = {
  url: string | StaticImageData;
  rarity: EquipmentRarity;
  className?: string;
  width?: number;
  height?: number;
  profileView?: boolean;
  revealed?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RarityColors: any = {
  COMMON: "drop-shadow-common",
  RARE: "drop-shadow-rare",
  SUPER_RARE: "drop-shadow-super-rare",
  LEGEND: "drop-shadow-legend",
  ULTRA_LEGEND: "drop-shadow-ultra-legend",
  SECRET: "drop-shadow-secret",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EquipmentRarityLabels: any = {
  COMMON: "Common",
  RARE: "Rare",
  SUPER_RARE: "Super Rare",
  LEGEND: "Legend",
  ULTRA_LEGEND: "Ultra Legend",
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

const Equipment = ({
  url,
  rarity,
  className,
  width,
  height,
  profileView,
  revealed,
}: Props) => {
  return (
    <div
      className={classNames(
        revealed ? RarityColors[rarity] : "",
        className,
        "relative"
      )}
    >
      <div
        className={classNames(
          "clip-wrap drop-shadow-red aspect-square cursor-pointer p-1.5 ",
          {
            " bg-gradient-to-t from-[#6E5A37] to-[#BEA97E]":
              !profileView && !revealed,
          },
          {
            " bg-gradient-to-t from-[#3a3732] to-[#5e5d5c]":
              profileView && revealed,
          },
          {
            "bg-gradient-to-t from-green-400 to-[#39eb57]": !revealed,
          }
        )}
      >
        {url && (
          <Image
            className={classNames("clip-css drop-shadow-red")}
            src={url}
            alt="Artifact equiped"
            width={width || 100}
            height={height || 100}
          ></Image>
        )}
      </div>
      {!revealed && (
        <button className="absolute -bottom-1 left-0 z-50 w-full">
          <label className=" rounded-full bg-green-400 px-3 text-xs font-thin text-black">
            buy
          </label>
        </button>
      )}
    </div>
  );
};
//{ "bg-green-400 text-black": !x.revealed }
export default Equipment;
