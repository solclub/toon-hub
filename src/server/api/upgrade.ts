import { z } from "zod";

import { router, protectedProcedure } from "./trpc";
import { NFTType } from "server/database/models/nft.model";
import { buildUpgradeImage } from "server/services/upgrade-service";
import { DemonUpgrades, GolemUpgrades } from "server/database/models/user-nfts.model";
import { getUserNFTbyMint } from "server/services/nfts-service";

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
        const upgradeUrlImage = await buildUpgradeImage(
          mint,
          nft.type,
          upgradeType,
          nft.attributes
        );
        console.log("upgradeUrlImage", upgradeUrlImage);
        return upgradeUrlImage;
      }
      return "";
    }),
  upgradeNFT: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
        upgradeType: z.nativeEnum(DemonUpgrades).or(z.nativeEnum(GolemUpgrades)),
        imageUrl: z.string().url().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mint, upgradeType, imageUrl } = input;
      const wallet = ctx.session.walletId;
      const nft = await getUserNFTbyMint(wallet, mint);
      let upgradeUrlImage;
      if (nft && nft.type && !imageUrl) {
        upgradeUrlImage = await buildUpgradeImage(mint, nft.type, upgradeType, nft.attributes);
      }

      return upgradeUrlImage ?? "";
    }),
});
