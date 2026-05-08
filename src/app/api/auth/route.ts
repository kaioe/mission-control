import { NextResponse } from "next/server";

const PASSWORD = process.env.MISSION_CONTROL_PASSWORD || "bjjlotus";
const AUTH_COOKIE = "mission-control-auth";
const AUTH_COOKIE_VALUE = "authenticated-v1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedPassword = url.searchParams.get("password");

  if (providedPassword !== PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Return success with cookie to be set
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
