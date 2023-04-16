import type { NFTAttribute } from "server/database/models/nft.model";
import { NFTType } from "server/database/models/nft.model";
import { collectionsSchemas } from "../data/collections";
import mergeImages from "./sharp-service";
import { addUpgradedImage } from "./nfts-service";
import { getUrlFile } from "./cloudinary-service";
import { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";
import { SigninMessage } from "utils/signin-message";
import { PublicKey } from "@solana/web3.js";
import { getUserPDAKey } from "./war-service";
import { toMetaplexFile } from "@metaplex-foundation/js";
import axios from "axios";
import { metaplexWithAuthority, connection } from "./connections/web3-private";

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
  signedMessage: string;
  stringMessage: string;
  nonce: string;
  upgradeType: string;
  collection: NFTType;
  attributes: NFTAttribute[];
}

const upgradeMetadata = async (req: UpdateMetadataRequest) => {
  const isValid = validateSignedMessage(req.signedMessage, req.stringMessage, req.nonce);
  const isOwner = await verifyNftOwner(req.wallet, req.mintAddress);
  const upgradeImagePromise = buildUpgradeImage(
    req.mintAddress,
    req.collection,
    req.upgradeType,
    req.attributes
  );

  if (!isValid) {
    throw new Error("Could not validate the signed message");
  }
  if (!isOwner) {
    throw new Error("You are not the owner of the NFT!");
  }

  const metadataUpdater = getMetadataUpdater(req.upgradeType, req.collection);
  const imageBuffer = await upgradeImagePromise;

  if (metadataUpdater && imageBuffer) {
    const result = await metadataUpdater(req.mintAddress, imageBuffer);

    if ((result?.image ?? "").length <= 0) {
      throw new Error("Error creating metaplex image url");
    }

    const signature = await connection.sendEncodedTransaction(req.serializedTx, {
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    console.log(`[${Date.now()}]`, "upgradeMetadata: metadata signed", signature);

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
    console.log(`[${Date.now()}]`, "upgradeMetadata: transaction confirmed");

    await addUpgradedImage(req.mintAddress, req.upgradeType, result?.image ?? "");
    console.log(`[${Date.now()}]`, "upgradeMetadata: upgraded web2");

    return result;
  }
  return null;
};

const buildUpgradeImage = async (
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

const getMetadataUpdater = (upgradeType: string, collection: NFTType) => {
  const updaters = {
    [NFTType.GOLEM]: {
      [GolemUpgrades.ORIGINAL.toString()]: null,
      [GolemUpgrades.REWORK.toString()]: updateMetadataGolem,
      [GolemUpgrades.CARTOON.toString()]: null,
    },
    [NFTType.DEMON]: {
      [DemonUpgrades.ORIGINAL.toString()]: null,
      [DemonUpgrades.CARTOON.toString()]: null,
    },
  };
  return updaters[collection][upgradeType];
};

const updateMetadataGolem = async (mintAddress: string, imageBuffer: Buffer) => {
  console.log(`[${Date.now()}]`, "updateMetadataGolem: start");
  const mint = new PublicKey(mintAddress);
  console.log(`[${Date.now()}]`, "updateMetadataGolem: mint", mintAddress);

  const nft = await metaplexWithAuthority.nfts().findByMint({ mintAddress: mint });
  console.log(`[${Date.now()}]`, "updateMetadataGolem: nft", !nft.json?.attributes);

  if (!nft.json?.attributes) {
    throw new Error(`Error getting nft metadata ${mintAddress}`);
  }

  const traitIndex = nft.json.attributes.findIndex((x) => x.trait_type === "Butterfly Effect");
  const updatedAttributes = [...nft.json.attributes];
  console.log(`[${Date.now()}]`, "updateMetadataGolem: traitIndex", traitIndex);
  if (traitIndex > -1 && updatedAttributes[traitIndex]?.value == "true") {
    return { sig: "no update", image: nft.json.image };
  }

  if (traitIndex == -1) {
    updatedAttributes.push({
      trait_type: "Butterfly Effect",
      value: "true",
    });
  }
  console.log(`[${Date.now()}]`, "updateMetadataGolem: uploadMetadata");
  const { uri, metadata } = await metaplexWithAuthority.nfts().uploadMetadata({
    ...nft.json,
    image: toMetaplexFile(imageBuffer, `${mintAddress}.png`),
    attributes: updatedAttributes,
    properties: {
      ...nft.json.properties,
      files: [
        {
          type: "image/png",
          uri: toMetaplexFile(imageBuffer, `${mintAddress}.png`),
        },
      ],
    },
  });

  console.log(`[${Date.now()}]`, "updateMetadataGolem: Metadata.json updated");

  const updatedNft = await metaplexWithAuthority.nfts().update({
    nftOrSft: nft,
    uri: uri,
  });

  console.log(`[${Date.now()}]`, "updateMetadataGolem: nft updated", metadata.image);
  return { sig: updatedNft.response.signature, image: metadata.image };
};

const validateSignedMessage = (
  signedMessage: string,
  stringMessage: string,
  nonce: string
): boolean => {
  const message = new SigninMessage(stringMessage);
  const isValid = message.validate(signedMessage);

  return message.nonce === nonce && isValid;
};

const verifyNftOwner = async (owner: string, mint: string): Promise<boolean> => {
  const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mint));
  const largestAccount = largestAccounts?.value[0];
  const largestAccountInfo = largestAccount
    ? await connection.getParsedAccountInfo(largestAccount.address)
    : null;
  const accountData = largestAccountInfo?.value?.data;
  const parsedOwner = accountData instanceof Buffer ? null : accountData?.parsed?.info?.owner;
  const pdaKey = await getUserPDAKey(owner);
  if (!parsedOwner || !pdaKey) {
    return false;
  }
  return parsedOwner === pdaKey || parsedOwner === owner;
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
  const url = getUrlFile(
    collectionName,
    upgradeName,
    trait.toLowerCase(),
    formattedTraits[trait] ?? ""
  );

  return url;
};

const service = { upgradeMetadata, buildUpgradeImage };
export default service;
