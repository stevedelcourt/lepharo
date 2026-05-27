import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getGoogleTokens, getGoogleUser } from "@/lib/google-auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

const STATE_SECRET = new TextEncoder().encode("google-state-secret");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  if (!code || !returnedState) {
    return NextResponse.redirect(new URL("/connexion?error=google_missing_params", request.url));
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google-oauth-state")?.value;
  cookieStore.delete("google-oauth-state");

  if (!storedState) {
    return NextResponse.redirect(new URL("/connexion?error=google_no_state", request.url));
  }

  try {
    await jwtVerify(returnedState, STATE_SECRET);
  } catch {
    return NextResponse.redirect(new URL("/connexion?error=google_invalid_state", request.url));
  }

  let tokens;
  try {
    tokens = await getGoogleTokens(code);
  } catch {
    return NextResponse.redirect(new URL("/connexion?error=google_token_failed", request.url));
  }

  let googleUser;
  try {
    googleUser = await getGoogleUser(tokens.access_token);
  } catch {
    return NextResponse.redirect(new URL("/connexion?error=google_userinfo_failed", request.url));
  }

  const { id: googleId, email, given_name, family_name } = googleUser;

  if (!email) {
    return NextResponse.redirect(new URL("/connexion?error=google_no_email", request.url));
  }

  const db = getDb()!;

  let user = db.select().from(users).where(eq(users.email, email)).get();

  if (user) {
    if (!user.googleId) {
      db.update(users).set({ googleId }).where(eq(users.id, user.id)).run();
    }
  } else {
    const result = db.insert(users).values({
      firstName: given_name || email.split("@")[0],
      lastName: family_name || "",
      email,
      googleId,
      role: "resident",
      verified: true,
    }).returning().get();

    user = result;
  }

  await createSession({
    id: user!.id,
    email: user!.email,
    firstName: user!.firstName,
    lastName: user!.lastName,
    role: user!.role,
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
