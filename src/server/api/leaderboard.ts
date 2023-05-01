import { router, publicProcedure } from "./trpc/trpc-context";
import type { Leaderboard } from "server/services/leaderboard-service";
import leaderboardService from "server/services/leaderboard-service";
import { z } from "zod";

export const leaderboardRouter = router({
  get: publicProcedure
    .input(
      z.object({
        nftType: z.enum(["GOLEM", "DEMON", "ALL", "WALLET"]),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().min(0).max(100).default(0),
      })
    )
    .query(async ({ input }) => {
      const { nftType, cursor, limit } = input;
      let items: Leaderboard[] = [];
      if (nftType === "WALLET") {
        items = await leaderboardService.getWalletLeaderboard(cursor, limit);
      } else if (["GOLEM", "DEMON", "ALL"].includes(nftType)) {
        items = await leaderboardService.getLeaderboard(cursor, limit, nftType);
      }
      return { items, nextCursor: cursor + limit };
    }),
  getItemPosition: publicProcedure
    .input(
      z.object({
        mint: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { mint } = input;
      if (!mint) return { item: -1 };
      const item = await leaderboardService.getItemPosition(mint);
      return { item };
    }),
});
