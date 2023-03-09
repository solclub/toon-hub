import rudeNFTModels from "../../database/models/nft.model";
import { getUserNFTs } from "../../web3/web3";
import { router, protectedProcedure } from "../trpc";

export const nftsRouter = router({
  getUserNFTs: protectedProcedure.query(async () => {
    const userNFTs = await getUserNFTs();
    const result = await rudeNFTModels
      .GolemModel()
      .find({ mint: { $in: userNFTs.mints } });
    return result;
  }),
});
