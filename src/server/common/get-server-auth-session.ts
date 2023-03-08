import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

import { createOptions } from "../../pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs
 * See example usage in trpc createContext or the restricted API route
 */
export const getServerAuthSession = async (ctx: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<Session | null> => {
  return await getServerSession(
    ctx.req,
    ctx.res,
    await createOptions(ctx.req, ctx.res)
  );
};
