import bcrypt from "bcryptjs";
import * as userQueries from "../db/userQueries";
import type { User } from "../types/models";

/** List users with pagination and optional search */
export async function listUsers(page: number, limit: number, q?: string): Promise<{ users: User[]; total: number }> {
  return userQueries.findUsersPaginated(page, limit, q);
}

/** Get a single user */
export async function getUser(id: number): Promise<User | null> {
  return userQueries.getUserById(id);
}

/** Create a new user (admin action) */
export async function createUser(payload: { name: string; email: string; password?: string; role?: "admin" | "user" }): Promise<number> {
  const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : null;
  const role = payload.role ?? "user";
  return userQueries.createUser(payload.name, payload.email, passwordHash, role);
}

/** Update user (admin or owner) */
export async function updateUser(id: number, payload: { name?: string; email?: string; password?: string; avatar_url?: string | null; role?: "admin" | "user" }): Promise<void> {
  const fields: { name?: string; email?: string; password_hash?: string | null; avatar_url?: string | null; role?: "admin" | "user" } = {};
  if (payload.name !== undefined) fields.name = payload.name;
  if (payload.email !== undefined) fields.email = payload.email;
  if (payload.password !== undefined) fields.password_hash = await bcrypt.hash(payload.password, 10);
  if (payload.avatar_url !== undefined) fields.avatar_url = payload.avatar_url;
  if (payload.role !== undefined) fields.role = payload.role;
  await userQueries.updateUser(id, fields);
}

/** Delete user */
export async function deleteUser(id: number): Promise<void> {
  await userQueries.deleteUser(id);
}

/** Find by email (used by auth/isAdmin helpers) */
export async function findUserByEmail(email: string): Promise<User | null> {
  return userQueries.findUserByEmail(email);
}
