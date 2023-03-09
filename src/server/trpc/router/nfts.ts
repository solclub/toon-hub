import { getUserNFTs } from "../../web3/web3";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const nftsRouter = router({
  getUserNFTs: protectedProcedure.query(async ({ ctx }) => {
    const userNFTs = await getUserNFTs(ctx.session.walletId);
  }),
});
