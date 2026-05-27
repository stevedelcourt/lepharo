import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleAuthURL } from "@/lib/google-auth";
import { SignJWT } from "jose";

const STATE_SECRET = new TextEncoder().encode("google-state-secret");

export async function GET() {
  const state = await new SignJWT({ ts: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(STATE_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("google-oauth-state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = getGoogleAuthURL(state);
  return NextResponse.redirect(url);
}
