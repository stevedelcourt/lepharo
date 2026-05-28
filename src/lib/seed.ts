import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { hashSync } from "bcryptjs";
import path from "path";

const {
  users, forumTopics, forumReplies, entraideListings, documents, events, alerts,
} = schema;

const sqlite = new Database(path.join(process.cwd(), "data", "lepharo.db"));
const db = drizzle(sqlite, { schema });

// Clean tables
db.delete(alerts).run();
db.delete(events).run();
db.delete(documents).run();
db.delete(entraideListings).run();
db.delete(forumReplies).run();
db.delete(forumTopics).run();
db.delete(users).run();

// Admin user (password: admin123)
db.insert(users).values({
  firstName: "Admin",
  lastName: "Le Pharo",
  email: "admin@lepharo.community",
  floor: 1,
  passwordHash: hashSync("admin123", 10),
  role: "admin",
  verified: true,
}).run();

// Demo residents
const residentData = [
  { firstName: "Marie", lastName: "L.", email: "marie@email.fr", floor: 7 },
  { firstName: "Jean-Pierre", lastName: "D.", email: "jp@email.fr", floor: 12 },
  { firstName: "Sophie", lastName: "K.", email: "sophie@email.fr", floor: 4 },
  { firstName: "Lucas", lastName: "M.", email: "lucas@email.fr", floor: 3 },
  { firstName: "Marguerite", lastName: "B.", email: "marguerite@email.fr", floor: 9 },
  { firstName: "Karim", lastName: "A.", email: "karim@email.fr", floor: 6 },
  { firstName: "Paul", lastName: "R.", email: "paul@email.fr", floor: 15 },
  { firstName: "Camille", lastName: "T.", email: "camille@email.fr", floor: 11 },
  { firstName: "Henri", lastName: "D.", email: "henri@email.fr", floor: 14 },
  { firstName: "Emma", lastName: "J.", email: "emma@email.fr", floor: 5 },
];

for (const r of residentData) {
  db.insert(users).values({
    ...r,
    passwordHash: hashSync("password", 10),
    role: "resident",
    verified: true,
  }).run();
}

// Forum topics
const topics = [
  { title: "Préparation AG juin 2026 - analyse résolution 5", content: "La résolution 5 concerne le budget prévisionnel. Je pense qu'il faut demander plus de détails sur le poste 'entretien ascenseur'. Quelqu'un a des infos ?", rubrique: "syndic", authorId: 7 },
  { title: "Bruit répété appartement 12e - que faire ?", content: "Depuis quelques semaines, des bruits de pas et de chaises sont entendus tard le soir. J'ai déjà laissé un mot mais rien n'a changé. Des conseils ?", rubrique: "vie-quotidienne", authorId: 3 },
  { title: "Partage de photos - vue depuis le 16e au coucher du soleil", content: "Hier soir, le coucher de soleil était magnifique. Je partage quelques photos prises depuis ma fenêtre.", rubrique: "bistrot", authorId: 8 },
  { title: "État des canalisations", content: "J'ai remarqué des odeurs dans la salle de bain. D'autres personnes ont le même problème ?", rubrique: "travaux", authorId: 2 },
  { title: "Nouveau restaurant près du Palais du Pharo", content: "Un nouveau restaurant a ouvert quai de la Tourette. Testé ce week-end, je recommande !", rubrique: "quartier", authorId: 4 },
];

for (const t of topics) {
  db.insert(forumTopics).values(t).run();
}

// Replies
db.insert(forumReplies).values({ topicId: 1, authorId: 2, content: "Bonne idée. Je note qu'il faut demander les devis avant l'AG.", createdAt: "2025-05-25 14:30:00" }).run();
db.insert(forumReplies).values({ topicId: 1, authorId: 7, content: "Exact. J'ai téléchargé les documents dans l'espace documents.", createdAt: "2025-05-25 16:00:00" }).run();
db.insert(forumReplies).values({ topicId: 2, authorId: 6, content: "Tu peux contacter le conseil syndical pour médiation.", createdAt: "2025-05-26 09:15:00" }).run();

