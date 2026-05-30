import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales - La communauté de La Tour du Pharo",
};

export default function LegalPage() {
  return (
    <div className="container page-padding" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Mentions légales</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem", marginBottom: 40 }}>
        Informations légales relatives au site de La communauté de La Tour du Pharo.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Éditeur</h2>
      <p>
        Le site de La communauté de La Tour du Pharo est édité par un collectif de résidents
        de la Résidence du Pharo, 75 boulevard Charles Livon, 13007 Marseille.
      </p>
      <p>
        Directeur de la publication : l&apos;administrateur principal du site.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Hébergeur</h2>
      <p>
        Vercel Inc.<br />
        340 S Lemon Ave #4133<br />
        Walnut, CA 91789<br />
        États-Unis
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus publiés sur ce site (textes, images,
        documents) est la propriété de leurs auteurs respectifs. Toute
        reproduction ou utilisation sans autorisation est interdite.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Responsabilité</h2>
      <p>
        Le site de La communauté de La Tour du Pharo est un espace d&apos;échange entre
        résidents. Les contenus publiés par les utilisateurs n&apos;engagent
        que leurs auteurs. L&apos;équipe d&apos;administration met en œuvre
        les moyens raisonnables pour assurer le bon fonctionnement du site
        et la modération des contenus, sans garantie absolue.
      </p>
    </div>
  );
}
