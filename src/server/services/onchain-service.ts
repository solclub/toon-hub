import type { Metadata, Nft, Sft } from "@metaplex-foundation/js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { env } from "env/client.mjs";
import { connection, metaplex } from "./connections/web3-public";

export const getRudeTokenBalance = async (wallet: string): Promise<number> => {
  try {
    const walletPubKey = new PublicKey(wallet);
    const rudeMintKey = new PublicKey(env.NEXT_PUBLIC_RUDE_TOKEN_KEY);
    const rudeAta = await getAssociatedTokenAddress(rudeMintKey, walletPubKey);
    const balance = await connection.getTokenAccountBalance(rudeAta);
    const balanceValue = balance.value.uiAmount?.toFixed(2);

    return Number(balanceValue || 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getSolBalance = async (wallet: string): Promise<number> => {
  try {
    const walletPubKey = new PublicKey(wallet);
    const solBal = await connection.getBalance(walletPubKey);
    const balanceValue = (solBal / LAMPORTS_PER_SOL).toFixed(2);

    return Number(balanceValue || 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getButterflies = async (wallet: string): Promise<(Metadata | Nft | Sft)[]> => {
  const walletPubKey = new PublicKey(wallet);
  const walletNfts = await metaplex.nfts().findAllByOwner({ owner: walletPubKey });
  const filteredNfts = walletNfts.filter(
    (nft) =>
      nft.updateAuthorityAddress.toBase58() === "9dASnA6jbwLc7xjhCm7JYasTwAiyhypvC7PfDw7nfLBN" &&
      nft.name.includes("Butterfly")
  );
  return filteredNfts;
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
