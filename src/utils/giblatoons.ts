import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { env } from "env/client.mjs";

export const giblatoonsCrayonsMintkey = env.NEXT_PUBLIC_GIBLATOONS_CRAYONS_MINT_KEY;
export const isGiblatoonsLive = env.NEXT_PUBLIC_GIBATOONS_LIVE === "1" ? true : false;
export const giblatoonsLiveDate = new Date(parseInt(env.NEXT_PUBLIC_GIBLATOONS_LIVE_DATE));
export const isGiblatoonsLiveOpen =
  parseInt(env.NEXT_PUBLIC_GIBLATOONS_LIVE_DATE) - new Date().getTime() <= 0;

export const getDaysSinceStart = () => {
  const diff = new Date().getTime() - parseInt(env.NEXT_PUBLIC_GIBLATOONS_LIVE_DATE);
  if (diff < 0) {
    return 0;
  }
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
export const getMintCost = (maxCost: number) => {
  const daysPassed = Math.min(getDaysSinceStart(), 30);
  return Math.max(maxCost - 0.005 * (daysPassed - 1), 0.002);
};

export const getTotalCrayonSupply = async (connection: Connection) => {
  const crayonPubkey = new PublicKey(giblatoonsCrayonsMintkey);
  const crayonSupply = await connection.getTokenSupply(crayonPubkey);
  return (crayonSupply.value.uiAmount ?? 0) - parseInt(env.NEXT_PUBLIC_GIBLATOONS_CRAYONS_PREMINT);
};
