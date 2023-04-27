import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./trpc/trpc-context";
import type { FeatureNFTRequest } from "server/services/feature-service";
import featureService from "server/services/feature-service";
import { TRPCError } from "@trpc/server";
import { getUserNFTbyMint } from "server/services/nfts-service";
import userModel from "server/database/models/user.model";

export const featureRouter = router({
  featureNFT: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
        nonce: z.string(),
        serializedTx: z.string(),
        signedMessage: z.string(),
        stringMessage: z.string(),
        nftType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mint, nonce, serializedTx, signedMessage, stringMessage, nftType } = input;
      ctx.validateSignedMessage(signedMessage, stringMessage, nonce);

      const wallet = ctx.session.walletId;
      const request: FeatureNFTRequest = {
        nftType: nftType,
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
  latest: publicProcedure.query(async () => {
    const result = await featureService.getLastFeaturedNFT();

    if (!result) return { nft: null, user: null };

    const nft = await getUserNFTbyMint(result.wallet, result.mint);
    const user = await userModel().findOne({
      walletId: result.wallet,
    });

    return { nft, user };
  }),
  userFeaturedNfts: protectedProcedure.query(async ({ ctx }) => {
    const wallet = ctx.session.walletId;
    const featuredNFTs = await featureService.getUserFeaturedNFTs(wallet);
    return { featuredNFTs };
  }),

  userFeaturedNftByMint: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
      })
    )
    .query(async ({ input }) => {
      const featuredNFT = await featureService.getUserFeaturedNFTByMint(input.mint);
      return { featuredNFT };
    }),
});
