import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { forumRubriques } from "@/lib/schema";
import NouveauClient from "./nouveau-client";

export const dynamic = "force-dynamic";

const fallbackRubriques = [
  { id: 1, name: "Vie quotidienne", slug: "vie-quotidienne" },
  { id: 2, name: "Travaux et entretien", slug: "travaux" },
  { id: 3, name: "Nuisibles et problèmes sanitaires", slug: "nuisibles" },
  { id: 4, name: "Syndic et gouvernance", slug: "syndic" },
  { id: 5, name: "Le quartier du Pharo", slug: "quartier" },
  { id: 6, name: "Le Bistrot", slug: "bistrot" },
];

export default async function NouveauSujetPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const db = getDb();
  let rubriques = fallbackRubriques;
  if (db) {
    const rows = await db.select({ id: forumRubriques.id, name: forumRubriques.name, slug: forumRubriques.slug }).from(forumRubriques).all();
    if (rows.length > 0) rubriques = rows;
  }

  return <NouveauClient rubriques={rubriques} />;
}
