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
  COMMON: "drop-shadow-common",
  RARE: "drop-shadow-rare",
  SUPER_RARE: "drop-shadow-super-rare",
  LEGEND: "drop-shadow-legend",
  ULTRA_LEGEND: "drop-shadow-ultra-legend",
  SECRET: "drop-shadow-secret",
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
    <div className={classNames(RarityColors[rarity])}>
      <div
        className={classNames(
          "clip-wrap drop-shadow-red aspect-square cursor-pointer  p-1.5 ",
          "bg-[#6F5B38] bg-gradient-to-t from-[#6E5A37] to-[#BEA97E]",
          className
        )}
      >
        {url && (
          <Image
            className={classNames("clip-css drop-shadow-red")}
            src={url}
            alt="Artifact equiped"
            width={100}
            height={100}
          ></Image>
        )}
      </div>
    </div>
  );
};

export default Equipment;
