import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { getUserNFTbyMint } from "server/services/nfts-service";
import type { FeatureNFTRequest } from "server/services/feature-service";
import featureService from "server/services/feature-service";

export const featureRouter = router({
  featureNFT: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
        nonce: z.string(),
        serializedTx: z.string(),
        signedMessage: z.string(),
        stringMessage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mint, nonce, serializedTx, signedMessage, stringMessage } = input;

      const wallet = ctx.session.walletId;
      const request: FeatureNFTRequest = {
        wallet: wallet,
        mintAddress: mint,
        nonce,
        serializedTx,
        signedMessage,
        stringMessage,
      };
      await featureService.confirmFeatureTx(request);
      return {
        featured: true,
      };
    }),
});
