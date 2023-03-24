import { router } from "../trpc";
import { authRouter } from "../auth";
import { exampleRouter } from "../example";
import { nftsRouter } from "../nfts";
import { usersRouter } from "../user";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  users: usersRouter,
  nfts: nftsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
