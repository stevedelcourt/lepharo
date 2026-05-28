import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }

  let avatarUrl: string;
  try {
    const { put } = await import("@vercel/blob");
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit etre une image" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "L image ne doit pas depasser 5 Mo" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const blob = await put(`avatars/${session.id}-${Date.now()}.${ext}`, file, {
      access: "public",
    });

    avatarUrl = blob.url;
  } catch {
    return NextResponse.json({ error: "Erreur lors du telechargement" }, { status: 500 });
  }

  await db.update(users).set({ avatarUrl }).where(eq(users.id, session.id)).run();

  return NextResponse.json({ avatarUrl });
}
