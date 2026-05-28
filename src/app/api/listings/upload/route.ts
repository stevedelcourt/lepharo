import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { put } = await import("@vercel/blob");
  const formData = await request.formData();
  const files = formData.getAll("images") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Tous les fichiers doivent être des images" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Chaque image ne doit pas dépasser 10 Mo" }, { status: 400 });
    }
    const ext = file.name.split(".").pop() || "jpg";
    const blob = await put(`listings/${session.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, file, {
      access: "public",
    });
    urls.push(blob.url);
  }

  return NextResponse.json({ urls });
}
