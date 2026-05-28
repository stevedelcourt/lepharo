// Run: npx tsx scripts/seed.ts
// Seeds local SQLite DB or Turso with sample data (avatars, listings with photos, etc.).
// For Turso, set TURSO_DB_URL and TURSO_DB_TOKEN env vars first.
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const useTurso = !!(process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN);

async function run() {
  let db: any;
  if (useTurso) {
    db = createClient({ url: process.env.TURSO_DB_URL!, authToken: process.env.TURSO_DB_TOKEN! });
    console.log("Seeding Turso DB...");
  } else {
    const dbPath = path.join(process.cwd(), "data", "lepharo.db");
    if (!fs.existsSync(dbPath)) { console.log("DB not found at", dbPath); process.exit(1); }
    db = new Database(dbPath);
    console.log("Seeding local SQLite DB...");
  }

  async function exec(sql: string, args?: any[]) {
    if (useTurso) {
      if (args) return (await db.execute({ sql, args })).rows;
      return (await db.execute(sql)).rows;
    }
    const isQuery = sql.trim().toUpperCase().startsWith("SELECT");
    if (isQuery) {
      if (args) return db.prepare(sql).all(...args);
      return db.prepare(sql).all();
    }
    if (args) db.prepare(sql).run(...args);
    else db.prepare(sql).run();
    return [];
  }

  // Clear seedable tables
  for (const t of ["poll_votes", "poll_options", "polls", "admin_warnings", "private_messages", "listing_messages", "forum_replies", "forum_topics", "entraide_listings", "alerts", "events", "documents"]) {
    try { await exec(`DELETE FROM ${t}`); } catch {}
  }

  // Users
  const existing = await exec("SELECT COUNT(*) as c FROM users");
  const count = useTurso ? existing[0].c : (existing[0] as any).c;
  if (count === 0) {
    const users: any[] = [
      ["Marie","L.",7,"marie@email.fr","https://i.pravatar.cc/150?u=lepharo-marie",0],
      ["Jean-Pierre","D.",12,"jp@email.fr","https://i.pravatar.cc/150?u=lepharo-jp",1],
      ["Sophie","K.",4,"sophie@email.fr","https://i.pravatar.cc/150?u=lepharo-sophie",0],
      ["Lucas","M.",3,"lucas@email.fr","https://i.pravatar.cc/150?u=lepharo-lucas",0],
      ["Marguerite","B.",9,"marguerite@email.fr","https://i.pravatar.cc/150?u=lepharo-marguerite",1],
      ["Karim","A.",6,"karim@email.fr","https://i.pravatar.cc/150?u=lepharo-karim",0],
      ["Paul","R.",15,"paul@email.fr","https://i.pravatar.cc/150?u=lepharo-paul",1],
      ["Camille","T.",11,"camille@email.fr","https://i.pravatar.cc/150?u=lepharo-camille",0],
      ["Henri","D.",14,"henri@email.fr","https://i.pravatar.cc/150?u=lepharo-henri",0],
      ["Emma","J.",5,"emma@email.fr","https://i.pravatar.cc/150?u=lepharo-emma",0],
    ];
    for (const u of users) {
      await exec("INSERT INTO users (first_name, last_name, floor, email, password_hash, avatar_url, senior, role, verified) VALUES (?,?,?,?,?,?,?,'resident',1)", [u[0], u[1], u[2], u[3], "seed-placeholder", u[4], u[5]]);
    }
    await exec("UPDATE users SET role='admin' WHERE id=1");
    console.log("  ✓ 10 users seeded with avatars");
  } else {
    console.log(`  - ${count} users exist, updating avatars`);
  }
  const avatars: Record<number, string> = { 1:"https://i.pravatar.cc/150?u=lepharo-marie", 2:"https://i.pravatar.cc/150?u=lepharo-jp", 3:"https://i.pravatar.cc/150?u=lepharo-sophie", 4:"https://i.pravatar.cc/150?u=lepharo-lucas", 5:"https://i.pravatar.cc/150?u=lepharo-marguerite", 6:"https://i.pravatar.cc/150?u=lepharo-karim", 7:"https://i.pravatar.cc/150?u=lepharo-paul", 8:"https://i.pravatar.cc/150?u=lepharo-camille", 9:"https://i.pravatar.cc/150?u=lepharo-henri", 10:"https://i.pravatar.cc/150?u=lepharo-emma" };
  for (const [id, url] of Object.entries(avatars)) {
    await exec("UPDATE users SET avatar_url=? WHERE id=? AND (avatar_url IS NULL OR avatar_url='')", [url, parseInt(id)]);
  }
  console.log("  ✓ User avatar URLs updated");

  const listings: any[] = [
    ["propose","Cours d anglais pour enfants","Je donne des cours d anglais aux enfants du residence.","garde",3,"[]"],
    ["cherche","Qui peut m accompagner chez le medecin ?","J ai besoin d etre accompagnee.","compagnie",5,"[]"],
    ["propose","Je fais vos courses le samedi matin","Je propose de faire vos courses et de les deposer.","courses",4,"[]"],
    ["propose","Perceuse, visseuse, scie sauteuse","Je prete mes outils : perceuse Bosch, visseuse DeWalt.","pret",6,'["https://picsum.photos/seed/outil1/400/300","https://picsum.photos/seed/outil2/400/300"]'],
    ["cherche","Aide pour monter un meuble IKEA","Besoin d aide pour monter un lit. Repas offert !","bricolage",8,"[]"],
    ["propose","Baby-sitting samedi soir","Etudiante en psychologie, experience avec les tout-petits.","garde",10,"[]"],
    ["vente","Table basse en verre 80cm","Plateau verre trempe, pieds chromes. Etat impeccable. 40€.","vente",1,'["https://picsum.photos/seed/table1/400/300","https://picsum.photos/seed/table2/400/300"]'],
    ["vente","Velo de ville Peugeot","24 vitesses, freins a disque. Tres peu utilise. 120€.","vente",4,'["https://picsum.photos/seed/velo1/400/300","https://picsum.photos/seed/velo2/400/300"]'],
    ["vente","Canape convertible 3 places","Gris clair, mecanisme facile. A voir sur place. 200€.","vente",3,'["https://picsum.photos/seed/canape1/400/300","https://picsum.photos/seed/canape2/400/300"]'],
    ["vente","iPhone 13 128Go bleu","Sous garantie jusqu en 2026. Coque+vitre depuis le debut. 450€.","vente",10,'["https://picsum.photos/seed/iphone1/400/300","https://picsum.photos/seed/iphone2/400/300"]'],
    ["vente","Plantes vertes d appartement","Monstera, 2 pothos, sanseviere. 15€/piece ou 50€ les 4.","vente",1,'["https://picsum.photos/seed/plante1/400/300","https://picsum.photos/seed/plante2/400/300"]'],
    ["vente","Machine a cafe Nespresso Vertuo","Peu utilisee, 20 dosettes incluses. 80€.","vente",7,'["https://picsum.photos/seed/cafe1/400/300"]'],
    ["vente","Enceinte Bluetooth JBL Charge 5","Son puissant, autonomie 20h. Etat neuf. 60€.","vente",9,'["https://picsum.photos/seed/jbl1/400/300"]'],
    ["propose","Cours de yoga en groupe","Yoga doux dans la salle commune, mardis et jeudis 18h.","divers",8,'["https://picsum.photos/seed/yoga1/400/300"]'],
  ];
  for (const l of listings) {
    await exec("INSERT INTO entraide_listings (type, title, description, category, author_id, images, status) VALUES (?,?,?,?,?,?,'open')", [l[0], l[1], l[2], l[3], l[4], l[5]]);
  }
  console.log(`  ✓ ${listings.length} listings seeded with photos`);

  for (const [name, slug, desc] of [["Vie quotidienne","vie-quotidienne","Bruit, propreté, animaux…"],["Travaux","travaux","Ravalement, ascenseurs…"],["Nuisibles","nuisibles","Punaises de lit, rongeurs…"],["Syndic","syndic","AG, PV, comptes…"],["Quartier","quartier","Actualités, commerces…"],["Bistrot","bistrot","Pour parler de tout et de rien…"]]) {
    await exec("INSERT OR IGNORE INTO forum_rubriques (name, slug, description) VALUES (?,?,?)", [name, slug, desc]);
  }

  for (const t of [["Preparation AG juin 2026","Resolution 5 : 48 000€ pour la facade. Qu'en pensez-vous ?","syndic",7],["Bruit repete appartement 12e","Bruits de perceuse apres 20h. Que dit le reglement ?","vie-quotidienne",2],["Partage de photos - vue depuis le 16e","Coucher de soleil magnifique ce soir.","bistrot",8],["Etat des canalisations","Fuite chez moi, colonnes d'eau calcifiees.","travaux",1],["Nouveau restaurant pres du Pharo","Bistrot au 58 boulevard Charles Livon.","quartier",4]]) {
    await exec("INSERT INTO forum_topics (title, content, rubrique, author_id) VALUES (?,?,?,?)", [t[0], t[1], t[2], t[3]]);
  }
  console.log("  ✓ 5 forum topics seeded");

  for (const r of [[1,"D'accord, le diagnostic n'est pas encore fait.",1],[1,"48 000€ c'est beaucoup. Comparons trois devis.",2],[1,"Budget revu a cause d'infiltrations.",3],[2,"Pas de travaux apres 19h30. Signalez au gardien.",1],[3,"Magnifique ! J'habite au 9e cote ville.",5]]) {
    await exec("INSERT INTO forum_replies (topic_id, content, author_id) VALUES (?,?,?)", [r[0], r[1], r[2]]);
  }
  console.log("  ✓ 5 forum replies seeded");

  for (const e of [["Intervention ascenseur","Maintenance 9h-17h","2026-06-03","travaux",1],["Assemblee generale","Salle commune, ordre du jour disponible","2026-06-15","ag",1],["Apero des voisins","Terrasse collective, apportez de quoi grignoter","2026-06-20","convivial",1],["Atelier cuisine","Limite a 12 personnes, inscrivez-vous","2026-07-12","convivial",1]]) {
    await exec("INSERT INTO events (title, description, date, type, author_id) VALUES (?,?,?,?,?)", [e[0], e[1], e[2], e[3], e[4]]);
  }
  console.log("  ✓ 4 events seeded");

  await exec("INSERT INTO alerts (message, type, created_by) VALUES ('Prochaine AG le 15 juin 2026','info',1)");
  await exec("INSERT INTO alerts (message, type, created_by) VALUES ('Intervention ascenseur le 3 juin (9h-17h)','warning',1)");
  console.log("  ✓ 2 alerts seeded");

  for (const d of [["PV AG 2026","assemblees-generales",12,"15 mars 2026",1],["PV AG 2025","assemblees-generales",14,"12 mars 2025",1],["Budget previsionnel 2026","budgets",24,"15 mars 2026",1],["Reglement de copropriete","reglement",45,"15 sept 2023",1],["Contrat ascenseur Otis","contrats",18,"1er juin 2025",1],["DPE Residence du Pharo","diagnostics",8,"2024",1],["Comptes annuels 2025","budgets",32,"20 nov 2025",1],["Diagnostic amiante","diagnostics",34,"2023",1]]) {
    await exec("INSERT INTO documents (title, category, pages, date, uploaded_by) VALUES (?,?,?,?,?)", [d[0], d[1], d[2], d[3], d[4]]);
  }
  console.log("  ✓ 8 documents seeded");

  console.log("\nSeed complete!");
}

run().catch(console.error);
