import type { NFTAttribute, NFTType } from "server/database/models/nft.model";
import { collectionsSchemas } from "../data/collections";
import mergeImages from "./sharp-service";
import { getNFTsByMint } from "./nfts-service";
import { saveFileToCloud } from "./cloudinary-service";
import type { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";
import { SigninMessage } from "utils/SigninMessage";
import { PublicKey } from "@solana/web3.js";
import { getUserPDAKey } from "./war-service";
import { toMetaplexFile } from "@metaplex-foundation/js";
import axios from "axios";
import { metaplexWithAuthority, connection } from "./web3-connections";
import { Exception } from "sass";

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

interface UpdateMetadataRequest {
  mintAddress: string;
  wallet: string;
  //owner: string;
  serializedTransaction: string;
  signedMessage: string;
  stringMessage: string;
  imageUrl: string;
  nonce: string;
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

export const upgradeMetadata = async (req: UpdateMetadataRequest) => {
  const isValid = validateSignedMessage(req.signedMessage, req.stringMessage, req.nonce);
  const isOwner = await verifyNftOwner(req.wallet, req.mintAddress);

  if (!isValid) {
    throw new Error("Could not validate the signed message");
  }
  if (!isOwner) {
    throw new Error("ou are not the owner of the Golem!");
  }

  const result = await updateMetadataGolem(req.mintAddress, req.imageUrl);

  console.log("Metdata updated");
  const signature = await connection.sendEncodedTransaction(req.serializedTransaction, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
  });
  console.log(signature);
  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: signature,
  });
  return result;
};

const updateMetadataGolem = async (mintAddress: string, image: string) => {
  const response = await axios.get(image, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data, "utf-8");
  const mint = new PublicKey(mintAddress);
  console.log("mint", mintAddress);
  const nft = await metaplexWithAuthority.nfts().findByMint({ mintAddress: mint });

  if (!nft.json?.attributes) {
    throw new Error(`Error getting nft metadata ${mintAddress}`);
  }

  const traitIndex = nft.json.attributes.findIndex((x) => x.trait_type === "Butterfly Effect");
  const updatedAttributes = [...nft.json.attributes];

  if (traitIndex > -1 && updatedAttributes[traitIndex]?.value == "true") {
    return { sig: "no update", image: nft.json.image };
  }

  if (traitIndex == -1) {
    updatedAttributes.push({
      trait_type: "Butterfly Effect",
      value: "true",
    });
  }

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

  console.log("Metadata.json updated");

  const updatedNft = await metaplexWithAuthority.nfts().update({
    nftOrSft: nft,
    uri: uri,
  });

  console.log(metadata.image);

  return { sig: updatedNft.response.signature, image: metadata.image };
};

const validateSignedMessage = (
  signedMessage: string,
  stringMessage: string | undefined,
  nonce: string
): boolean => {
  const message = new SigninMessage(signedMessage);
  const isValid = message.validate(stringMessage || "");

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
  const url = `src/assets/traits/${collectionName}/${upgradeName}/${trait.toLowerCase()}/${
    formattedTraits[trait]
  }.png`;

  return url;
};
