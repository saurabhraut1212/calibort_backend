import { randomToken, sha256 } from "../utils/crypto";
import pool from "../db/index";
import bcrypt from "bcryptjs";
import { insertTokenHash, findTokenByHash, revokeTokenByHash } from "../db/authQueries";
import { sendResetPasswordEmail } from "../utils/emailService";
import config from "../config";


export async function createAndSendResetToken(email: string): Promise<void> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT id, email FROM users WHERE email = ? LIMIT 1", [email]);
    const arr = rows as any[];
    if (arr.length === 0) {
      return;
    }
    const userId = Number(arr[0].id);
    const frontend = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const expiresMin = Number(process.env.RESET_TOKEN_EXPIRES_MIN ?? 60);

    const plain = randomToken(36);
    const hash = sha256(plain);
    const expiresAtIso = new Date(Date.now() + expiresMin * 60 * 1000);

    await insertTokenHash(userId, hash, "reset", expiresAtIso);

    const resetLink = `${frontend}/reset-password?token=${plain}&email=${encodeURIComponent(email)}`;

    await sendResetPasswordEmail(email, resetLink);
  } finally {
    conn.release();
  }
}

export async function resetPassword(email: string, plainToken: string, newPassword: string): Promise<void> {
  const tokenHash = sha256(plainToken);
  const row = await findTokenByHash(tokenHash, "reset");
  if (!row) {
    throw new Error("Invalid or expired token");
  }
  if (row.revoked === 1) {
    throw new Error("Token already used");
  }
  const expiresAt = new Date(row.expires_at).getTime();
  if (Date.now() > expiresAt) {
    throw new Error("Token expired");
  }

  const conn = await pool.getConnection();
  try {
    const [users] = await conn.query("SELECT id, email FROM users WHERE id = ? LIMIT 1", [row.user_id]);
    const arr = users as any[];
    if (arr.length === 0) throw new Error("User not found");
    const userEmail = String(arr[0].email);
    if (userEmail !== email) throw new Error("Token does not match email");

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, row.user_id]);

    await revokeTokenByHash(tokenHash);
  } finally {
    conn.release();
  }
}
