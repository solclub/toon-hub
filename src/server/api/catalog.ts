import { z } from "zod";
import { router, protectedProcedure } from "./trpc/trpc-context";
import { ProductType } from "server/database/models/catalog.model";
import { NFTType } from "server/database/models/nft.model";
import catalogService from "server/services/catalog-service";

export const catalogRouter = router({
  getProductAF: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(ProductType),
        collection: z.nativeEnum(NFTType).nullish(),
      })
    )
    .query(async ({ input }) => {
      const { type, collection } = input;
      const result = await catalogService.getProductsByTypeAndCollection(type, collection);
      return result;
    }),
  getAll: protectedProcedure.query(async ({}) => {
    return await catalogService.getAll();
  }),
});
