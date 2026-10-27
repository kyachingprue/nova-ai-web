import nodemailer from "nodemailer";

export async function sendVerificationCode(email: string, code: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error("Email delivery is not configured. Set the SMTP environment variables.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "Your Nova AI verification code",
    text: `Your Nova AI verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;color:#171526"><h1 style="font-size:24px">Verify your email</h1><p>Enter this code to finish creating your Nova AI account:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:20px;background:#f4f1ff;border-radius:12px;text-align:center">${code}</div><p>This code expires in 10 minutes.</p></div>`,
  });
}
