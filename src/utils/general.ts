import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export const modifyHours = (date: Date, hours: number) => {
  const dateCopy = new Date(date);
  dateCopy.setHours(dateCopy.getHours() + hours);
  return dateCopy;
};

const getPublicKey = (key: string | PublicKey) => {
  return typeof key === "string" ? new PublicKey(key) : key;
};

export const getOrCreateAssociatedTokenAccount = async (
  connection: Connection,
  wallet: string | PublicKey,
  mintkey: string | PublicKey
) => {
  let ix = null;
  const walletKey = getPublicKey(wallet);
  const tokenKey = getPublicKey(mintkey);

  const ata = await getAssociatedTokenAddress(tokenKey, walletKey);

  const ataData = await connection.getAccountInfo(ata);

  if (!ataData) {
    console.log("ata not present");
    ix = createAssociatedTokenAccountInstruction(walletKey, ata, walletKey, tokenKey);
  }

  return { ix, ata };
};
