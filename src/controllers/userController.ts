import { Request, Response } from "express";
import * as userService from "../services/userServices";
import { ok, fail } from "../utils/response";
import type { AuthRequest } from "../middleware/requireAuth";


export async function listUsersHandler(req: Request, res: Response): Promise<Response> {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const result = await userService.listUsers(page, limit, q);
    return res.json(ok("Users fetched", { users: result.users, meta: { page, limit, total: result.total } }));
  } catch (err) {
    return res.status(500).json(fail((err as Error).message));
  }
}


export async function getUserHandler(req: Request, res: Response): Promise<Response> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json(fail("Invalid id"));
    const user = await userService.getUser(id);
    if (!user) return res.status(404).json(fail("User not found"));
    return res.json(ok("User fetched", { user }));
  } catch (err) {
    return res.status(500).json(fail((err as Error).message));
  }
}

export async function createUserHandler(req: Request, res: Response): Promise<Response> {
  try {
    const { name, email, password, role } = req.body as { name?: string; email?: string; password?: string; role?: "admin" | "user" };
    if (!name || !email) return res.status(400).json(fail("name and email required"));
    const id = await userService.createUser({ name, email, password, role });
    return res.status(201).json(ok("User created", { id }));
  } catch (err) {
    return res.status(400).json(fail((err as Error).message));
  }
}


export async function updateUserHandler(req: Request, res: Response): Promise<Response> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json(fail("Invalid id"));
    const authReq = req as AuthRequest;
    const auth = authReq.auth;
    if (!auth) return res.status(401).json(fail("Unauthorized"));

   
    const targetUser = await userService.getUser(id);
    if (!targetUser) return res.status(404).json(fail("User not found"));


    const requester = await userService.findUserByEmail(auth.email);
    if (!requester) return res.status(401).json(fail("Unauthorized"));

    const isOwner = requester.id === id;
    if (requester.role !== "admin" && !isOwner) return res.status(403).json(fail("Forbidden"));

    const { name, email, password, avatar_url, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      avatar_url?: string | null;
      role?: "admin" | "user";
    };


    if (role && requester.role !== "admin") return res.status(403).json(fail("Only admin can change role"));

    await userService.updateUser(id, { name, email, password, avatar_url, role });
    return res.json(ok("User updated"));
  } catch (err) {
    return res.status(400).json(fail((err as Error).message));
  }
}


export async function deleteUserHandler(req: Request, res: Response): Promise<Response> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json(fail("Invalid id"));
    await userService.deleteUser(id);
    return res.json(ok("User deleted"));
  } catch (err) {
    return res.status(500).json(fail((err as Error).message));
  }
}
