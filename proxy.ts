import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirect to lowercase path when the request path contains uppercase letters.
 * Prevents 404 on case-sensitive systems (Linux/Vercel) when links or URLs use wrong case.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const lower = pathname.toLowerCase();
  if (pathname !== lower) {
    const url = request.nextUrl.clone();
    url.pathname = lower;
    return NextResponse.redirect(url, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)",
  ],
};
