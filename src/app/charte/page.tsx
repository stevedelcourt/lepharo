import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charte - Le Pharo Communauté",
};

export default function CharterPage() {
  return (
    <div className="container" style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ marginBottom: 12 }}>Charte de la communauté</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem", marginBottom: 40 }}>
        Les règles qui permettent à notre communauté de fonctionner dans le
        respect de tous.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Principes généraux</h2>
      <p>
        Le Pharo Communauté est un espace privé réservé aux résidents et
        propriétaires du 75 boulevard Charles Livon. En créant un compte,
        vous vous engagez à respecter les règles suivantes.
      </p>
      <p>
        La charte s&apos;applique à tous les espaces du site : forum, annonces
        d&apos;entraide, messagerie interne, commentaires.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Règles de conduite</h2>
      <p>
        <span>Respect.</span> Traitez les autres résidents comme vous
        souhaiteriez être traité. Pas d&apos;insultes, pas de harcèlement,
        pas de discrimination.
      </p>
      <p>
        <span>Bienveillance.</span> Nous sommes tous voisins. Un message
        agressif nuit à la communauté bien plus qu&apos;à son destinataire.
      </p>
      <p>
        <span>Pertinence.</span> Publiez dans la rubrique appropriée.
        Évitez le hors-sujet dans les fils de discussion existants.
      </p>
      <p>
        <span>Factualité.</span> Sur les sujets de copropriété, restez
        factuel. Documentez, citez, sourcez. Les attaques personnelles sont
        interdites.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Contenus interdits</h2>
      <p>
        Messages diffamatoires, injurieux ou discriminatoires. Publicité
        commerciale extérieure à la résidence. Contenus illicites (haine,
        apologie de la violence, etc.). Spam et messages en masse.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Services entre voisins</h2>
      <p>
        Les services proposés sur la plateforme le sont à titre gracieux et
        ponctuel. Toute rémunération régulière engage la responsabilité des
        parties et doit faire l&apos;objet d&apos;une déclaration (CESU,
        auto-entrepreneur, etc.).
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Modération</h2>
      <p>
        Un groupe de modérateurs bénévoles veille au respect de la charte.
        En cas de manquement :
      </p>
      <p>
        <span>1<sup>er</sup> manquement :</span> avertissement privé.<br />
        <span>2<sup>e</sup> manquement :</span> suspension temporaire (7 jours).<br />
        <span>3<sup>e</sup> manquement :</span> exclusion définitive.
      </p>
      <p>
        La modération est a posteriori : les messages ne sont pas vérifiés
        avant publication. Si vous voyez un message problématique, signalez-le.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Signalement</h2>
      <p>
        Chaque message peut être signalé. L&apos;équipe de modération s&apos;engage
        à traiter tout signalement sous 48 heures.
      </p>
    </div>
  );
}
