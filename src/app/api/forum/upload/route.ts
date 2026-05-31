import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import sharp from "sharp";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("images") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (files.length > 4) {
    return NextResponse.json({ error: "Maximum 4 photos autorisées" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Tous les fichiers doivent être des images" }, { status: 400 });
    }

    try {
      const buffer = await file.arrayBuffer();
      const processed = await sharp(Buffer.from(buffer))
        .resize(1000, undefined, { withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 85 })
        .withMetadata({ density: 72 })
        .toBuffer();

      const { put } = await import("@vercel/blob");
      const name = `forum/${session.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
      const blob = await put(name, processed, {
        access: "public",
        contentType: "image/webp",
      });
      urls.push(blob.url);
    } catch {
      return NextResponse.json({ error: "Erreur lors du traitement de l'image" }, { status: 500 });
    }
  }

  return NextResponse.json({ urls });
}
