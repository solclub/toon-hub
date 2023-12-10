import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import { getCsrfToken } from "next-auth/react";
import { getServerAuthSession } from "server/common/get-server-auth-session";
import { validateSignedMessage } from "server/common/validate-signed-message";
import dbConnect from "server/database/mongoose";

type CreateContextOptions = {
  session: Session | null;
  csrf: string | undefined;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  await dbConnect();
  return {
    session: opts.session,
    csrf: opts.csrf,
    validateSignedMessage,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });
  const csrf = await getCsrfToken({ req: { headers: req.headers } });

  return await createContextInner({
    session,
    csrf,
  });
};

export type Context = inferAsyncReturnType<typeof createContext>;
