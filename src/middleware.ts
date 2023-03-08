import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "./env/server.mjs";
import { getToken, JWT } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { getSession } from "next-auth/react/index.js";

export const config = {
  matcher: "/api/auth/:provider/",
};

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    console.log("middleware", req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === "admin",
    },
  }
);

// export async function middleware(req: NextRequest) {
//   if (req.url.includes("callback")) {
//     console.log("middleware");
//   }

//   if (req.url.includes("callback")) {
//     console.log("middleware");
//   }
//   return NextResponse.next();
// }
