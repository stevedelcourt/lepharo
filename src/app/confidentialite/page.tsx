import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité - La communauté de La Tour du Pharo",
};

export default function PrivacyPage() {
  return (
    <div className="container page-padding" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Confidentialité</h1>

      <p style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}>
        Nous collectons uniquement les données nécessaires au fonctionnement du site :
      </p>
      <p style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}>
        Nom et prénom · Adresse email · Étage et bâtiment (facultatif) · Numéro de téléphone (facultatif) pour la vérification de l&apos;inscription
      </p>
      <p style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}>
        Les données sont supprimées après vérification de votre compte.
      </p>
      <p style={{ fontSize: "1.0625rem", lineHeight: 1.7, marginTop: 32 }}>
        Ce site est une initiative bénévole entre habitants. Il ne collecte aucune donnée personnelle, ne dépose aucun cookie de suivi, et n&apos;utilise aucun outil d&apos;analyse ou de publicité.
      </p>
      <p style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}>
        La réglementation européenne (RGPD) nous oblige à vous informer de cette politique, même lorsqu&apos;elle se résume à ceci : rien n&apos;est collecté, rien n&apos;est transmis, rien n&apos;est conservé.
      </p>
      <p style={{ fontSize: "1.0625rem", lineHeight: 1.7, fontWeight: 700, marginTop: 32 }}>
        Vous êtes chez vous.
      </p>
    </div>
  );
}
