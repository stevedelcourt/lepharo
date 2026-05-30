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

  const db = getDb();
  if (!db) {
    return NextResponse.redirect(new URL("/connexion?error=db_unavailable", request.url));
  }

  let user: any;
  try {
    const rows = await db.select({
      id: users.id, email: users.email, firstName: users.firstName,
      lastName: users.lastName, role: users.role, adminRole: users.adminRole,
      googleId: users.googleId,
    }).from(users).where(eq(users.email, email)).limit(1).execute();
    user = rows[0] || null;
  } catch {
    return NextResponse.redirect(new URL("/connexion?error=db_query_failed", request.url));
  }

  if (user) {
    if (!user.googleId) {
      try {
        await db.update(users).set({ googleId }).where(eq(users.id, user.id)).run();
      } catch {
        return NextResponse.redirect(new URL("/connexion?error=db_update_failed", request.url));
      }
    }
  } else {
    try {
      await db.insert(users).values({
        firstName: given_name || email.split("@")[0],
        lastName: family_name || "",
        email,
        googleId,
        role: "resident",
        verified: true,
      }).run();
      const rows = await db.select({
        id: users.id, email: users.email, firstName: users.firstName,
        lastName: users.lastName, role: users.role, adminRole: users.adminRole,
        googleId: users.googleId,
      }).from(users).where(eq(users.email, email)).limit(1).execute();
      user = rows[0] || null;
    } catch {
      return NextResponse.redirect(new URL("/connexion?error=db_insert_failed", request.url));
    }
  }

  try {
    await createSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      adminRole: (user as any).adminRole || null,
    });
  } catch {
    return NextResponse.redirect(new URL("/connexion?error=session_failed", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
