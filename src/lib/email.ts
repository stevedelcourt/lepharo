import { Resend } from "resend";

type SendVerificationParams = {
  to: string;
  firstName: string;
  token: string;
};

export async function sendVerificationEmail({ to, firstName, token }: SendVerificationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const baseUrl = "https://lepharo.vercel.app";

  const verifyUrl = `${baseUrl}/api/verify?token=${token}`;

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "Le Pharo <onboarding@resend.dev>",
    to,
    replyTo: "steven.delcourt@mentivis.com",
    subject: "Vérifiez votre adresse email — Le Pharo",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center">
              <img src="${baseUrl}/lepharo.svg" alt="Le Pharo" width="80" height="98" style="display:block;margin:0 auto 16px">
              <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 8px;line-height:1.3">
                Bienvenue sur la communauté du Pharo&nbsp;!
              </h1>
              <p style="font-size:15px;color:#666;margin:0 0 4px;line-height:1.5">
                Bonjour <strong>${firstName}</strong>,
              </p>
              <p style="font-size:15px;color:#666;margin:0 0 24px;line-height:1.5">
                Vous venez de créer votre compte. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et accéder à tous les services de la résidence.
              </p>
            </td>
          </tr>
          <!-- Button -->
          <tr>
            <td style="padding:0 32px 24px;text-align:center">
              <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;border-radius:10px;background:#FF6B00;color:#fff;font-size:16px;font-weight:700;text-decoration:none;line-height:1.4">
                VÉRIFIER MON EMAIL
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center">
              <p style="font-size:13px;color:#999;margin:0 0 8px;line-height:1.4">
                Ou copiez ce lien dans votre navigateur&nbsp;:
              </p>
              <p style="font-size:12px;color:#999;margin:0;word-break:break-all;line-height:1.4">
                ${verifyUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;border-top:1px solid #e8e8e8;text-align:center">
              <p style="font-size:12px;color:#aaa;margin:16px 0 0;line-height:1.4">
                Ce message a été envoyé automatiquement par Le Pharo — Résidence du 75 boulevard Charles Livon, 13007 Marseille.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
