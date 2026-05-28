import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users, forumTopics, forumReplies, forumRubriques, entraideListings, documents, events, alerts, adminWarnings,
} from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });
  }

  const body = await request.json();
  const { action } = body;

  switch (action) {

    case "update": {
      const { table, id, data } = body;
      const tableMap: Record<string, any> = {
        users, forum_topics: forumTopics, forum_replies: forumReplies,
        forum_rubriques: forumRubriques,
        entraide_listings: entraideListings, documents, events, alerts,
      };
      const tbl = tableMap[table];
      if (!tbl || !id || !data) {
        return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
      }
      // Column name to Drizzle property name mapping
      const colToProp: Record<string, string> = {
        "first_name": "firstName", "last_name": "lastName", "admin_role": "adminRole",
      };
      const allowed: Record<string, string[]> = {
        users: ["first_name", "last_name", "email", "floor", "role", "verified", "phone", "bio", "admin_role"],
        forum_topics: ["title", "content", "rubrique", "pinned", "locked"],
        forum_replies: ["content"],
        forum_rubriques: ["name", "slug", "description"],
        entraide_listings: ["title", "description", "category", "type", "status"],
        documents: ["title", "category", "pages", "date"],
        events: ["title", "description", "date", "type"],
        alerts: ["message", "type", "active"],
      };
      const allowedCols = allowed[table] || [];
      const cleanData: Record<string, any> = {};
      for (const col of allowedCols) {
        if (col in data) {
          const prop = colToProp[col] || col;
          cleanData[prop] = data[col];
        }
      }
      if (Object.keys(cleanData).length === 0) {
        return NextResponse.json({ error: "Aucune colonne valide à mettre à jour" }, { status: 400 });
      }
      if (table === "users" && "verified" in data) {
        cleanData.verified = data.verified === true || data.verified === 1 ? 1 : 0;
      }
      await db.update(tbl).set(cleanData).where(eq(tbl.id, id)).run();
      return NextResponse.json({ success: true });
    }

    case "warn": {
      const { userId, message } = body;
      if (!userId || !message) {
        return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
      }
      const result = await db.insert(adminWarnings).values({
        userId,
        message,
        createdBy: session.id,
      }).run();
      return NextResponse.json({ success: true, id: result.lastInsertRowid });
    }

    case "moderate": {
      const { table, id, field, value } = body;
      const tableMap: Record<string, any> = {
        forum_topics: forumTopics,
        entraide_listings: entraideListings,
        users,
        alerts,
      };
      const tbl = tableMap[table];
      if (!tbl || !id || !field) {
        return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
      }
      const safeFields = ["pinned", "locked", "status", "verified", "active"];
      if (!safeFields.includes(field)) {
        return NextResponse.json({ error: "Champ non autorisé" }, { status: 400 });
      }
      const setValue = typeof value === "boolean" ? (value ? 1 : 0) : value;
      await db.update(tbl).set({ [field]: setValue }).where(eq(tbl.id, id)).run();
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }
}
