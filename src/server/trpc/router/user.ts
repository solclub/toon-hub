import { z } from "zod";
import { env } from "../../../env/server.mjs";
import type { MongoUser } from "../../database/models";
import clientPromise from "../../database/mongodb";
import { router, publicProcedure } from "../trpc";

const collectionName = "users";

export const usersRouter = router({
  getUserByWallet: publicProcedure
    .input(z.object({ walletId: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await clientPromise;
      const db = client.db(env.MONGODB_DB_NAME);
      const exists = await db
        .collection<MongoUser>(collectionName)
        .findOne({ WalletId: input.walletId });
      console.log("getUserByWallet: ", input);
      return exists;
    }),
});
