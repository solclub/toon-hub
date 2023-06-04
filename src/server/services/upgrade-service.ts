import type { NFTAttribute } from "server/database/models/nft.model";
import { NFTType } from "server/database/models/nft.model";
import { collectionsSchemas } from "../data/collections";
import mergeImages from "./sharp-service";
import { addUpgradedImage, getUserNFTbyMint } from "./nfts-service";
import cloudinaryService from "./cloudinary-service";
import { DemonUpgrades, GolemUpgrades } from "server/database/models/nft.model";
import axios from "axios";
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
  verifiedOwner: string;
  serializedTx: string;
  upgradeType: string;
  collection: NFTType;
  attributes: NFTAttribute[];
}

export interface SwapArtMetadataRequest {
  mintAddress: string;
  wallet: string;
  verifiedOwner: string;
  serializedTx: string;
  upgradeType: string;
  collection: NFTType;
}

export const confirmAndUpgradeMetadata = async (req: UpdateMetadataRequest) => {
  const result = paymentService.proccessPayment<{ signature: string; image: string }>(
    {
      mint: req.mintAddress,
      serializedTx: req.serializedTx,
      wallet: req.wallet,
      service: "UpdateMetadata",
    },
    async (txId, verifiedOwner) => {
      return await upgradeMetadata({ ...req, verifiedOwner: verifiedOwner }, txId);
    }
  );

  return result;
};

export const confirmAndSwapMetadata = async (req: SwapArtMetadataRequest) => {
  const result = paymentService.proccessPayment<{ signature: string; image: string }>(
    {
      mint: req.mintAddress,
      serializedTx: req.serializedTx,
      wallet: req.wallet,
      service: "SwapArtMetadata",
    },
    async (txId, verifiedOwner) => {
      return await swapArtMetadata({ ...req, verifiedOwner }, txId);
    }
  );

  return result;
};

export const upgradeMetadata = async (req: UpdateMetadataRequest, txId: string) => {
  console.log("Approved tx: ", txId);
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
    owner: req.verifiedOwner,
    image: tempImgUrl,
  };

  if (!tempImgUrl) {
    throw "Unable to upload to file server";
  }

  if (!upgradeEndpoint) {
    throw "There is not an updater for a collection provided";
  }

  console.log(
    "upgrading... ",
    "owner wallet:",
    req.wallet,
    upgradeEndpoint,
    JSON.stringify(reqBody, null, 2)
  );
  const upgradeResult = await axios.post<{ signature: string; image: string }>(
    upgradeEndpoint,
    reqBody,
    { headers }
  );

  console.log("Updating db", upgradeResult.data);
  await addUpgradedImage(
    req.mintAddress,
    req.collection,
    req.upgradeType,
    upgradeResult.data.image
  );
  console.log("done");
  return upgradeResult.data;
};

export const swapArtMetadata = async (req: SwapArtMetadataRequest, txId: string) => {
  console.log("Approved tx: ", txId);

  const nft = await getUserNFTbyMint(req.wallet, req.mintAddress);

  if (!nft || !nft.type) {
    throw "NFT not found or has no type";
  }

  const tempImgUrl = nft?.images?.get(req?.upgradeType);
  const upgradeEndpoint = getMetadataUpdater(req.upgradeType, nft?.type);
  const headers = {
    "access-token": UpgradeServerToken,
  };

  const reqBody = {
    mintAddress: req.mintAddress,
    upgradeType: req.upgradeType,
    owner: req.verifiedOwner,
    image: tempImgUrl,
  };

  if (!tempImgUrl) {
    throw "Unable to upload to file server";
  }

  if (!upgradeEndpoint) {
    throw "There is not an updater for a collection provided";
  }

  console.log(
    "swapping... ",
    "owner wallet:",
    req.wallet,
    upgradeEndpoint,
    JSON.stringify(reqBody, null, 2)
  );
  const upgradeResult = await axios.post<{ signature: string; image: string }>(
    upgradeEndpoint,
    reqBody,
    { headers }
  );

  console.log("swapping db", upgradeResult.data);
  await addUpgradedImage(
    req.mintAddress,
    req.collection,
    req.upgradeType,
    upgradeResult.data.image
  );
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

const service = {
  upgradeMetadata,
  buildUpgradeImage,
  confirmAndUpgradeMetadata,
  confirmAndSwapMetadata,
};
export default service;

const getMetadataUpdater = (
  upgradeType: string,
  collection: NFTType
): string | null | undefined => {
  const updaters = {
    [NFTType.GOLEM]: {
      [GolemUpgrades.ORIGINAL.toString()]: `${UpgradeServerUrl}/update-golem-metadata`,
      [GolemUpgrades.REWORK.toString()]: `${UpgradeServerUrl}/update-golem-metadata`,
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
