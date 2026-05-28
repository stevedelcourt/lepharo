import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { polls, pollOptions, users, entraideListings } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB indisponible" }, { status: 503 });

  const results: string[] = [];

  // Seed avatar URLs for users who don't have one
  const avatars: Record<number, string> = {
    1: "https://i.pravatar.cc/150?u=lepharo-marie",
    2: "https://i.pravatar.cc/150?u=lepharo-jp",
    3: "https://i.pravatar.cc/150?u=lepharo-sophie",
    4: "https://i.pravatar.cc/150?u=lepharo-lucas",
    5: "https://i.pravatar.cc/150?u=lepharo-marguerite",
    6: "https://i.pravatar.cc/150?u=lepharo-karim",
    7: "https://i.pravatar.cc/150?u=lepharo-paul",
    8: "https://i.pravatar.cc/150?u=lepharo-camille",
    9: "https://i.pravatar.cc/150?u=lepharo-henri",
    10: "https://i.pravatar.cc/150?u=lepharo-emma",
  };
  for (const [id, url] of Object.entries(avatars)) {
    await db.update(users).set({ avatarUrl: url }).where(eq(users.id, parseInt(id))).run();
  }
  results.push("Avatar URLs updated");

  // Seed sample polls
  const existingPolls = await db.select({ id: polls.id }).from(polls).all();
  if (existingPolls.length === 0) {
    const samplePolls = [
      {
        q: "Faut-il installer des caméras de surveillance dans les parties communes ?",
        opts: ["Oui, c'est nécessaire pour la sécurité", "Non, c'est une atteinte à la vie privée", "Je ne sais pas / Sans opinion"],
        au: 1,
      },
      {
        q: "Quel jour préférez-vous pour l'apéro des voisins ?",
        opts: ["Vendredi", "Samedi", "Dimanche", "Peu importe"],
        au: 3,
      },
      {
        q: "Souhaitez-vous un potager partagé sur la terrasse ?",
        opts: ["Oui, je participerai", "Oui, mais je ne peux pas aider", "Non, ça prend trop de place"],
        au: 1,
      },
      {
        q: "Faut-il réserver une partie du local poubelle pour les vélos ?",
        opts: ["Oui, c'est une bonne idée", "Non, les vélos doivent rester dehors", "À discuter en AG"],
        au: 8,
      },
      {
        q: "À quelle fréquence souhaitez-vous des ateliers cuisine collective ?",
        opts: ["Une fois par mois", "Une fois par semaine", "De temps en temps", "Pas intéressé"],
        au: 1,
      },
    ];

    for (const poll of samplePolls) {
      const result = await db.insert(polls).values({
        question: poll.q,
        authorId: poll.au,
        createdAt: sql`(datetime('now'))`,
      }).returning({ id: polls.id });
      const pollId = result[0].id;
      for (const opt of poll.opts) {
        await db.insert(pollOptions).values({ pollId, label: opt }).run();
      }
    }
    results.push(`5 sample polls seeded`);
  } else {
    results.push(`${existingPolls.length} polls already exist`);
  }

  // Seed additional listings with photos (if less than 10 exist)
  const existingListings = await db.select({ id: entraideListings.id }).from(entraideListings).all();
  if (existingListings.length < 10) {
    const moreListings: { type: string; title: string; description: string; category: string; authorId: number; images: string }[] = [
      { type: "vente", title: "Table basse en verre 80cm", description: "Plateau verre trempe, pieds chromes. 40€.", category: "vente", authorId: 1, images: '["https://picsum.photos/seed/table1/400/300","https://picsum.photos/seed/table2/400/300"]' },
      { type: "vente", title: "Velo de ville Peugeot", description: "24 vitesses, freins a disque. 120€.", category: "vente", authorId: 4, images: '["https://picsum.photos/seed/velo1/400/300","https://picsum.photos/seed/velo2/400/300"]' },
      { type: "vente", title: "iPhone 13 128Go bleu", description: "Sous garantie, coque+vitre. 450€.", category: "vente", authorId: 10, images: '["https://picsum.photos/seed/iphone1/400/300","https://picsum.photos/seed/iphone2/400/300"]' },
      { type: "vente", title: "Canape convertible 3 places", description: "Gris clair, mecanisme facile. 200€.", category: "vente", authorId: 3, images: '["https://picsum.photos/seed/canape1/400/300","https://picsum.photos/seed/canape2/400/300"]' },
      { type: "vente", title: "Plantes vertes d appartement", description: "Monstera, pothos, sanseviere. 15€.", category: "vente", authorId: 1, images: '["https://picsum.photos/seed/plante1/400/300","https://picsum.photos/seed/plante2/400/300"]' },
      { type: "vente", title: "Machine a cafe Nespresso", description: "Peu utilisee, 20 dosettes. 80€.", category: "vente", authorId: 7, images: '["https://picsum.photos/seed/cafe1/400/300"]' },
      { type: "vente", title: "Enceinte JBL Charge 5", description: "Son puissant, etat neuf. 60€.", category: "vente", authorId: 9, images: '["https://picsum.photos/seed/jbl1/400/300"]' },
      { type: "propose", title: "Perceuse, visseuse, scie", description: "Prete mes outils Bosch, DeWalt, Makita.", category: "pret", authorId: 6, images: '["https://picsum.photos/seed/outil1/400/300","https://picsum.photos/seed/outil2/400/300"]' },
      { type: "propose", title: "Cours de yoga collectif", description: "Yoga doux, mardis et jeudis 18h.", category: "divers", authorId: 8, images: '["https://picsum.photos/seed/yoga1/400/300"]' },
    ];
    for (const l of moreListings) {
      await db.insert(entraideListings).values({
        type: l.type, title: l.title, description: l.description, category: l.category,
        authorId: l.authorId, images: l.images, status: "open",
        createdAt: sql`(datetime('now'))`,
      }).run();
    }
    results.push(`${moreListings.length} listings seeded with photos`);
  } else {
    results.push(`${existingListings.length} listings already exist`);
  }

  return NextResponse.json({ success: true, results });
}
