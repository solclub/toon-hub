import type { RudeNFT } from "../database/models/nft.model";
import { NFTType } from "../database/models/nft.model";
import rudeNFTModels from "../database/models/nft.model";
import type { UserNFT } from "../database/models/user-nfts.model";
import usernfts, { GolemUpgrades } from "../database/models/user-nfts.model";
import { PublicKey } from "@solana/web3.js";
import { getInTrainingNfts } from "./war-service";
import {
  connection,
  getButterfliesBalance,
  getRudeTokenBalance,
  getSolBalance,
} from "./onchain-service";
import type {
  Metadata,
  JsonMetadata,
  Nft,
  Sft,
  NftWithToken,
  SftWithToken,
} from "@metaplex-foundation/js";
import { Metaplex } from "@metaplex-foundation/js";
import type { Model } from "mongoose";
import { env } from "env/server.mjs";

type NFT = Metadata<JsonMetadata<string>> | Nft | Sft;
interface NFTDictionary {
  [name: string]: string[];
}

const metaplex = new Metaplex(connection);

export const getUserNFTs = async (wallet: string) => {
  const result = await getNFTsByWalletId(wallet);

  const golems = await getNFTDocuments(
    NFTType.GOLEM,
    rudeNFTModels.GolemModel(),
    result[NFTType.GOLEM] ?? []
  );
  const demons = await getNFTDocuments(
    NFTType.DEMON,
    rudeNFTModels.DemonModel(),
    result[NFTType.DEMON] ?? []
  );

  const nfts = golems.concat(demons);
  await syncUserNFTs(wallet, nfts);
  return nfts;
};

export const syncUserNFTs = async (wallet: string, nfts: RudeNFT[]) => {
  if (wallet && nfts) {
    const saved = (await usernfts.UserNFTsModel().find({ wallet, active: true })).map(
      (x) => x.mint
    );
    const current = nfts.map((x) => x.mint);
    const removedItems = saved.filter((val) => !current.includes(val));
    const newItems = current.filter((val) => !saved.includes(val));
    nfts
      .filter((x) => newItems.includes(x.mint))
      .forEach(async (x) => {
        const item = <UserNFT>{
          mint: x.mint,
          type: x.type,
          current: GolemUpgrades.ORIGINAL,
          wallet: wallet,
          active: true,
          images: new Map<string, string>([[GolemUpgrades.ORIGINAL, x.image]]),
          localImage: x.image,
        };
        await usernfts.UserNFTsModel().updateOne({ mint: item.mint }, item, { upsert: true });
      });

    removedItems.forEach(async (x) => {
      await usernfts.UserNFTsModel().updateOne({ mint: x, wallet }, { $set: { active: false } });
    });
  }
};

export const getSyncedNfts = async (wallet: string) => {
  let nfts: string[] = [];
  if (wallet) {
    nfts = (await usernfts.UserNFTsModel().find({ wallet, active: true })).map((x) => x.mint);
  }
  return nfts;
};

export const getUserNFTbyMint = async (
  wallet: string,
  mint: string
): Promise<RudeNFT & { upgrades: UserNFT | undefined }> => {
  const upgrades = (
    await usernfts.UserNFTsModel().findOne({ mint: mint, active: true, wallet })
  )?.toObject();

  const golems = await rudeNFTModels.GolemModel().findOne({ mint: mint });

  if (golems) {
    return { ...golems?.toObject(), type: NFTType.GOLEM, upgrades };
  }

  const demons = await rudeNFTModels.DemonModel().findOne({ mint: mint });

  if (demons) {
    return { ...demons?.toObject(), type: NFTType.DEMON, upgrades };
  }

  return {} as RudeNFT & { upgrades: UserNFT | undefined };
};

export const getNFTsByWalletId = async (wallet: string): Promise<NFTDictionary> => {
  const walletPubKey = new PublicKey(wallet);
  const stakedUserNfts = getInTrainingNfts(wallet);
  const walletNfts = await metaplex.nfts().findAllByOwner({
    owner: walletPubKey,
  });

  const mints: NFTDictionary = walletNfts
    .filter((i) => i.updateAuthorityAddress.toBase58() == env.UPDATE_AUTHORITY_ADDRESS)
    .reduce((acc: NFTDictionary, nft: NFT) => {
      if (isNFTValid(nft)) {
        const item = nft as Metadata;
        const type = getCollectionType(nft.name);
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type]?.push(item.mintAddress.toBase58());
      }
      return acc;
    }, {});

  const stakedMints = await stakedUserNfts;
  stakedMints?.forEach((item) => {
    const type = item.rudeType === 1 ? NFTType.GOLEM : NFTType.DEMON;
    if (!mints[type]) {
      mints[type] = [];
    }
    mints[type]?.push(item["rudeMintkey"].toString());
  });

  return mints;
};

export const getNFTsByMint = async (
  mintAddress: string
): Promise<Nft | Sft | SftWithToken | NftWithToken> => {
  const mint = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
  return nft;
};

export const getWalletBalanceTokens = async (wallet: string): Promise<Map<string, number>> => {
  const solBalance = await getSolBalance(wallet);
  const rudeBalance = await getRudeTokenBalance(wallet);
  const butterfliesBalance = await getButterfliesBalance(wallet);

  const balanceMap = new Map<string, number>();
  balanceMap.set("SOL", solBalance);
  balanceMap.set("RUDE", rudeBalance);
  balanceMap.set("RGBF", butterfliesBalance);

  return balanceMap;
};

const getNFTDocuments = async (nftType: NFTType, nftModel: Model<RudeNFT>, mintArray: string[]) => {
  const nftDocuments = await nftModel.find({ mint: { $in: mintArray } });
  return nftDocuments.map((nft) => ({ ...nft.toObject(), type: nftType }));
};

const isNFTValid = (nft: NFT): nft is Metadata => {
  return /Golem|Demon/.test(nft.name);
};

const getCollectionType = (name: string): string => {
  const match = name.match(/Golem|Demon/);
  if (match) {
    return match[0].toUpperCase() as NFTType;
  }
  if (golemGods.includes(name)) {
    return NFTType.GOLEM;
  }

  if (demonGods.includes(name)) {
    return NFTType.DEMON;
  }
  return NFTType.OTHER;
};

const golemGods = [
  "Giblon",
  "G-7",
  "Rooton",
  "Golowar",
  "Tarblok",
  "Khaos",
  "Leviaton",
  "Nyghtum",
  "Demantur",
  "Tsatsako",
];

const demonGods = ["Sylverior", "Ymantus", "Dhurko", "Garr'ash"];
