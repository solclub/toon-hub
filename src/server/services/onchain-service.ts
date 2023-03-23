import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { env } from "env/client.mjs";

export const connection = new Connection(env.NEXT_PUBLIC_RPC_NODE, "confirmed");

export const getRudeTokenBalance = async (wallet: string) => {
  try {
    const walletPubKey = new PublicKey(wallet);
    const rudeMintKey = new PublicKey(env.NEXT_PUBLIC_RUDE_TOKEN_KEY);
    const rudeAta = await getAssociatedTokenAddress(rudeMintKey, walletPubKey);
    const balance = await connection.getTokenAccountBalance(rudeAta);
    return balance.value.uiAmount;
  } catch (err) {
    return 0;
  }
};

export const getSolBalance = async (wallet: string) => {
  const walletPubKey = new PublicKey(wallet);
  const solBal = await connection.getBalance(walletPubKey);
  return (solBal / LAMPORTS_PER_SOL).toFixed(2);
};
