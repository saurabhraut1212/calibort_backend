import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import pool from "../db/index";
import {
  insertTokenHash,
  findTokenByHash,
  revokeTokenByHash,
  revokeAllRefreshForUser
} from "../db/authQueries";
import { randomToken, sha256 } from "../utils/crypto";
import { RegisterDto, LoginDto, TokenPair } from "../types/dtos";

const ACCESS_EXP_SEC = Number(process.env.ACCESS_TOKEN_EXPIRES_SEC ?? 900);
const REFRESH_EXP_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
const REFRESH_EXP_SEC = REFRESH_EXP_DAYS * 24 * 60 * 60;

export async function registerUser(dto: RegisterDto): Promise<{ userId: number; email: string }> {
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query("SELECT id FROM users WHERE email = ? LIMIT 1", [dto.email]);
    const existingRows = existing as any[];
    if (existingRows.length > 0) {
      throw new Error("Email already registered");
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);
    const [result] = await conn.query("INSERT INTO users (name, email, password_hash, provider) VALUES (?, ?, ?, 'local')", [
      dto.name,
      dto.email,
      password_hash
    ]);
    const insertId = (result as any).insertId as number;
    return { userId: insertId, email: dto.email };
  } finally {
    conn.release();
  }
}


function signAccessToken(payload: { userId: number; email: string }): { token: string; expiresIn: number } {
  const expiresIn = ACCESS_EXP_SEC;
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn });
  return { token, expiresIn };
}

export async function loginUser(dto: LoginDto): Promise<TokenPair> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1", [dto.email]);
    const data = rows as any[];
    if (data.length === 0) throw new Error("Invalid credentials");
    const row = data[0];
    const userId = Number(row.id);
    const passwordHash = row.password_hash as string | null;
    if (!passwordHash) throw new Error("Invalid credentials");
    const valid = await bcrypt.compare(dto.password, passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const { token: accessToken, expiresIn } = signAccessToken({ userId, email: dto.email });

    await revokeAllRefreshForUser(userId);

    const refreshPlain = randomToken(48);
    const refreshHash = sha256(refreshPlain);
    const expiresAtIso = new Date(Date.now() + REFRESH_EXP_SEC * 1000);
    await insertTokenHash(userId, refreshHash, "refresh", expiresAtIso);

    const pair: TokenPair = {
      accessToken,
      accessTokenExpiresIn: expiresIn,
      refreshToken: refreshPlain,
      refreshTokenExpiresIn: REFRESH_EXP_SEC
    };
    return pair;
  } finally {
    conn.release();
  }
}

export async function refreshToken(oldRefreshPlain: string): Promise<TokenPair> {
  const oldHash = sha256(oldRefreshPlain);
  const row = await findTokenByHash(oldHash, "refresh");
  if (!row) throw new Error("Invalid refresh token");
  if (row.revoked === 1) throw new Error("Refresh token revoked");
  if (Date.now() > new Date(row.expires_at).getTime()) throw new Error("Refresh token expired");


  await revokeTokenByHash(oldHash);

  const newPlain = randomToken(48);
  const newHash = sha256(newPlain);
  const newExpiresAtIso = new Date(Date.now() + REFRESH_EXP_SEC * 1000);
  await insertTokenHash(row.user_id, newHash, "refresh", newExpiresAtIso);

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT email FROM users WHERE id = ? LIMIT 1", [row.user_id]);
    const data = rows as any[];
    const email = data.length > 0 ? String(data[0].email) : "";
    const { token: accessToken, expiresIn } = signAccessToken({ userId: row.user_id, email });
    return {
      accessToken,
      accessTokenExpiresIn: expiresIn,
      refreshToken: newPlain,
      refreshTokenExpiresIn: REFRESH_EXP_SEC
    };
  } finally {
    conn.release();
  }
}

export async function logout(refreshPlain: string): Promise<void> {
  const hash = sha256(refreshPlain);
  await revokeTokenByHash(hash);
}
