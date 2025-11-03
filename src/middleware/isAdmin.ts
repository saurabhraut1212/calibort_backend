import { Request, Response, NextFunction } from "express";
import { fail } from "../utils/response";
import * as userService from "../services/userServices";
import type { AuthRequest } from "./requireAuth";

/**
 * Middleware to allow only admin users.
 * Requires requireAuth to run before it (so req.auth exists).
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  const r = req as AuthRequest;
  const auth = r.auth;
  if (!auth) {
    return res.status(401).json(fail("Unauthorized"));
  }
  const user = await userService.findUserByEmail(auth.email);
  if (!user) return res.status(401).json(fail("Unauthorized"));
  if (user.role !== "admin") return res.status(403).json(fail("Admin access required"));
  return next();
}
