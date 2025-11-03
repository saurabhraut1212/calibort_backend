import pool from "./index";
import type { RowDataPacket, OkPacket } from "mysql2";
import { User } from "../types/models";

/**
 * Paginated users list with optional search
 */
export async function findUsersPaginated(
  page: number,
  limit: number,
  q?: string
): Promise<{ users: User[]; total: number }> {
  const offset = (page - 1) * limit;
  const conn = await pool.getConnection();
  try {
    const searchClause = q ? "WHERE name LIKE ? OR email LIKE ?" : "";
    const params: Array<string | number> = [];
    if (q) {
      const wild = `%${q}%`;
      params.push(wild, wild);
    }
    params.push(limit, offset);

    const sql = `
      SELECT SQL_CALC_FOUND_ROWS id, name, email, avatar_url, provider, reqres_id, role, created_at, updated_at
      FROM users
      ${searchClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await conn.query<RowDataPacket[]>(sql, params);
    const [countRows] = await conn.query<RowDataPacket[]>("SELECT FOUND_ROWS() as total");
    const total = countRows.length > 0 ? Number(countRows[0].total) : 0;

    const users: User[] = rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      avatar_url: r.avatar_url ?? null,
      provider: (r.provider as "local" | "reqres") ?? "local",
      reqres_id: r.reqres_id ? Number(r.reqres_id) : null,
      role: (r.role as "admin" | "user") ?? "user",
      password_hash: null,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at)
    }));
    return { users, total };
  } finally {
    conn.release();
  }
}

/**
 * Get user by id
 */
export async function getUserById(id: number): Promise<User | null> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id, name, email, avatar_url, provider, reqres_id, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      avatar_url: r.avatar_url ?? null,
      provider: (r.provider as "local" | "reqres") ?? "local",
      reqres_id: r.reqres_id ? Number(r.reqres_id) : null,
      role: (r.role as "admin" | "user") ?? "user",
      password_hash: null,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at)
    };
  } finally {
    conn.release();
  }
}

/**
 * Create user (returns inserted id)
 */
export async function createUser(
  name: string,
  email: string,
  passwordHash: string | null,
  role: "admin" | "user" = "user"
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<OkPacket>(
      "INSERT INTO users (name, email, password_hash, role, provider) VALUES (?, ?, ?, ?, 'local')",
      [name, email, passwordHash, role]
    );
    return (result as OkPacket).insertId;
  } finally {
    conn.release();
  }
}

/**
 * Update user fields (partial)
 */
export async function updateUser(
  id: number,
  fields: { name?: string; email?: string; password_hash?: string | null; avatar_url?: string | null; role?: "admin" | "user" }
): Promise<void> {
  const sets: string[] = [];
  const params: Array<string | number | null> = [];

  if (fields.name !== undefined) {
    sets.push("name = ?");
    params.push(fields.name);
  }
  if (fields.email !== undefined) {
    sets.push("email = ?");
    params.push(fields.email);
  }
  if (fields.password_hash !== undefined) {
    sets.push("password_hash = ?");
    params.push(fields.password_hash);
  }
  if (fields.avatar_url !== undefined) {
    sets.push("avatar_url = ?");
    params.push(fields.avatar_url);
  }
  if (fields.role !== undefined) {
    sets.push("role = ?");
    params.push(fields.role);
  }

  if (sets.length === 0) return;

  const sql = `UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  params.push(id);
  const conn = await pool.getConnection();
  try {
    await conn.query(sql, params);
  } finally {
    conn.release();
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query("DELETE FROM users WHERE id = ?", [id]);
  } finally {
    conn.release();
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id, name, email, avatar_url, provider, reqres_id, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      avatar_url: r.avatar_url ?? null,
      provider: (r.provider as "local" | "reqres") ?? "local",
      reqres_id: r.reqres_id ? Number(r.reqres_id) : null,
      role: (r.role as "admin" | "user") ?? "user",
      password_hash: null,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at)
    };
  } finally {
    conn.release();
  }
}
