import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité - Le Pharo Communauté",
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ marginBottom: 12 }}>Politique de confidentialité</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem", marginBottom: 40 }}>
        Conformément au Règlement Général sur la Protection des Données (RGPD).
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Responsable de traitement</h2>
      <p>
        Le site Le Pharo Communauté est édité par un groupe de résidents
        bénévoles de la Résidence du Pharo. Aucune association n&apos;est
        constituée à ce stade. Le responsable de traitement est
        l&apos;administrateur principal du site, joignable depuis la page{" "}
        <a href="/contact">Contact</a>.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Données collectées</h2>
      <p>
        Nous collectons uniquement les données nécessaires au fonctionnement
        du site :
      </p>
      <p>
        Nom et prénom · Adresse email · Étage et bâtiment (facultatif) ·
        Numéro de téléphone (facultatif) · Justificatif d&apos;occupation
        (taxe foncière, bail, quittance de charges) pour la vérification
        de l&apos;inscription
      </p>
      <p>
        Les justificatifs sont supprimés après vérification de votre compte.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Finalités</h2>
      <p>
        Les données sont utilisées pour : vous identifier sur le site,
        vous permettre de communiquer avec d&apos;autres résidents, vous
        envoyer des notifications (selon vos préférences), et assurer la
        sécurité de la communauté.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Base légale</h2>
      <p>
        Le traitement repose sur votre consentement, donné lors de
        l&apos;inscription. Vous pouvez retirer ce consentement à tout
        moment en demandant la suppression de votre compte.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Durée de conservation</h2>
      <p>
        Vos données sont conservées jusqu&apos;à la suppression de votre
        compte ou votre départ de la résidence. Les justificatifs
        d&apos;occupation sont supprimés dans les 30 jours suivant la
        vérification de votre compte.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Vos droits</h2>
      <p>
        Vous pouvez à tout moment : accéder à vos données, les rectifier,
        demander leur effacement, demander la portabilité de vos données,
        et définir des directives post-mortem.
      </p>
      <p>
        Pour exercer vos droits, contactez-nous depuis la page{" "}
        <a href="/contact">Contact</a>.
      </p>

      <h2 style={{ marginBottom: 8, marginTop: 32 }}>Sécurité</h2>
      <p>
        Les données sont stockées sur des serveurs sécurisés. Les mots de
        passe sont hachés. Les communications sont chiffrées (HTTPS).
        Aucune donnée n&apos;est partagée avec des tiers.
      </p>
    </div>
  );
}
