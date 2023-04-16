import type { Schema } from "mongoose";
import mongoose, { model } from "mongoose";

export interface RudeTransaction {
  txId: string;
  wallet: string;
  service: string;
  state: "PENDING" | "SUCCESS" | "FAILED";
  timestamp: Date;
  mint?: string;
}

const transactionSchema: Schema = new mongoose.Schema({
  txId: { type: String, required: true, unique: true },
  wallet: { type: String, required: true },
  mint: { type: String, require: false },
  service: { type: String, required: true },
  state: { type: String, required: true },
  timestamp: { type: Date, required: true },
}); // especifica el nombre de la colección

const transactionModel = () => {
  return (
    (mongoose.models?.Transactions as mongoose.Model<RudeTransaction>) ||
    model<RudeTransaction>("Transactions", transactionSchema, "transaction-logs")
  );
};

export default transactionModel;
