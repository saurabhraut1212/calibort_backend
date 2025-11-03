import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { fail } from "../utils/response";

export interface AuthRequest extends Request {
  auth?: {
    userId: number;
    email: string;
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): Response | void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json(fail("Missing authorization header"));
  }
  const token = header.replace("Bearer ", "").trim();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number; email: string; iat: number; exp: number };
    (req as AuthRequest).auth = { userId: payload.userId, email: payload.email };
    return next();
  } catch {
    return res.status(401).json(fail("Invalid or expired token"));
  }
}
