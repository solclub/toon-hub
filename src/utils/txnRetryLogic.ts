import type { Connection } from "@solana/web3.js";

export const confirmTransactionWithRetry = async (
  connection: Connection,
  txId: string
) => {
  const statusCheckInterval = 300;
  const timeout = 90000;
  let isBlockhashValid = true;

  const inititalBlock = (await connection.getSignatureStatus(txId)).context
    .slot;
  let done = false;
  setTimeout(() => {
    if (done) {
      return;
    }
    done = true;
    console.log("Timed out for txid", txId);
    console.log(
      `${
        isBlockhashValid
          ? "Blockhash not yet expired."
          : "Blockhash has expired."
      }`
    );
    return isBlockhashValid
      ? {
          status: "warning",
          error:
            "Txn Timed out, but the txn may still be processing, check the txn on solscan to confirm!",
        }
      : { status: "warning", error: "Txn timed out! Initiate the txn again." };
  }, timeout);

  while (!done && isBlockhashValid) {
    const confirmation = await connection.getSignatureStatus(txId);

    if (confirmation.value && confirmation.value.err) {
      done = true;
      return { status: "error", error: "Transaction Failed" };
    }

    if (
      confirmation.value &&
      (confirmation.value.confirmationStatus === "confirmed" ||
        confirmation.value.confirmationStatus === "finalized")
    ) {
      //console.log(`Confirmation Status: ${confirmation.value.confirmationStatus}`, txId)
      done = true;
      return { status: "success", error: null };
    } else {
      console.log(
        `Confirmation Status: ${
          confirmation.value?.confirmationStatus || "not yet found."
        }`
      );
    }
    isBlockhashValid = !(await isBlockhashExpired(inititalBlock, connection));
    await sleep(statusCheckInterval);
  }
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
async function isBlockhashExpired(
  initialBlockHeight: number,
  connection: Connection
) {
  const currentBlockHeight = await connection.getBlockHeight();
  console.log(currentBlockHeight);
  return currentBlockHeight > initialBlockHeight;
}
