import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || token.length < 20) {
    return new Response(`
      <!DOCTYPE html>
      <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
        <div style="background:#fff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.06);max-width:420px">
          <p style="color:#EF4444;font-size:18px;font-weight:600">Lien de vérification invalide.</p>
          <p style="color:#666;font-size:14px">Le lien que vous avez utilisé est incorrect ou a expiré. Essayez de vous connecter pour recevoir un nouveau lien.</p>
          <a href="/connexion" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#FF6B00;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Se connecter</a>
        </div>
      </body></html>
    `, { status: 400, headers: { "Content-Type": "text/html" } });
  }

  const db = getDb();
  if (!db) {
    return new Response(`<html><body>Erreur technique. Veuillez réessayer plus tard.</body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } });
  }

  try {
    const user = await db.select({
      id: users.id,
      firstName: users.firstName,
      email: users.email,
      verified: users.verified,
      verificationToken: users.verificationToken,
      verificationTokenExpires: users.verificationTokenExpires,
    }).from(users).where(eq(users.verificationToken, token)).get();

    if (!user) {
      return new Response(`
        <!DOCTYPE html>
        <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
          <div style="background:#fff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.06);max-width:420px">
            <p style="color:#EF4444;font-size:18px;font-weight:600">Lien invalide ou déjà utilisé.</p>
            <p style="color:#666;font-size:14px">Ce lien de vérification n'est plus valide. Connectez-vous à votre compte.</p>
            <a href="/connexion" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#FF6B00;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Se connecter</a>
          </div>
        </body></html>
      `, { status: 400, headers: { "Content-Type": "text/html" } });
    }

    if (user.verified) {
      return new Response(`
        <!DOCTYPE html>
        <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
          <div style="background:#fff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.06);max-width:420px">
            <p style="color:#22C55E;font-size:18px;font-weight:600">Déjà vérifié ✓</p>
            <p style="color:#666;font-size:14px">Votre adresse email est déjà vérifiée. Vous pouvez vous connecter.</p>
            <a href="/connexion" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#FF6B00;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Se connecter</a>
          </div>
        </body></html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    }

    // Check expiry
    if (user.verificationTokenExpires) {
      const expires = new Date(user.verificationTokenExpires).getTime();
      if (Date.now() > expires) {
        return new Response(`
          <!DOCTYPE html>
          <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
            <div style="background:#fff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.06);max-width:420px">
              <p style="color:#EF4444;font-size:18px;font-weight:600">Lien expiré.</p>
              <p style="color:#666;font-size:14px">Le délai de vérification est dépassé. Connectez-vous pour recevoir un nouveau lien.</p>
              <a href="/connexion" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#FF6B00;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Se connecter</a>
            </div>
          </body></html>
        `, { status: 400, headers: { "Content-Type": "text/html" } });
      }
    }

    // Mark verified
    await db.update(users).set({
      verified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    }).where(eq(users.id, user.id)).run();

    // Auto-login
    await createSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.firstName,
      role: "resident",
      adminRole: null,
    });

    return new Response(`
      <!DOCTYPE html>
      <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
        <div style="background:#fff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.06);max-width:420px">
          <p style="font-size:40px;margin:0 0 8px">🎉</p>
          <p style="color:#22C55E;font-size:20px;font-weight:700;margin:0 0 8px">Email vérifié avec succès !</p>
          <p style="color:#666;font-size:14px;margin:0 0 20px">Votre compte est maintenant actif. Vous allez être redirigé vers l'accueil.</p>
          <a href="/" style="display:inline-block;padding:12px 28px;background:#FF6B00;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Accéder au site</a>
          <script>setTimeout(function(){window.location.href="/"},3000)</script>
        </div>
      </body></html>
    `, { status: 200, headers: { "Content-Type": "text/html" } });

  } catch (err: any) {
    console.error("Verify error:", err);
    return new Response(`<html><body>Erreur technique. Veuillez réessayer plus tard.</body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } });
  }
}
