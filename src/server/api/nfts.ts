import { z } from "zod";
import { getUserNFTbyMint, getUserNFTs } from "server/services/nfts-service";
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
});
