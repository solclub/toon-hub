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
  price?: string;
  name: string;
  event?: () => void;
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

const Equipment = (equipment: Props) => {
  const {
    url,
    rarity,
    className,
    width,
    height,
    // profileView,
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
        "relative"
      )}
    >
      <div
        className={classNames(
          "clip-wrap aspect-square bg-[#6F5B38] bg-gradient-to-t from-[#6E5A37] to-[#BEA97E] p-1.5 hover:scale-105 hover:shadow-md hover:shadow-slate-600",
          // {
          //   "bg-gradient-to-t from-[#6E5A37] to-[#BEA97E]":
          //     !profileView && revealed,
          // },
          // {
          //   "bg-gradient-to-t from-[#6E5A37] to-[#BEA97E]":
          //     profileView && revealed,
          // },
          {
            "bg-gradient-to-t from-green-400 to-[#39eb57]": !revealed,
          }
        )}
      >
        {url && (
          <div className={classNames("clip-css relative h-full")}>
            <Image
              src={url}
              alt="Artifact equiped"
              width={width || 100}
              height={height || 100}
            ></Image>
          </div>
        )}
      </div>
      <label
        htmlFor={name}
        className="absolute top-0 left-0 z-50 block w-full cursor-pointer"
        style={{ height: height || 100 }}
      ></label>
      {!revealed && (
        <>
          <div className="absolute -bottom-2 left-0 z-50 w-full">
            <button
              onClick={event}
              className="rounded-full bg-green-400 px-3 py-1 text-xs font-thin text-black"
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
