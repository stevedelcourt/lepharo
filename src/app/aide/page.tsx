import AideClient from "./aide-client";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "Comment s'inscrire sur le site ?",
    a: "Rendez-vous sur la page Inscription. Remplissez le formulaire avec votre prénom, nom, email, numéro d'étage et créez un mot de passe. Votre compte sera activé après vérification par un administrateur.\n\nSi vous n'avez pas d'adresse email ou pas d'ordinateur, vous pouvez renseigner votre numéro de téléphone portable à l'accueil de la résidence pour que l'on crée votre compte manuellement.",
    category: "compte",
  },
  {
    q: "Comment publier une annonce sur l'entraide ?",
    a: "Rendez-vous sur la page Entraide, cliquez sur « Publier une annonce ». Choisissez si vous proposez ou cherchez quelque chose, sélectionnez une catégorie, donnez un titre et une description. Vous pouvez ajouter jusqu'à 5 photos. Votre annonce sera visible par tous les résidents connectés.",
    category: "entraide",
  },
  {
    q: "Comment modifier ou supprimer une annonce ?",
    a: "Allez dans « Mes annonces » dans le menu Compte. Vous y verrez toutes vos annonces publiées. Cliquez sur une annonce pour voir les messages reçus. Pour la supprimer, contactez un administrateur.",
    category: "entraide",
  },
  {
    q: "Comment envoyer un message privé à un voisin ?",
    a: "Depuis l'Annuaire, cliquez sur le bouton « Message » à côté du résident que vous souhaitez contacter. Vous serez redirigé vers la Messagerie. Vous pouvez aussi aller directement dans Messagerie et sélectionner une conversation existante.",
    category: "messagerie",
  },
  {
    q: "Comment répondre à un message reçu ?",
    a: "Dans la Messagerie, toutes vos conversations sont listées à gauche. Cliquez sur une conversation pour voir les messages. Écrivez votre réponse dans le champ en bas et appuyez sur Envoyer.",
    category: "messagerie",
  },
  {
    q: "Comment créer un sujet dans le forum ?",
    a: "Sur la page Forum, cliquez sur « Nouveau sujet ». Choisissez une rubrique (Vie quotidienne, Travaux, etc.), donnez un titre et écrivez votre message. Votre sujet sera visible par tous les résidents.",
    category: "forum",
  },
  {
    q: "Comment répondre à un sujet du forum ?",
    a: "Ouvrez le sujet qui vous intéresse. En bas de la page, un formulaire vous permet d'écrire votre réponse. Si le sujet est verrouillé (badge rouge), il n'est plus possible d'y répondre.",
    category: "forum",
  },
  {
    q: "Comment savoir si j'ai de nouveaux messages ?",
    a: "Une cloche rouge dans le menu latéral (en bas, à côté de votre prénom) affiche le nombre de messages non lus. Cliquez dessus pour voir les notifications. La cloche se met à jour automatiquement toutes les 30 secondes.",
    category: "messagerie",
  },
  {
    q: "Comment modifier mon profil ?",
    a: "Allez dans « Mon profil » dans le menu Compte. Vous pouvez modifier votre prénom, nom, étage, téléphone, bio et photo de profil. Vous pouvez aussi activer le badge « Senior » pour signaler sur l'annuaire que vous êtes senior.",
    category: "compte",
  },
  {
    q: "Comment changer ma photo de profil ?",
    a: "Dans « Mon profil », cliquez sur « Changer la photo ». Sélectionnez une image JPG, PNG ou WebP (max 5 Mo). La photo apparaîtra dans l'annuaire et dans la messagerie.",
    category: "compte",
  },
  {
    q: "Comment voir le calendrier des événements ?",
    a: "La page Calendrier affiche les événements à venir : AG, travaux, apéros, etc. Utilisez le sélecteur de mois pour naviguer. Chaque événement est signalé par un tag de couleur (Travaux, Convivial, AG).",
    category: "calendrier",
  },
  {
    q: "Comment accéder aux documents de la résidence ?",
    a: "La page Documents regroupe les PV d'AG, budgets, contrats, diagnostics et le règlement de copropriété. Les documents sont classés par catégorie. Cliquez sur « Télécharger » pour les ouvrir.",
    category: "documents",
  },
  {
    q: "Comment contacter un administrateur ?",
    a: "Vous pouvez envoyer un message privé à un administrateur depuis l'Annuaire, ou utiliser la page Contact pour envoyer un message à l'équipe du site.",
    category: "compte",
  },
  {
    q: "Comment sont protégées mes données ?",
    a: "Le site utilise un mot de passe ou votre compte Google pour vous connecter. Les données sont stockées de manière sécurisée. Consultez la page Confidentialité pour plus d'informations.",
    category: "compte",
  },
  {
    q: "Puis-je utiliser le site sur mon téléphone ?",
    a: "Oui, le site fonctionne sur mobile. La barre latérale est masquée sur les petits écrans pour laisser plus de place au contenu. Une version mobile améliorée est en préparation.",
    category: "compte",
  },
];

export default async function AidePage() {
  return <AideClient faqs={faqs} />;
}
