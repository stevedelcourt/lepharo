import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "L'image ne doit pas dépasser 10 Mo" }, { status: 400 });
  }

  try {
    const { put } = await import("@vercel/blob");
    const ext = file.name.split(".").pop() || "jpg";
    const blob = await put(`articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
