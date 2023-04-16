// NFTManagerContext.ts
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import type { TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { env } from "env/client.mjs";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import { connection } from "server/services/connections/web3-public";
import { getButterflies } from "server/services/onchain-service";
import type { Amount, PaymentOption } from "types/catalog";
import { PaymentToken } from "types/catalog";

const LAMPORTS_PER_RUDE = LAMPORTS_PER_SOL;
const RUDE_SINK_KEY = new PublicKey(env.NEXT_PUBLIC_RUDE_SINK_KEY);
const RUDE_TOKEN_KEY = new PublicKey(env.NEXT_PUBLIC_RUDE_TOKEN_KEY);
const SOLANA_SINK_KEY = new PublicKey(env.NEXT_PUBLIC_SOLANA_SINK_KEY);

interface NFTManagerContextType {
  prepTransaction: (
    owner: PublicKey,
    payment: PaymentOption,
    txSigner: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
  ) => Promise<string>;
  txState: TxStatus;
  setTxState: Dispatch<SetStateAction<TxStatus>>;
}

type TxStatus = "BEGIN" | "WAITING" | "SUCCESS" | "ERROR" | "NONE";

const NFTManagerContext = createContext<NFTManagerContextType | null>(null);

export const useNFTManager = (): NFTManagerContextType => {
  const context = useContext(NFTManagerContext);
  if (!context) {
    throw new Error("useNFTManager must be inside of NFTManagerProvider");
  }
  return context;
};

export const NFTManagerProvider = (props: { children: React.ReactNode }) => {
  const [txState, setTxState] = useState<TxStatus>("NONE");
  const value: NFTManagerContextType = {
    prepTransaction,
    txState,
    setTxState,
  };

  return <NFTManagerContext.Provider value={value} {...props} />;
};

const prepTransaction = async (
  owner: PublicKey,
  payment: PaymentOption,
  txSigner: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
): Promise<string> => {
  const instructions: TransactionInstruction[] = [];

  for (const paymentAmount of payment.amounts) {
    await buildTokenInstruction(owner, paymentAmount, instructions);
  }

  const txAll = new Transaction().add(...instructions);

  const latestBlockhash = await connection.getLatestBlockhash();
  txAll.recentBlockhash = latestBlockhash.blockhash;
  txAll.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
  txAll.feePayer = owner;
  const signedTx = await txSigner(txAll);
  const wireTransaction = signedTx.serialize();
  const base64 = wireTransaction.toString("base64");

  return base64;
};

const buildTokenInstruction = async (
  owner: PublicKey,
  payment: Amount,
  instructions: TransactionInstruction[]
): Promise<void> => {
  const tokenInstructionBuilder = {
    [PaymentToken.BTF]: async () => {
      const instruction = await buildButterflyInstructions(owner, payment.amount);
      instructions.push(...instruction);
    },
    [PaymentToken.RUDE]: async () => {
      console.log(RUDE_TOKEN_KEY.toString(), RUDE_SINK_KEY.toString());

      const userRudeTokenAccount = await getAssociatedTokenAddress(RUDE_TOKEN_KEY, owner);
      console.log("RUDE ADDRESS ", RUDE_TOKEN_KEY.toBase58(), RUDE_SINK_KEY.toBase58());
      const rudeTokenSinkAccount = await getAssociatedTokenAddress(RUDE_TOKEN_KEY, RUDE_SINK_KEY);
      console.log("RUDE ADDRESS 2 ", rudeTokenSinkAccount.toBase58());
      const instruction = await buildRudeTokenInstruction(
        userRudeTokenAccount,
        rudeTokenSinkAccount,
        owner,
        payment.amount
      );
      instructions.push(...instruction);
    },
    [PaymentToken.SOL]: async () => {
      const instruction = await buildSolanaInstruction(owner, payment.amount);
      instructions.push(...instruction);
    },
  };

  await tokenInstructionBuilder[payment.token]();
};

const buildButterflyInstructions = async (
  userWallet: PublicKey,
  amount: number
): Promise<TransactionInstruction[]> => {
  const instructions: TransactionInstruction[] = [];
  const butterflies = await getButterflies(userWallet.toBase58());
  if (butterflies.length < amount) throw Error("The user does not have enough butterflies");

  for (let index = 0; index < amount; index++) {
    const butterfly = butterflies[index];

    const userButterflyMint = butterfly?.address as PublicKey;
    const userButterflyTokenAccount = await getAssociatedTokenAddress(
      userButterflyMint,
      userWallet
    );

    const butterflyKeyAccount = await getAssociatedTokenAddress(userButterflyMint, RUDE_SINK_KEY);
    const butterflyKeyAccountData = await connection.getAccountInfo(butterflyKeyAccount);

    if (butterflyKeyAccountData === null) {
      const Ix = createAssociatedTokenAccountInstruction(
        userWallet,
        butterflyKeyAccount,
        RUDE_SINK_KEY,
        userButterflyMint
      );
      instructions.push(Ix);
    }

    const Ix2 = createTransferInstruction(
      userButterflyTokenAccount,
      butterflyKeyAccount,
      userWallet,
      1
    );
    instructions.push(Ix2);
  }

  return instructions;
};

const buildRudeTokenInstruction = async (
  rudeTokenAccount: PublicKey,
  rudeSinkAccount: PublicKey,
  userPublicKey: PublicKey,
  amount: number
): Promise<TransactionInstruction[]> => {
  const instructions: TransactionInstruction[] = [];

  const Ix3 = createTransferInstruction(
    rudeTokenAccount,
    rudeSinkAccount,
    userPublicKey,
    amount * LAMPORTS_PER_RUDE
  );
  instructions.push(Ix3);

  return instructions;
};

const buildSolanaInstruction = async (userPublicKey: PublicKey, amount: number) => {
  const instructions = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: userPublicKey,
      toPubkey: SOLANA_SINK_KEY,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  ).instructions;

  return instructions;
};
