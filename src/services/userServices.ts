import bcrypt from "bcryptjs";
import * as userQueries from "../db/userQueries";
import type { User } from "../types/models";

export async function listUsers(page: number, limit: number, q?: string): Promise<{ users: User[]; total: number }> {
  return userQueries.findUsersPaginated(page, limit, q);
}

export async function getUser(id: number): Promise<User | null> {
  return userQueries.getUserById(id);
}


export async function createUser(payload: { name: string; email: string; password?: string; role?: "admin" | "user" }): Promise<number> {
  const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : null;
  const role = payload.role ?? "user";
  return userQueries.createUser(payload.name, payload.email, passwordHash, role);
}

export async function updateUser(id: number, payload: { name?: string; email?: string; password?: string; avatar_url?: string | null; role?: "admin" | "user" }): Promise<void> {
  const fields: { name?: string; email?: string; password_hash?: string | null; avatar_url?: string | null; role?: "admin" | "user" } = {};
  if (payload.name !== undefined) fields.name = payload.name;
  if (payload.email !== undefined) fields.email = payload.email;
  if (payload.password !== undefined) fields.password_hash = await bcrypt.hash(payload.password, 10);
  if (payload.avatar_url !== undefined) fields.avatar_url = payload.avatar_url;
  if (payload.role !== undefined) fields.role = payload.role;
  await userQueries.updateUser(id, fields);
}


export async function deleteUser(id: number): Promise<void> {
  await userQueries.deleteUser(id);
}


export async function findUserByEmail(email: string): Promise<User | null> {
  return userQueries.findUserByEmail(email);
}
