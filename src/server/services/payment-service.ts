import txLogService from "server/services/transactionlog-service";
import { connection } from "./connections/web3-private";
import { getUserPDAKey } from "./war-service";
import { PublicKey } from "@solana/web3.js";

interface PaymentRequestInfo {
  serializedTx: string;
  wallet: string;
  mint: string;
}

interface PaymentResponseInfo<T> {
  txSig: string;
  message?: string;
  status: TransactionStatus;
  data?: T;
}

type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

const proccessPayment = async <T>(
  request: PaymentRequestInfo,
  proccessService: () => Promise<T>
): Promise<PaymentResponseInfo<T>> => {
  const { serializedTx: txEncoded, wallet, mint } = request;
  let signature = "";
  try {
    const isOwner = await verifyNftOwner(wallet, mint);
    if (!isOwner) {
      throw new Error("You are not the owner of the NFT!");
    }

    signature = await connection.sendEncodedTransaction(txEncoded, {
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });

    logEvent("info", "Sended encoded transaction, TxSig:", signature);

    const txLog = await txLogService.saveTransaction({
      state: "PENDING",
      timestamp: new Date(),
      txId: signature,
      wallet: wallet,
      mint: mint,
      service: "test",
    });

    logEvent("info", "Save state in db, TxSig:", signature);

    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });

    logEvent("info", "transaction confirmed success, TxSig:", signature);

    await txLogService.updateTransactionState(txLog.txId, "SUCCESS");

    logEvent("info", "updated state in db success TxSig:", signature);

    return {
      status: "SUCCESS",
      txSig: signature,
      data: await proccessService(),
    };
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    return {
      message: message,
      status: "FAILED",
      txSig: signature,
      data: await proccessService(),
    };
  }
};

const service = {
  proccessPayment,
};

export default service;

const verifyNftOwner = async (owner: string, mint: string): Promise<boolean> => {
  const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mint));
  const largestAccount = largestAccounts?.value[0];
  const largestAccountInfo = largestAccount
    ? await connection.getParsedAccountInfo(largestAccount.address)
    : null;
  const accountData = largestAccountInfo?.value?.data;
  const parsedOwner = accountData instanceof Buffer ? null : accountData?.parsed?.info?.owner;
  const pdaKey = await getUserPDAKey(owner);
  console.log(pdaKey, parsedOwner);
  if (!parsedOwner && !pdaKey) {
    return false;
  }
  return parsedOwner === pdaKey || parsedOwner === owner;
};

const logEvent = (type: "error" | "info" | "warning" = "info", ...messages: string[]): void => {
  const timestamp = new Date().toISOString();
  const color = type === "error" ? "red" : type === "warning" ? "orange" : "blue";
  const message = messages.join(" ");
  console.log(`%c[${timestamp}] TxLog: ${type.toUpperCase()}: ${message}`, `color: ${color}`);
};
