import React from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import classNames from "classnames";

type Props = {
  url: string | StaticImageData;
  rarity: EquipmentRarity;
  className: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RarityColors: any = {
  COMMON: "shadow-stale-800",
  RARE: "shadow-blue-800",
  SUPER_RARE: "shadow-purple-800",
  LEGEND: "shadow-yellow-800",
  ULTRA_LEGEND: "shadow-red-800",
  SECRET: "shadow-pink-800",
};

export enum EquipmentRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  SUPER_RARE = "SUPER_RARE",
  LEGEND = "LEGEND",
  ULTRA_LEGEND = "ULTRA_LEGEND",
  SECRET = "SECRET",
}

const Equipment = ({ url, rarity, className }: Props) => {
  return (
    <div
      className={classNames(
        "equipment-frame red aspect-square cursor-pointer shadow-[-2px_2px_10px_5px]",
        RarityColors[rarity.toString()],
        className
      )}
    >
      <Image
        className="fill"
        src={url}
        alt="Artifact equiped"
        width={100}
        height={100}
      ></Image>
    </div>
  );
};

export default Equipment;
