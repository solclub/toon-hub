import { withAuth } from "next-auth/middleware";

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
