import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For now, we'll handle auth redirects on the client side
  // This middleware can be enhanced later for server-side auth checking
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
