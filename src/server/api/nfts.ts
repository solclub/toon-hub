import { z } from "zod";
import {
  getSyncedNfts,
  getUserNFTbyMint,
  getUserNFTs,
  getWalletBalanceTokens,
} from "server/services/nfts-service";
import { router, protectedProcedure } from "./trpc/trpc-context";

export const nftsRouter = router({
  getUserNFTs: protectedProcedure
    .input(z.object({ collection: z.enum(["GOLEM", "DEMON", "ALL"]) }))
    .query(async ({ ctx, input }) => {
      const { collection } = input;
      const wallet = ctx.session.walletId;
      const userNFTs = await getUserNFTs(wallet);
      return collection == "ALL" ? userNFTs : userNFTs.filter((x) => x.type == collection);
    }),
  getUserNFTbyMint: protectedProcedure
    .input(z.object({ mint: z.string() }))
    .query(async ({ ctx, input }) => {
      const { mint } = input;
      const wallet = ctx.session.walletId;
      const finded = getUserNFTbyMint(wallet, mint);
      return finded;
    }),
  getWalletBalance: protectedProcedure.query(async ({ ctx }) => {
    const wallet = ctx.session.walletId;
    const balance = await getWalletBalanceTokens(wallet);
    return balance;
  }),
  getUserMints: protectedProcedure.query(async ({ ctx }) => {
    const wallet = ctx.session.walletId;
    const mints = await getSyncedNfts(wallet);
    return mints;
  }),
});
