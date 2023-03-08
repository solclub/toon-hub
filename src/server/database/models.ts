import type { WithId, Document, ObjectId } from "mongodb";

export interface MongoUser extends WithId<Document> {
  WalletId: string;
  twitterVeridied: boolean;
  discordVeridied: boolean;
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

export type ProviderDetails = {
  username: string;
  name: string;
  email: string;
  image: string;
  provider: string;
};
