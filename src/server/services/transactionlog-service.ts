import type { RudeTransaction } from "server/database/models/transaction.model";
import transactionModel from "server/database/models/transaction.model";

type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

const saveTransaction = async (transaction: RudeTransaction): Promise<RudeTransaction> =>
  await transactionModel().create(transaction);

const findTransactionByTxId = async (txId: string): Promise<RudeTransaction | null> =>
  await transactionModel().findOne({ txId });

const findTransactionsByTxIdAndState = async (
  txId: string,
  state: TransactionStatus
): Promise<RudeTransaction[]> => await transactionModel().find({ txId, state });

const findTransactionsByWalletAndState = async (
  wallet: string,
  state: TransactionStatus
): Promise<RudeTransaction[]> => await transactionModel().find({ wallet, state });

const updateTransactionState = async (
  txId: string,
  state: TransactionStatus
): Promise<RudeTransaction | null> =>
  await transactionModel().findOneAndUpdate({ txId }, { state }, { new: true });

const transactionService = {
  saveTransaction,
  findTransactionByTxId,
  findTransactionsByTxIdAndState,
  findTransactionsByWalletAndState,
  updateTransactionState,
};

export default transactionService;
