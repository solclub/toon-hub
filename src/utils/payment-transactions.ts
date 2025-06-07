import {
  Connection,
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
  connection,
}: PaymentTransactionParams): Promise<PaymentTransactionResult> {
  const transaction = new Transaction();
  
  if (isBulkAttack) {
    // Bulk Attack: 0.01 SOL payment
    const amount = 0.01;
    const lamports = amount * LAMPORTS_PER_SOL;
    const treasuryWallet = new PublicKey(env.NEXT_PUBLIC_SOLANA_SINK_KEY);
    
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: userWallet,
      toPubkey: treasuryWallet,
      lamports: lamports,
    });
    
    transaction.add(transferInstruction);
    transaction.feePayer = userWallet;
    
    return {
      transaction,
      amount,
      currency: "SOL",
    };
  } else {
    // Simple Fight: 100 RUDE token payment
    const amount = 100;
    const rudeMintKey = new PublicKey(env.NEXT_PUBLIC_RUDE_TOKEN_KEY);
    const treasuryWallet = new PublicKey(env.NEXT_PUBLIC_RUDE_SINK_KEY);
    
    // Get associated token addresses
    const userRudeAta = await getAssociatedTokenAddress(rudeMintKey, userWallet);
    const treasuryRudeAta = await getAssociatedTokenAddress(rudeMintKey, treasuryWallet);
    
    // Create transfer instruction for 100 RUDE tokens
    // Note: RUDE tokens have 9 decimals, so 100 tokens = 100 * 10^9
    const tokenAmount = amount * Math.pow(10, 9);
    
    const transferInstruction = createTransferInstruction(
      userRudeAta,
      treasuryRudeAta,
      userWallet,
      tokenAmount,
      [],
      TOKEN_PROGRAM_ID
    );
    
    transaction.add(transferInstruction);
    transaction.feePayer = userWallet;
    
    return {
      transaction,
      amount,
      currency: "RUDE",
    };
  }
}

export async function signAndSerializeTransaction(
  transaction: Transaction,
  connection: Connection,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  
  // Sign the transaction (partial sign by user)
  const signedTransaction = await signTransaction(transaction);
  
  // Serialize the transaction to base64
  const serialized = signedTransaction.serialize({
    requireAllSignatures: false, // Allow partial signatures
    verifySignatures: false,     // Don't verify signatures yet
  });
  
  return Buffer.from(serialized).toString("base64");
}