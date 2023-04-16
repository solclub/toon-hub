import { z } from "zod";

import { router, protectedProcedure } from "./trpc/trpc-context";
import type { UpdateMetadataRequest } from "server/services/upgrade-service";
import upgradeService from "server/services/upgrade-service";
import { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";
import { addUpgradedImage, getUserNFTbyMint } from "server/services/nfts-service";

export const upgradeRouter = router({
  buildImagePreview: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
        upgradeType: z.nativeEnum(DemonUpgrades).or(z.nativeEnum(GolemUpgrades)),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mint, upgradeType } = input;
      const wallet = ctx.session.walletId;
      const nft = await getUserNFTbyMint(wallet, mint);
      if (nft && nft.type) {
        const upgradeUrlImage = await upgradeService.buildUpgradeImage(
          mint,
          nft.type,
          upgradeType,
          nft.attributes
        );

        const base64 = upgradeUrlImage.toString("base64");
        const base = `data:image/png";base64,${base64}`;

        await addUpgradedImage(mint, upgradeType, base ?? "");

        return base;
      }
      return "";
    }),
  upgradeMetadata: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
        upgradeType: z.nativeEnum(DemonUpgrades).or(z.nativeEnum(GolemUpgrades)),
        nonce: z.string(),
        serializedTx: z.string(),
        signedMessage: z.string(),
        stringMessage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mint, upgradeType, nonce, serializedTx, signedMessage, stringMessage } = input;

      const wallet = ctx.session.walletId;
      const nft = await getUserNFTbyMint(wallet, mint);
      let upgradeUrlImage;
      if (nft && nft.type) {
        const request: UpdateMetadataRequest = {
          wallet: wallet,
          attributes: nft.attributes,
          collection: nft.type,
          mintAddress: mint,
          nonce,
          serializedTx,
          signedMessage,
          stringMessage,
          upgradeType: upgradeType,
        };
        upgradeUrlImage = await upgradeService.upgradeMetadata(request);
      }

      return upgradeUrlImage;
    }),
});
