import { router } from "../trpc";
import { authRouter } from "../auth";
import { exampleRouter } from "../example";
import { nftsRouter } from "../nfts";
import { usersRouter } from "../user";
import { catalogRouter } from "../catalog";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  users: usersRouter,
  nfts: nftsRouter,
  catalog: catalogRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