// Entraide
db.insert(entraideListings).values({
  type: "propose", title: "Cours d'anglais pour enfants", description: "Prof d'anglais, je propose des cours ludiques pour enfants le mercredi après-midi.", category: "garde", authorId: 3,
}).run();
db.insert(entraideListings).values({
  type: "cherche", title: "Qui peut m'accompagner chez le médecin ?", description: "J'ai un rendez-vous le 5 juin à 15h. Si quelqu'un peut m'accompagner, merci !", category: "compagnie", authorId: 5,
}).run();
db.insert(entraideListings).values({
  type: "propose", title: "Je fais vos courses le samedi matin", description: "Je vais au marché du Prado tous les samedis. Je peux prendre vos courses.", category: "courses", authorId: 4,
}).run();
db.insert(entraideListings).values({
  type: "propose", title: "Perceuse, visseuse, scie sauteuse", description: "Je prête mes outils de bricolage le week-end. Contacter Karim au 6e.", category: "pret", authorId: 6,
}).run();
db.insert(entraideListings).values({
  type: "cherche", title: "Aide pour monter un meuble IKEA", description: "Besoin d'un coup de main pour monter une bibliothèque ce samedi.", category: "bricolage", authorId: 8,
}).run();
db.insert(entraideListings).values({
  type: "propose", title: "Baby-sitting samedi soir", description: "Disponible pour garder des enfants samedi soir. Appelez au 06 XX XX XX XX.", category: "garde", authorId: 10,
}).run();

// Documents
db.insert(documents).values({ title: "PV AG 2026 - Ordinaire", category: "assemblees-generales", pages: 12, date: "15 mars 2026", uploadedBy: 1 }).run();
db.insert(documents).values({ title: "PV AG 2025 - Ordinaire", category: "assemblees-generales", pages: 14, date: "12 mars 2025", uploadedBy: 1 }).run();
db.insert(documents).values({ title: "Budget prévisionnel 2026", category: "budgets", pages: 24, date: "15 mars 2026", uploadedBy: 1 }).run();
db.insert(documents).values({ title: "Règlement de copropriété", category: "reglement", pages: 45, date: "15 septembre 2023", uploadedBy: 1 }).run();
db.insert(documents).values({ title: "Contrat ascenseur - Otis", category: "contrats", pages: 18, date: "1er juin 2025", uploadedBy: 1 }).run();
db.insert(documents).values({ title: "DPE - Résidence du Pharo", category: "diagnostics", pages: 8, date: "2024", uploadedBy: 1 }).run();

// Events
db.insert(events).values({ title: "Intervention ascenseur", description: "Maintenance annuelle - coupure de 9h à 17h", date: "3 juin 2026", type: "travaux", authorId: 1 }).run();
db.insert(events).values({ title: "Assemblée générale ordinaire", description: "Salle commune - ordre du jour disponible", date: "15 juin 2026", type: "ag", authorId: 1 }).run();
db.insert(events).values({ title: "Apéro des voisins", description: "Terrasse collective - apportez de quoi grignoter", date: "31 mai 2026", type: "convivial", authorId: 1 }).run();
db.insert(events).values({ title: "Atelier cuisine collective", description: "Inscriptions en ligne - limité à 12 personnes", date: "12 juillet 2026", type: "convivial", authorId: 1 }).run();

// Alerts
db.insert(alerts).values({ message: "Prochaine AG le 15 juin 2026 - Ordre du jour disponible", type: "info", active: true, createdBy: 1 }).run();
db.insert(alerts).values({ message: "Intervention ascenseur prévue le 3 juin (9h-17h)", type: "warning", active: true, createdBy: 1 }).run();

console.log("✓ Database seeded successfully");
console.log("  Admin: admin@lepharo.community / admin123");
console.log("  Residents: marie@email.fr / password (and others)");
