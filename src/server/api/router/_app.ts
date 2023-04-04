import { router } from "../trpc";
import { authRouter } from "../auth";
import { nftsRouter } from "../nfts";
import { usersRouter } from "../user";
import { catalogRouter } from "../catalog";
import { upgradeRouter } from "../upgrade";

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  nfts: nftsRouter,
  catalog: catalogRouter,
  upgradeNft: upgradeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
