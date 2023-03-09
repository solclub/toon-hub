import { z } from "zod";
import userModel from "../../database/models/user.model";
import { router, publicProcedure } from "../trpc";
export const usersRouter = router({
  getUserByWallet: publicProcedure
    .input(z.object({ walletId: z.string() }))
    .query(async ({ ctx, input }) => {
      const exists = await userModel().findOne({
        walletId: input.walletId,
      });
      return exists?.toObject();
    }),
});
