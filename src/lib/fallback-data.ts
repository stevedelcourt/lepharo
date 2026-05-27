export const fallbackAlerts = [
  { id: 1, message: "Prochaine AG le 15 juin 2026 - Ordre du jour disponible", type: "info", active: true, createdBy: 1, createdAt: "2026-05-27" },
  { id: 2, message: "Intervention ascenseur prevue le 3 juin (9h-17h)", type: "warning", active: true, createdBy: 1, createdAt: "2026-05-26" },
];

export const fallbackForumTopics: { id: number; title: string; rubrique: string; authorName: string; authorFloor: number | null; replyCount: number; createdAt: string }[] = [
  { id: 1, title: "Preparation AG juin 2026 - analyse resolution 5", rubrique: "syndic", authorName: "Paul", authorFloor: 15, replyCount: 3, createdAt: "2026-05-27" },
  { id: 2, title: "Bruit repete appartement 12e - que faire ?", rubrique: "vie-quotidienne", authorName: "Jean-Pierre", authorFloor: 12, replyCount: 1, createdAt: "2026-05-26" },
  { id: 3, title: "Partage de photos - vue depuis le 16e au coucher du soleil", rubrique: "bistrot", authorName: "Camille", authorFloor: 11, replyCount: 2, createdAt: "2026-05-25" },
  { id: 4, title: "Etat des canalisations - retour d experience", rubrique: "travaux", authorName: "Marie", authorFloor: 7, replyCount: 0, createdAt: "2026-05-24" },
  { id: 5, title: "Nouveau restaurant pres du Palais du Pharo", rubrique: "quartier", authorName: "Lucas", authorFloor: 3, replyCount: 0, createdAt: "2026-05-23" },
];

export const fallbackListings = [
  { id: 1, type: "propose", title: "Cours d anglais pour enfants", category: "garde", authorName: "Sophie", authorFloor: 4, createdAt: "2026-05-27" },
  { id: 2, type: "cherche", title: "Qui peut m accompagner chez le medecin ?", category: "compagnie", authorName: "Marguerite", authorFloor: 9, createdAt: "2026-05-26" },
  { id: 3, type: "propose", title: "Je fais vos courses le samedi matin", category: "courses", authorName: "Lucas", authorFloor: 3, createdAt: "2026-05-25" },
  { id: 4, type: "propose", title: "Perceuse, visseuse, scie sauteuse", category: "pret", authorName: "Karim", authorFloor: 6, createdAt: "2026-05-24" },
  { id: 5, type: "cherche", title: "Aide pour monter un meuble IKEA", category: "bricolage", authorName: "Camille", authorFloor: 11, createdAt: "2026-05-23" },
  { id: 6, type: "propose", title: "Baby-sitting samedi soir", category: "garde", authorName: "Emma", authorFloor: 5, createdAt: "2026-05-22" },
];

export const fallbackDocuments = [
  { id: 1, title: "PV AG 2026 - Ordinaire", category: "assemblees-generales", pages: 12, date: "15 mars 2026", uploadedBy: 1 },
  { id: 2, title: "PV AG 2025 - Ordinaire", category: "assemblees-generales", pages: 14, date: "12 mars 2025", uploadedBy: 1 },
  { id: 3, title: "Budget previsionnel 2026", category: "budgets", pages: 24, date: "15 mars 2026", uploadedBy: 1 },
  { id: 4, title: "Reglement de copropriete", category: "reglement", pages: 45, date: "15 septembre 2023", uploadedBy: 1 },
  { id: 5, title: "Contrat ascenseur - Otis", category: "contrats", pages: 18, date: "1er juin 2025", uploadedBy: 1 },
  { id: 6, title: "DPE - Residence du Pharo", category: "diagnostics", pages: 8, date: "2024", uploadedBy: 1 },
  { id: 7, title: "Comptes annuels 2025", category: "budgets", pages: 32, date: "20 novembre 2025", uploadedBy: 1 },
  { id: 8, title: "Diagnostic amiante", category: "diagnostics", pages: 34, date: "2023", uploadedBy: 1 },
];

export const fallbackEvents = [
  { id: 1, title: "Intervention ascenseur", description: "Maintenance annuelle - coupure de 9h a 17h", date: "3 juin 2026", type: "travaux", authorId: 1, createdAt: "2026-05-27" },
  { id: 2, title: "Assemblee generale ordinaire", description: "Salle commune - ordre du jour disponible", date: "15 juin 2026", type: "ag", authorId: 1, createdAt: "2026-05-27" },
  { id: 3, title: "Apero des voisins", description: "Terrasse collective - apportez de quoi grignoter", date: "31 mai 2026", type: "convivial", authorId: 1, createdAt: "2026-05-27" },
  { id: 4, title: "Atelier cuisine collective", description: "Inscriptions en ligne - limite a 12 personnes", date: "12 juillet 2026", type: "convivial", authorId: 1, createdAt: "2026-05-27" },
];

export const fallbackUsers = [
  { id: 1, firstName: "Marie", lastName: "L.", floor: 7, email: "marie@email.fr" },
  { id: 2, firstName: "Jean-Pierre", lastName: "D.", floor: 12, email: "jp@email.fr" },
  { id: 3, firstName: "Sophie", lastName: "K.", floor: 4, email: "sophie@email.fr" },
  { id: 4, firstName: "Lucas", lastName: "M.", floor: 3, email: "lucas@email.fr" },
  { id: 5, firstName: "Marguerite", lastName: "B.", floor: 9, email: "marguerite@email.fr" },
  { id: 6, firstName: "Karim", lastName: "A.", floor: 6, email: "karim@email.fr" },
  { id: 7, firstName: "Paul", lastName: "R.", floor: 15, email: "paul@email.fr" },
  { id: 8, firstName: "Camille", lastName: "T.", floor: 11, email: "camille@email.fr" },
  { id: 9, firstName: "Henri", lastName: "D.", floor: 14, email: "henri@email.fr" },
  { id: 10, firstName: "Emma", lastName: "J.", floor: 5, email: "emma@email.fr" },
];
