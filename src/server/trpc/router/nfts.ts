import { z } from "zod";
import rudeNFTModels from "../../database/models/nft.model";
import { getUserNFTs } from "../../web3/web3";
import { router, protectedProcedure } from "../trpc";

export const nftsRouter = router({
  getUserNFTs: protectedProcedure.query(async ({}) => {
    const userNFTs = await getUserNFTs();
    const golems = await rudeNFTModels
      .GolemModel()
      .find({ mint: { $in: userNFTs.mints } });
    const demons = await rudeNFTModels
      .DemonModel()
      .find({ mint: { $in: userNFTs.mints } });

    return [...golems, ...demons];
  }),
  getUserNFTbyMint: protectedProcedure
    .input(z.object({ mint: z.string(), collection: z.string() }))
    .query(async ({ input }) => {
      const { mint, collection } = input;
      if (collection == "golems") {
        const result = await rudeNFTModels.GolemModel().findOne({ mint: mint });
        return result?.toObject();
      } else {
        const result = await rudeNFTModels.DemonModel().findOne({ mint: mint });
        return result?.toObject();
      }
    }),
});
