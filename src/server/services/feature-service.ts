import { SigninMessage } from "utils/SigninMessage";
import { PublicKey } from "@solana/web3.js";
import { getUserPDAKey } from "./war-service";
import { connection } from "./connections/web3-private";

export interface FeatureNFTRequest {
  mintAddress: string;
  wallet: string;
  serializedTx: string;
  signedMessage: string;
  stringMessage: string;
  nonce: string;
}

const confirmFeatureTx = async (req: FeatureNFTRequest) => {
  const isValid = validateSignedMessage(req.signedMessage, req.stringMessage, req.nonce);
  const isOwner = await verifyNftOwner(req.wallet, req.mintAddress);

  if (!isValid) {
    throw new Error("Could not validate the signed message");
  }
  if (!isOwner) {
    throw new Error("You are not the owner of the NFT!");
  }

  const signature = await connection.sendEncodedTransaction(req.serializedTx, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
  });
  console.log(`[${Date.now()}]`, "confirmFeatureTx: signed", signature);

  //TODO: save record in mongo
  console.log(`[${Date.now()}]`, "confirmFeatureTx: upgraded web2");

  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: signature,
  });

  console.log(`[${Date.now()}]`, "confirmFeatureTx: transaction confirmed");
};

const validateSignedMessage = (
  signedMessage: string,
  stringMessage: string | undefined,
  nonce: string
): boolean => {
  const message = new SigninMessage(signedMessage);
  const isValid = message.validate(stringMessage || "");

  return message.nonce === nonce && isValid;
};

const verifyNftOwner = async (owner: string, mint: string): Promise<boolean> => {
  const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mint));
  const largestAccount = largestAccounts?.value[0];
  const largestAccountInfo = largestAccount
    ? await connection.getParsedAccountInfo(largestAccount.address)
    : null;
  const accountData = largestAccountInfo?.value?.data;
  const parsedOwner = accountData instanceof Buffer ? null : accountData?.parsed?.info?.owner;
  const pdaKey = await getUserPDAKey(owner);
  if (!parsedOwner || !pdaKey) {
    return false;
  }
  return parsedOwner === pdaKey || parsedOwner === owner;
};

const service = { confirmFeatureTx };
export default service;
