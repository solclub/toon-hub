import type { Connection } from "@solana/web3.js";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { env } from "env/client.mjs";

export interface PaymentTransactionParams {
  userWallet: PublicKey;
  isBulkAttack: boolean;
  connection: Connection;
}

export interface PaymentTransactionResult {
  transaction: Transaction;
  amount: number;
  currency: string;
}

export async function createPaymentTransaction({
  userWallet,
  isBulkAttack,
}: PaymentTransactionParams): Promise<PaymentTransactionResult> {
  const transaction = new Transaction();
  
  if (isBulkAttack) {
    // Bulk Attack: 0.01 SOL payment
    const amount = 0.01;
    const lamports = amount * LAMPORTS_PER_SOL;
    
    const instruction = SystemProgram.transfer({
      fromPubkey: userWallet,
      toPubkey: new PublicKey("11111111111111111111111111111112"), // System Program placeholder
      lamports: lamports,
    });
    
    transaction.add(instruction);
    
    return {
      transaction,
      amount,
      currency: "SOL"
    };
  } else {
    // Single Attack: 1 RUDE token payment
    const amount = 1;
    const mintAddress = new PublicKey(env.NEXT_PUBLIC_RUDE_TOKEN_KEY || "");
    const paymentWallet = new PublicKey("11111111111111111111111111111112"); // System Program placeholder
    
    const userTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      userWallet
    );
    
    const paymentTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      paymentWallet
    );
    
    const instruction = createTransferInstruction(
      userTokenAccount,
      paymentTokenAccount,
      userWallet,
      amount * Math.pow(10, 9), // RUDE has 9 decimals
      [],
      TOKEN_PROGRAM_ID
    );
    
    transaction.add(instruction);
    
    return {
      transaction,
      amount,
      currency: "RUDE"
    };
  }
}