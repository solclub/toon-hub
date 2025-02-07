import mongoose, { model, Schema } from "mongoose";

export interface IUser {
  id: string;
  walletId: string;
  twitterVerified: boolean;
  discordVerified: boolean;
  twitterDetails: ProviderDetails | null;
  discordDetails: ProviderDetails | null;
  totalPower: number;
  totalTraining: number;
  totalWarriors: number;
  golemNumbers: number[] | null;
  golemKeys: string[] | null;
  demonNumbers: number[] | null;
  demonKeys: string[] | null;
}

export interface ProviderDetails {
  username: string;
  name: string;
  email: string;
  image: string;
  provider: string;
}

const ProviderSchema = new Schema<ProviderDetails>({
  username: String,
  name: String,
  email: String,
  image: String,
  provider: String,
});

const UserSchema = new Schema<IUser>({
  id: String,
  walletId: { type: String, required: true },
  twitterVerified: Boolean,
  discordVerified: Boolean,
  twitterDetails: ProviderSchema,
  discordDetails: ProviderSchema,
  totalPower: Number,
  totalTraining: Number,
  totalWarriors: Number,
  golemNumbers: [Number],
  golemKeys: [String],
  demonNumbers: [Number],
  demonKeys: [String],
});

const userModel = () => {
  return (
    (mongoose.models?.User as mongoose.Model<IUser>) ||
    model<IUser>("User", UserSchema, "users")
  );
};

export default userModel;
