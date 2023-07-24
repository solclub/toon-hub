import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./trpc/trpc-context";
import { TRPCError } from "@trpc/server";
import service from "server/services/weapon-service";

export const weaponsRouter = router({
  randomWeapon: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
        nonce: z.string(),
        serializedTx: z.string(),
        slot: z.number().int().min(1).max(4),
        signedMessage: z.string(),
        stringMessage: z.string(),
        nftType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mint, nonce, serializedTx, signedMessage, stringMessage, nftType } = input;
      //ctx.validateSignedMessage(signedMessage, stringMessage, nonce, ctx.csrf);
    }),
  equippedWeapons: protectedProcedure
    .input(
      z.object({
        mint: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { mint } = input;
      const wallet = ctx.session.walletId;
      return await service.getWeaponsEquipped(mint, wallet);
    }),
});
