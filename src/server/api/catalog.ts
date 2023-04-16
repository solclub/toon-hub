import { z } from "zod";

import { router, protectedProcedure } from "./trpc/trpc-context";
import { ProductType } from "types/catalog";
import type { Product } from "types/catalog";
import catalog from "server/data/catalog.json";
import { NFTType } from "server/database/models/nft.model";

export const catalogRouter = router({
  getProduct: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(ProductType),
        collection: z.nativeEnum(NFTType).nullish(),
      })
    )
    .query(({ input }) => {
      const { type, collection } = input;
      const result = catalog.filter(
        (x) => (collection ? x.collection == collection : true) && x.type == type
      ) as Product[];

      if (result.length == 1) {
        return result[0];
      }
      return {} as Product;
    }),
});
