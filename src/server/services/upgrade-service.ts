import type { NFTAttribute } from "server/database/models/nft.model";
import { NFTType } from "server/database/models/nft.model";
import { collectionsSchemas } from "../data/collections";
import mergeImages from "./sharp-service";
import { addUpgradedImage } from "./nfts-service";
import cloudinaryService from "./cloudinary-service";
import { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";
import { SigninMessage } from "utils/signin-message";
import { PublicKey } from "@solana/web3.js";
import { getUserPDAKey } from "./war-service";
import { toMetaplexFile } from "@metaplex-foundation/js";
import axios from "axios";
import { metaplexWithAuthority, connection } from "./connections/web3-private";
import { env } from "env/server.mjs";
import paymentService from "./payment-service";

const UpgradeServerUrl = env.METADATA_UPGRADE_SERVER_URL;
const UpgradeServerToken = env.METADATA_UPGRADE_ACCESS_TOKEN;

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
export interface UpdateMetadataRequest {
  mintAddress: string;
  wallet: string;
  serializedTx: string;
  upgradeType: string;
  collection: NFTType;
  attributes: NFTAttribute[];
}

export const confirmAndUpgradeMetadata = async (req: UpdateMetadataRequest) => {
  const result = paymentService.proccessPayment<{ signature: string; image: string }>(
    {
      mint: req.mintAddress,
      serializedTx: req.serializedTx,
      wallet: req.wallet,
    },
    async (txId: string) => {
      return await upgradeMetadata(req, txId);
    }
  );

  return result;
};

export const upgradeMetadata = async (req: UpdateMetadataRequest, txId: string) => {
  const collection =
    collectionsSchemas[req.collection.toString() as keyof typeof collectionsSchemas];

  const newArt = await buildUpgradeImage(
    req.mintAddress,
    req.collection,
    req.upgradeType,
    req.attributes
  );
  const folder = `${collection.path.toLowerCase()}/${req.upgradeType}/`;

  const tempImgUrl = await cloudinaryService.uploadImageBuffer(newArt, req.mintAddress, folder);
  const upgradeEndpoint = getMetadataUpdater(req.upgradeType, req.collection);
  const headers = {
    "access-token": UpgradeServerToken,
  };
  const reqBody = {
    mintAddress: req.mintAddress,
    upgradeType: req.upgradeType,
    owner: req.wallet,
    image: tempImgUrl,
  };

  if (!tempImgUrl) {
    throw "Unable to upload to file server";
  }

  if (!upgradeEndpoint) {
    throw "There is not an updater for a collection provided";
  }

  console.log("upgrading... ", upgradeEndpoint, JSON.stringify(reqBody, null, 2));
  const upgradeResult = await axios.post<{ signature: string; image: string }>(
    upgradeEndpoint,
    reqBody,
    { headers }
  );

  console.log("Updating db", upgradeResult.data);
  await addUpgradedImage(req.mintAddress, req.upgradeType, upgradeResult.data.image);
  console.log("done");
  return upgradeResult.data;
};

export const buildUpgradeImage = async (
  mint: string,
  collectionType: NFTType,
  upgradeType: string,
  attributes: NFTAttribute[]
): Promise<Buffer> => {
  const collection =
    collectionsSchemas[collectionType.toString() as keyof typeof collectionsSchemas];

  if (Object.keys(rebelUrl).includes(mint)) {
    const data = Buffer.from(
      (await axios.get(rebelUrl[mint] ?? "", { responseType: "arraybuffer" })).data
    );
    return data;
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
      src: getTraitFile(collection?.path, upgradeType, trait, formattedTraits),
      x: 0,
      y: 0,
      label: formattedTraits[trait],
      trait,
      addon: false,
    };
    return carry;
  }, {});

  const layers = Object.values(nftLayers).filter((x) => x.label !== "none");
  const resultBuffer = await mergeImages({ sources: layers });
  return resultBuffer;
};

const service = { upgradeMetadata, buildUpgradeImage, confirmAndUpgradeMetadata };
export default service;

const getMetadataUpdater = (upgradeType: string, collection: NFTType) => {
  const updaters = {
    [NFTType.GOLEM]: {
      [GolemUpgrades.ORIGINAL.toString()]: null,
      [GolemUpgrades.REWORK.toString()]: `${UpgradeServerUrl}/golem-upgrade-forced`,
      [GolemUpgrades.CARTOON.toString()]: null,
    },
    [NFTType.DEMON]: {
      [DemonUpgrades.ORIGINAL.toString()]: null,
      [DemonUpgrades.CARTOON.toString()]: null,
    },
  };
  return updaters[collection][upgradeType];
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
  const url = cloudinaryService.getUrlFile(
    collectionName,
    upgradeName,
    trait.toLowerCase(),
    formattedTraits[trait] ?? ""
  );

  return url;
};
