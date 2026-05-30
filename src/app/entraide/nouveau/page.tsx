import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import NouveauListingForm from "./form";

export const dynamic = "force-dynamic";

export default async function NouveauListingPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  return (
    <div className="container page-padding" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Publier une annonce</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32, fontSize: "1.0625rem" }}>
        Proposez votre aide ou demandez ce dont vous avez besoin.
      </p>
      <NouveauListingForm />
    </div>
  );
}
