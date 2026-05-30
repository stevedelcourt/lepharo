export default function AboutPage() {
  return (
    <div className="container page-padding" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>À propos</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem", marginBottom: 40 }}>
        La communauté de La Tour du Pharo est née d&apos;une idée simple : mieux vivre ensemble
        dans notre immeuble.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Notre histoire</h2>
      <p>
        La Résidence du Pharo, classée Patrimoine du XX<sup>e</sup> siècle, domine
        l&apos;entrée du Vieux-Port de Marseille depuis 1955. Conçue par les
        architectes Bentz &amp; Devin, ses 105 logements répartis sur 19 étages
        abritent une population hétérogène : une majorité de résidents âgés,
        des familles, quelques jeunes actifs ou étudiants.
      </p>
      <p>
        Cette diversité est une richesse, mais elle rend aussi la communication
        difficile. Pas d&apos;espace numérique commun, pas de lieu pour organiser
        l&apos;entraide, pas de mémoire collective facilement accessible.
      </p>
      <p>
        La communauté de La Tour du Pharo a été créée par un groupe de résidents pour répondre
        à ces besoins : un espace privé, sécurisé, où chacun peut proposer son
        aide, poser une question, partager un document ou organiser un événement.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Nos valeurs</h2>
      <p>
        <span>Confiance.</span> L&apos;accès est réservé aux résidents et
        propriétaires de l&apos;immeuble. Chaque inscription est vérifiée.
      </p>
      <p>
        <span>Entraide.</span> Nous croyons au potentiel intergénérationnel
        de notre immeuble. Un service rendu entre voisins crée du lien et
        améliore la vie de tous.
      </p>
      <p>
        <span>Transparence.</span> L&apos;information circule : documents
        de copropriété, préparation des AG, suivi des travaux. Un résident
        informé est un résident qui participe.
      </p>
      <p>
        <span>Respect.</span> Les échanges sont courtois, bienveillants,
        factuels. Pas de place pour la diffamation ou l&apos;invective.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Indépendance</h2>
      <p>
        La communauté de La Tour du Pharo est une initiative strictement privée et indépendante.
        Elle n&apos;est aucunement affiliée au syndic de copropriété, aux cabinets
        de gestion, aux entreprises intervenant dans l&apos;immeuble, ni à aucune
        autre personne morale ou physique extérieure à la résidence.
      </p>
      <p>
        Le site est administré par des résidents bénévoles. Aucune structure
        associative formelle pour le moment - juste des voisins qui ont
        décidé de prendre les choses en main.
      </p>
      <p>
        Vous voulez nous aider ? Rejoignez l&apos;équipe des modérateurs ou
        des administrateurs. Écrivez-nous depuis la page{" "}
        <a href="/contact">Contact</a>.
      </p>
    </div>
  );
}
