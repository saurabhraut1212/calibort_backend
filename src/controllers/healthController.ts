import { Request, Response } from "express";
import { ok } from "../utils/response";

export const health = (_req: Request, res: Response): Response =>
  res.json(ok("ok", { timestamp: new Date().toISOString() }));
