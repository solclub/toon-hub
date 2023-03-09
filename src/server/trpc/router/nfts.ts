import { z } from "zod";
import rudeNFTModels, {
  DemonNFT,
  GolemNFT,
} from "../../database/models/nft.model";
import { getUserNFTs } from "../../web3/web3";
import { router, protectedProcedure } from "../trpc";

export const nftsRouter = router({
  getUserNFTs: protectedProcedure.query(async ({ ctx }) => {
    const userNFTs = await getUserNFTs();
    const result = await rudeNFTModels
      .GolemModel()
      .find({ mint: { $in: userNFTs.mints } });
    return result;
  }),
  getUserNFTbyMint: protectedProcedure
    .input(z.object({ mint: z.string(), collection: z.string() }))
    .query(async ({ ctx, input }) => {
      const { mint, collection } = input;
      if (collection == "golems") {
        const result = await rudeNFTModels.GolemModel().findOne({ mint: mint });
        return result?.toObject() as GolemNFT;
      } else {
        const result = await rudeNFTModels.DemonModel().findOne({ mint: mint });
        return result?.toObject() as DemonNFT;
      }
    }),
});
