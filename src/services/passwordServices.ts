import { randomToken, sha256 } from "../utils/crypto";
import pool from "../db/index";
import bcrypt from "bcryptjs";
import { insertTokenHash, findTokenByHash, revokeTokenByHash } from "../db/authQueries";
import { sendResetPasswordEmail } from "../utils/emailService";
import config from "../config";

/**
 * Create a reset token for a user and send reset email.
 * Does not reveal whether the email exists in public responses (for security we can always respond success).
 */
export async function createAndSendResetToken(email: string): Promise<void> {
  // Find user by email
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT id, email FROM users WHERE email = ? LIMIT 1", [email]);
    const arr = rows as any[];
    if (arr.length === 0) {
      // For security: do not reveal absence. Return early to avoid timing leaks.
      return;
    }
    const userId = Number(arr[0].id);
    const frontend = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const expiresMin = Number(process.env.RESET_TOKEN_EXPIRES_MIN ?? 60);

    // Create plain token & hash
    const plain = randomToken(36);
    const hash = sha256(plain);
    const expiresAtIso = new Date(Date.now() + expiresMin * 60 * 1000);

    // Store hashed token
    await insertTokenHash(userId, hash, "reset", expiresAtIso);

    // Compose reset link
    const resetLink = `${frontend}/reset-password?token=${plain}&email=${encodeURIComponent(email)}`;

    // Send email
    await sendResetPasswordEmail(email, resetLink);
  } finally {
    conn.release();
  }
}

/**
 * Verify the reset token and update password.
 * Throws on invalid/expired token.
 */
export async function resetPassword(email: string, plainToken: string, newPassword: string): Promise<void> {
  // get token hash and find token row
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

  // verify that the token belongs to the provided email (optional but recommended)
  const conn = await pool.getConnection();
  try {
    const [users] = await conn.query("SELECT id, email FROM users WHERE id = ? LIMIT 1", [row.user_id]);
    const arr = users as any[];
    if (arr.length === 0) throw new Error("User not found");
    const userEmail = String(arr[0].email);
    if (userEmail !== email) throw new Error("Token does not match email");

    // update password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, row.user_id]);

    // revoke this reset token
    await revokeTokenByHash(tokenHash);
    // optionally revoke all other reset tokens for this user (not necessary but safe)
    // you can implement revokeAll by user if desired.
  } finally {
    conn.release();
  }
}
