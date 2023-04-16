import { z } from "zod";
import { router, protectedProcedure } from "./trpc/trpc-context";
import type { FeatureNFTRequest } from "server/services/feature-service";
import featureService from "server/services/feature-service";
import { TRPCError } from "@trpc/server";

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
      ctx.validateSignedMessage(signedMessage, stringMessage, nonce);

      const wallet = ctx.session.walletId;
      const request: FeatureNFTRequest = {
        wallet: wallet,
        mintAddress: mint,
        serializedTx,
      };
      const result = await featureService.confirmAndSave(request);

      if (result.status == "FAILED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.message,
          cause: result.data,
        });
      }
    }),
});
