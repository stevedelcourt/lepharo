import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const db = getDb();
  let userData: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    floor: number | null;
    phone: string | null;
    bio: string | null;
    tagline: string | null;
    avatarUrl: string | null;
    senior: boolean;
    showFullName: boolean;
    hasPassword: boolean;
  };

  if (db) {
    let u: any;
    try {
      u = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        floor: users.floor,
        phone: users.phone,
        bio: users.bio,
      tagline: users.tagline,
        avatarUrl: users.avatarUrl,
        senior: users.senior,
      showFullName: users.showFullName,
        passwordHash: users.passwordHash,
      }).from(users).where(eq(users.id, session.id)).get();
    } catch {
      u = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        floor: users.floor,
        phone: users.phone,
        bio: users.bio,
      tagline: users.tagline,
        avatarUrl: users.avatarUrl,
        passwordHash: users.passwordHash,
      }).from(users).where(eq(users.id, session.id)).get();
    }

    if (!u) redirect("/connexion");

    userData = {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      floor: u.floor,
      phone: u.phone,
      bio: u.bio,
      tagline: u.tagline,
      avatarUrl: u.avatarUrl,
      senior: u.senior,
      showFullName: u.showFullName ?? false,
      hasPassword: !!u.passwordHash,
    };
  } else {
    userData = {
      id: session.id,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      floor: null,
      phone: null,
      bio: null,
      tagline: null,
      avatarUrl: null,
      senior: false,
      showFullName: false,
      hasPassword: true,
    };
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 32 }}>Mon profil</h1>
      <ProfileForm user={userData} />
    </div>
  );
}
