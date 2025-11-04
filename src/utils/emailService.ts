import nodemailer from "nodemailer";
import config from "../config";
import logger from "../utils/logger";

type SendResult = { accepted: string[] };

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT ?? 587) === 465, 
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? ""
  }
});


export async function sendResetPasswordEmail(to: string, resetLink: string): Promise<SendResult> {
  const from = process.env.EMAIL_FROM ?? config.server.env === "production" ? "no-reply@calibort.com" : "Calibort <no-reply@calibort.test>";
  const subject = "Reset your Calibort password";
  const text = `You requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nIf you didn't request this, ignore this email. The link expires in ${process.env.RESET_TOKEN_EXPIRES_MIN ?? 60} minutes.`;
  const html = `<p>You requested a password reset. Click the link below to set a new password:</p>
  <p><a href="${resetLink}">${resetLink}</a></p>
  <p>If you didn't request this, ignore this email. The link expires in ${process.env.RESET_TOKEN_EXPIRES_MIN ?? 60} minutes.</p>`;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    transporter.verify()
  .then(() => logger.info("SMTP verified and ready to send emails"))
  .catch((err) => logger.error("SMTP verify failed:", (err as Error).message, err));
    return { accepted: (info as any).accepted ?? [] };
  } catch (err) {
    logger.error("Failed to send reset email", (err as Error).message);
    throw err;
  }
}
