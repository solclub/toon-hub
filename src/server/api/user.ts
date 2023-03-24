import { z } from "zod";
import type { IUser } from "../database/models/user.model";
import userModel from "../database/models/user.model";
import { router, publicProcedure } from "./trpc";
export const usersRouter = router({
  getUserByWallet: publicProcedure
    .input(z.object({ walletId: z.string() }))
    .query(async ({ input }) => {
      const exists = await userModel().findOne({
        walletId: input.walletId,
      });
      return exists?.toObject() ?? ({} as IUser);
    }),
});
