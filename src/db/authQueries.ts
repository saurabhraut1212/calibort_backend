import pool from "./index";
import type { RowDataPacket, OkPacket } from "mysql2";

export type RefreshTokenRow = {
  id: number;
  user_id: number;
  token_hash: string;
  type: "refresh" | "reset";
  expires_at: string;
  revoked: number;
  created_at: string;
};


export async function insertTokenHash(
  userId: number,
  tokenHash: string,
  type: "refresh" | "reset",
  expiresAtIso: Date
): Promise<void> {
  const sql =
    "INSERT INTO auth_tokens (user_id, token_hash, type, expires_at, revoked) VALUES (?, ?, ?, ?, 0)";
  const conn = await pool.getConnection();
  try {
    await conn.query<OkPacket>(sql, [userId, tokenHash, type, expiresAtIso]);
  } finally {
    conn.release();
  }
}

/**
 * Find a token row by token_hash and type (returns null if not found).
 */
export async function findTokenByHash(
  tokenHash: string,
  type: "refresh" | "reset"
): Promise<RefreshTokenRow | null> {
  const sql =
    "SELECT id, user_id, token_hash, type, expires_at, revoked, created_at FROM auth_tokens WHERE token_hash = ? AND type = ? LIMIT 1";
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(sql, [tokenHash, type]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      user_id: Number(r.user_id),
      token_hash: String(r.token_hash),
      type: r.type as "refresh" | "reset",
      expires_at: String(r.expires_at),
      revoked: Number(r.revoked),
      created_at: String(r.created_at)
    };
  } finally {
    conn.release();
  }
}

/**
 * Revoke token by token_hash (set revoked = 1).
 */
export async function revokeTokenByHash(tokenHash: string): Promise<void> {
  const sql = "UPDATE auth_tokens SET revoked = 1 WHERE token_hash = ? LIMIT 1";
  const conn = await pool.getConnection();
  try {
    await conn.query<OkPacket>(sql, [tokenHash]);
  } finally {
    conn.release();
  }
}

/**
 * Revoke all refresh tokens for a user (used on login rotation).
 */
export async function revokeAllRefreshForUser(userId: number): Promise<void> {
  const sql = "UPDATE auth_tokens SET revoked = 1 WHERE user_id = ? AND type = 'refresh'";
  const conn = await pool.getConnection();
  try {
    await conn.query<OkPacket>(sql, [userId]);
  } finally {
    conn.release();
  }
}
