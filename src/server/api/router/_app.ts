import { router } from "../trpc/trpc-context";
import { authRouter } from "../auth";
import { nftsRouter } from "../nfts";
import { usersRouter } from "../user";
import { catalogRouter } from "../catalog";
import { upgradeRouter } from "../upgrade";
import { featureRouter } from "../feature";
import { leaderboardRouter } from "../leaderboard";
import { weaponsRouter } from "../weapon";
import { conquestRouter } from "../conquest";
import { gameManagementRouter } from "../game-management";
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  nfts: nftsRouter,
  catalog: catalogRouter,
  upgradeNft: upgradeRouter,
  featureNft: featureRouter,
  leaderboard: leaderboardRouter,
  weapons: weaponsRouter,
  conquest: conquestRouter,
  gameManagement: gameManagementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
