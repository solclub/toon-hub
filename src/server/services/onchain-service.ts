import type { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
import type { PublicKey } from "@metaplex-foundation/umi";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey as Web3PublicKey } from "@solana/web3.js";
import { env } from "env/client.mjs";
import logWithTimestamp from "utils/logs";
import { connection, umi } from "./connections/web3-public";

export const getRudeTokenBalance = async (wallet: string): Promise<number> => {
  try {
    const walletPubKey = new Web3PublicKey(wallet);
    const rudeMintKey = new Web3PublicKey(env.NEXT_PUBLIC_RUDE_TOKEN_KEY);
    const rudeAta = await getAssociatedTokenAddress(rudeMintKey, walletPubKey);
    const balance = await connection.getTokenAccountBalance(rudeAta);
    const balanceValue = balance.value.uiAmount?.toFixed(2);
    logWithTimestamp("getAssociatedTokenAddress");
    logWithTimestamp("getTokenAccountBalance");
    return Number(balanceValue || 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getSolBalance = async (wallet: string): Promise<number> => {
  try {
    const walletPubKey = new Web3PublicKey(wallet);
    const solBal = await connection.getBalance(walletPubKey);
    const balanceValue = (solBal / LAMPORTS_PER_SOL).toFixed(2);
    logWithTimestamp("getBalance");

    return Number(balanceValue || 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getButterflies = async (wallet: string): Promise<DigitalAsset[]> => {
  const walletNfts = await fetchAllDigitalAssetByOwner(umi, wallet as PublicKey);
  logWithTimestamp("fetchAllDigitalAssetByOwner");

  const filteredNfts = walletNfts.filter(
    (nft) =>
      nft.metadata.updateAuthority === "9dASnA6jbwLc7xjhCm7JYasTwAiyhypvC7PfDw7nfLBN" &&
      nft.metadata.name.includes("Butterfly")
  );

  return filteredNfts.map((x) => x as DigitalAsset);
};

export const getButterfliesBalance = async (wallet: string): Promise<number> => {
  try {
    const filteredNfts = await getButterflies(wallet);
    return filteredNfts.length;
  } catch (error) {
    console.error(error);
    return 0;
  }
};
