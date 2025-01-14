import React from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import classNames from "classnames";
import type { WeaponRarity } from "server/database/models/weapon.model";
import EmptyWeaponImage from "assets/weapons/no-weapon.png";
import styled from "styled-components";
import rareLootBg from "assets/images/rareLootBg.png";
import epicLootBg from "assets/images/epicLootBg.png";
import mythicLootBg from "assets/images/mythicLootBg.png";
import legendaryLootBg from "assets/images/legendaryLootBg.png";

type Props = {
  url?: string | StaticImageData | undefined;
  rarity?: WeaponRarity;
  className?: string;
  name?: string;
};

const Equipment = (equipment: Props) => {
  const { url, rarity, className, name } = equipment;
  return (
    <Container $rarity={rarity || "NONE"} className={classNames(className, "relative rounded-2xl w-28 h-28")}>
      <Image src={url ?? EmptyWeaponImage} alt={name ?? "empty"} fill className="object-cover" />
    </Container>
  );
};

const Container = styled.div<{ $rarity: WeaponRarity }>`
  background: ${({ $rarity }) => `url(${{
    "NONE": EmptyWeaponImage.src,
    "COMMON": EmptyWeaponImage.src,
    "RARE": rareLootBg.src,
    "EPIC": epicLootBg.src,
    "MYTHIC": mythicLootBg.src,
    "LEGENDARY": legendaryLootBg.src,
    "SECRET": EmptyWeaponImage.src,
  }[$rarity]
    }) bottom/cover no-repeat`};
  border-bottom: 4px solid ${({ $rarity }) => ({
    "NONE": "transparent",
    "COMMON": "transparent",
    "RARE": "#1fe5fd",
    "EPIC": "#ed3dff",
    "MYTHIC": "#fd3b51",
    "LEGENDARY": "#fd8935",
    "SECRET": "transparent",
  }[$rarity])};
`;

export default Equipment;