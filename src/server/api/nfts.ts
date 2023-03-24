import { z } from "zod";
import {
  getUserNFTbyMint,
  getUserNFTs,
  getWalletBalanceTokens,
} from "server/services/nfts-service";
import { router, protectedProcedure } from "./trpc";

export const nftsRouter = router({
  getUserNFTs: protectedProcedure.query(async ({ ctx }) => {
    const wallet = ctx.session.walletId;
    const userNFTs = await getUserNFTs(wallet);
    return userNFTs;
  }),
  getUserNFTbyMint: protectedProcedure
    .input(z.object({ mint: z.string() }))
    .query(async ({ ctx, input }) => {
      const { mint } = input;
      const wallet = ctx.session.walletId;
      return getUserNFTbyMint(wallet, mint);
    }),
  getWalletBalance: protectedProcedure.query(async ({ ctx }) => {
    const wallet = ctx.session.walletId;
    const balance = await getWalletBalanceTokens(wallet);
    return balance;
  }),
});
