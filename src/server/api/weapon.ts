import { TRPCError } from "@trpc/server";
import type { RandomWeaponRequest, SlotNumber } from "server/services/weapon-service";
import service from "server/services/weapon-service";
import { z } from "zod";
import { protectedProcedure, router } from "./trpc/trpc-context";

export const weaponsRouter = router({
  buyWeapon: protectedProcedure
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
      const { mint, nonce, serializedTx, signedMessage, stringMessage, nftType, slot } = input;
      ctx.validateSignedMessage(signedMessage, stringMessage, nonce, ctx.csrf);

      const wallet = ctx.session.walletId;
      const request: RandomWeaponRequest = {
        mintAddress: mint,
        wallet: wallet,
        verifiedOwner: wallet,
        serializedTx,
        nftType: nftType,
        slot: slot as SlotNumber,
      };
      const result = await service.confirmAndSave(request);

      if (result.status == "FAILED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.message,
          cause: result.data,
        });
      }
      return result.data?.slots.find((x) => x.itemMetadata?.slotNumber === slot)?.itemMetadata;
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
  getSlotRollTimes: protectedProcedure.input(z.object({})).query(async ({}) => {
    return await service.getSlotRollTimes();
  }),
});
