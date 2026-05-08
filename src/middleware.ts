import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = process.env.MISSION_CONTROL_PASSWORD || "bjjlotus";
const AUTH_COOKIE = "mission-control-auth";
const AUTH_COOKIE_VALUE = "authenticated-v1";

export function middleware(request: NextRequest) {
  // Check if already authenticated via cookie
  const authCookie = request.cookies.get(AUTH_COOKIE);
  if (authCookie?.value === AUTH_COOKIE_VALUE) {
    return NextResponse.next();
  }

  // Check for password in query param (for simple login)
  const url = new URL(request.url);
  const providedPassword = url.searchParams.get("auth");
  
  if (providedPassword === PASSWORD) {
    // Set cookie and redirect to remove password from URL
    const response = NextResponse.redirect(new URL(url.pathname, request.url));
    response.cookies.set(AUTH_COOKIE, AUTH_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  // Not authenticated - show login page
  if (url.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|api).*)",
  ],
};
