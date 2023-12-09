import type { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import {
  fetchAllDigitalAssetByOwner,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import type { PublicKey } from "@metaplex-foundation/umi";
import { env } from "env/server.mjs";
import type { Model } from "mongoose";
import type { RudeNFT } from "../database/models/nft.model";
import rudeNFTModels, { NFTType } from "../database/models/nft.model";
import type { UserNFT } from "../database/models/user-nfts.model";
import usernfts from "../database/models/user-nfts.model";
import { umi } from "./connections/web3-public";
import { getButterfliesBalance, getRudeTokenBalance, getSolBalance } from "./onchain-service";
import { getInTrainingNfts } from "./war-service";

interface NFTDictionary {
  [name: string]: string[];
}

export const getUserNFTs = async (wallet: string) => {
  const result = await getNFTsByWalletId(wallet);

  const golems = await getNFTDocuments(NFTType.GOLEM, rudeNFTModels.GolemModel(), [
    ...(result.inWalletMints[NFTType.GOLEM] ?? []),
    ...(result.trainingMints[NFTType.GOLEM] ?? []),
  ]);
  const demons = await getNFTDocuments(NFTType.DEMON, rudeNFTModels.DemonModel(), [
    ...(result.inWalletMints[NFTType.DEMON] ?? []),
    ...(result.trainingMints[NFTType.DEMON] ?? []),
  ]);

  const nfts = golems.concat(demons);
  // await syncUserNFTs(
  //   wallet,
  //   nfts,
  //   (nft) => (nft.type && result.trainingMints[nft.type]?.includes(nft.mint)) ?? false
  // );
  return nfts;
};

export const syncUserNFTs = async (
  wallet: string,
  nfts: RudeNFT[],
  checkIsTraining: (nft: RudeNFT) => boolean
) => {
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
          wallet: wallet,
          active: true,
          // current: GolemUpgrades.ORIGINAL,
          // images: new Map<string, string>([[GolemUpgrades.ORIGINAL, x.image]]),
          isTraining: checkIsTraining(x),
        };
        await usernfts.UserNFTsModel().updateOne({ mint: item.mint }, item, { upsert: true });
      });

    removedItems.forEach(async (x) => {
      await usernfts.UserNFTsModel().updateOne({ mint: x, wallet }, { active: false });
    });
  }
};

export const addUpgradedImage = async (
  mint: string,
  collection: NFTType,
  upgradeType: string,
  imageUrl: string,
  isCurrent = true
) => {
  const update = { $set: { [`images.${upgradeType}`]: imageUrl } };
  if (isCurrent) {
    update.$set = { current: upgradeType, ...update.$set };
  }
  const filter = { mint: mint };

  const options = { new: true };

  switch (collection) {
    case NFTType.DEMON:
      return await rudeNFTModels.DemonModel().findOneAndUpdate(filter, update, options);
    case NFTType.GOLEM:
      return await rudeNFTModels.GolemModel().findOneAndUpdate(filter, update, options);
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
): Promise<RudeNFT & { user: UserNFT | undefined }> => {
  const user = (
    await usernfts.UserNFTsModel().findOne({ mint: mint, active: true, wallet })
  )?.toObject();

  const golems = await rudeNFTModels.GolemModel().findOne({ mint: mint });

  if (golems) {
    return { ...golems?.toObject(), type: NFTType.GOLEM, user };
  }

  const demons = await rudeNFTModels.DemonModel().findOne({ mint: mint });

  if (demons) {
    return { ...demons?.toObject(), type: NFTType.DEMON, user };
  }

  return {} as RudeNFT & { user: UserNFT | undefined };
};

// export const getNFTsByWalletIdOld = async (
//   wallet: string
// ): Promise<{ inWalletMints: NFTDictionary; trainingMints: NFTDictionary }> => {
//   const walletPubKey = new Web3PublicKey(wallet);
//   const stakedUserNfts = getInTrainingNfts(wallet);
//   console.log("assets");
//   const assets = await fetchAllDigitalAssetByOwner(umi, wallet as PublicKey);
//   console.log(assets);

//   const walletNfts = await metaplex.nfts().findAllByOwner({
//     owner: walletPubKey,
//   });
//   console.log("ok3");
//   console.log(walletNfts);
//   const trainingMints: NFTDictionary = {};
//   const mints: NFTDictionary = walletNfts
//     .filter((i) => i.updateAuthorityAddress.toBase58() == env.UPDATE_AUTHORITY_ADDRESS)
//     .reduce((acc: NFTDictionary, nft: NFT) => {
//       if (isNFTValid(nft)) {
//         const item = nft as Metadata;
//         const type = getCollectionType(nft.name);
//         if (!acc[type]) {
//           acc[type] = [];
//         }
//         acc[type]?.push(item.mintAddress.toBase58());
//       }
//       return acc;
//     }, {});

//   const stakedMints = await stakedUserNfts;
//   stakedMints?.forEach((item) => {
//     const type = item.rudeType === 1 ? NFTType.GOLEM : NFTType.DEMON;
//     if (!trainingMints[type]) {
//       trainingMints[type] = [];
//     }
//     trainingMints[type]?.push(item["rudeMintkey"].toString());
//   });

//   return { inWalletMints: mints, trainingMints };
// };

export const getNFTsByWalletId = async (
  wallet: string
): Promise<{ inWalletMints: NFTDictionary; trainingMints: NFTDictionary }> => {
  const walletNfts = await fetchAllDigitalAssetByOwner(umi, wallet as PublicKey, {
    tokenStrategy: "getProgramAccounts",
    tokenAmountFilter: (amount) => amount == BigInt(1),
  });

  const stakedUserNfts = getInTrainingNfts(wallet);
  const trainingMints: NFTDictionary = {};
  const mints: NFTDictionary = walletNfts
    .filter((i) => i.metadata.updateAuthority == env.UPDATE_AUTHORITY_ADDRESS)
    .reduce((acc: NFTDictionary, nft: DigitalAsset) => {
      if (isNFTValid(nft)) {
        const type = getCollectionType(nft.metadata.name);
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type]?.push(nft.publicKey);
      }
      return acc;
    }, {});

  const stakedMints = await stakedUserNfts;
  stakedMints?.forEach((item) => {
    const type = item.rudeType === 1 ? NFTType.GOLEM : NFTType.DEMON;
    if (!trainingMints[type]) {
      trainingMints[type] = [];
    }
    trainingMints[type]?.push(item["rudeMintkey"].toString());
  });

  return { inWalletMints: mints, trainingMints };
};

export const getNFTsByMint = async (mintAddress: string): Promise<DigitalAsset> => {
  const mint = mintAddress as PublicKey;
  const nft = await fetchDigitalAsset(umi, mint);
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

const isNFTValid = (nft: DigitalAsset) => {
  return (
    /Golem|Demon/.test(nft.metadata.name) ||
    golemGods.includes(nft.metadata.name) ||
    demonGods.includes(nft.metadata.name)
  );
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
  return "Unknow";
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
