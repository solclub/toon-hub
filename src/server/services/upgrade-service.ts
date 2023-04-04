import type { NFTAttribute, NFTType } from "server/database/models/nft.model";
import { collectionsSchemas } from "../data/collections";
import mergeImages from "../services/sharp-service";
import { saveFileToCloud } from "./cloudinary-service";
import type { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";

const rebelUrl: Record<string, string> = {
  "2RvZ76hT5uSe7URDnWDwjnGJhisSPHxJyEi9rdrCAYEh":
    "https://res.cloudinary.com/dfniu7jks/image/upload/v1669889195/rudeGolems/golemUpgrades/2RvZ76hT5uSe7URDnWDwjnGJhisSPHxJyEi9rdrCAYEh.png",
  "8eN83ygKCGpkbkSh61Ajzxzv9aUTqTCMnu6NpffwGrMH":
    "https://res.cloudinary.com/dfniu7jks/image/upload/v1669889241/rudeGolems/golemUpgrades/8eN83ygKCGpkbkSh61Ajzxzv9aUTqTCMnu6NpffwGrMH.png",
};

interface NFTLayer {
  [trait: string]: {
    src: string;
    x: number;
    y: number;
    label?: string;
    trait: string;
    addon: boolean;
  };
}

export const buildUpgradeImage = async (
  mint: string,
  collectionType: NFTType,
  upgradeType: DemonUpgrades | GolemUpgrades,
  attributes: NFTAttribute[]
): Promise<string | unknown> => {
  const collection =
    collectionsSchemas[collectionType.toString() as keyof typeof collectionsSchemas];

  if (Object.keys(rebelUrl).includes(mint)) {
    const imageUploadedUrl = rebelUrl[mint];
    return imageUploadedUrl;
  }

  const formattedTraits: Record<string, string> = attributes.reduce(
    (acc: Record<string, string>, attribute: NFTAttribute) => {
      acc[normalizeTrait(attribute.name)] = normalizeTrait(attribute.value.toString());
      return acc;
    },
    {}
  );

  const nftLayers: NFTLayer = collection.traitsOrder.reduce((carry: NFTLayer, trait) => {
    carry[trait] = {
      src: getTraitFile(collection?.path, upgradeType.toString(), trait, formattedTraits),
      x: 0,
      y: 0,
      label: formattedTraits[trait],
      trait,
      addon: false,
    };
    return carry;
  }, {});

  const layers = Object.values(nftLayers).filter((x) => x.label !== "none");
  const mergedData = await mergeImages({ sources: layers });
  const imageUploadedUrl = await saveFileToCloud(
    mergedData.base,
    mint,
    `${collection?.path}/upgrades/${upgradeType}`
  );
  return imageUploadedUrl;
};

const normalizeTrait = (str: string) => {
  return str
    .replace(/[\s\-\/]/g, "_")
    .replace(/'/g, "")
    .toLocaleLowerCase();
};

const getTraitFile = (
  collectionName: string,
  upgradeName: string,
  trait: string,
  formattedTraits: Record<string, string>
) => {
  const url = `src/assets/traits/${collectionName}/${upgradeName}/${trait.toLowerCase()}/${
    formattedTraits[trait]
  }.png`;

  return url;
};
