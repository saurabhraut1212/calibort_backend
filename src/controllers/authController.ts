import { Request, Response } from "express";
import { ok, fail } from "../utils/response";
import * as authService from "../services/authServices";
import type { RegisterDto, LoginDto } from "../types/dtos";

export async function register(req: Request, res: Response): Promise<Response> {
  try {
    const dto = req.body as RegisterDto;
    if (!dto?.name || !dto?.email || !dto?.password) {
      return res.status(400).json(fail("Missing required fields"));
    }
    const created = await authService.registerUser(dto);
    return res.status(201).json(ok("User registered", { id: created.userId, email: created.email }));
  } catch (err) {
    return res.status(400).json(fail((err as Error).message));
  }
}

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const dto = req.body as LoginDto;
    if (!dto?.email || !dto?.password) {
      return res.status(400).json(fail("Missing email or password"));
    }
    const tokens = await authService.loginUser(dto);
    // For simplicity return refresh token in body. In prod prefer httpOnly secure cookie.
    return res.status(200).json(ok("Login successful", tokens));
  } catch (err) {
    return res.status(401).json(fail((err as Error).message));
  }
}

export async function refresh(req: Request, res: Response): Promise<Response> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json(fail("Missing refreshToken"));
    const tokens = await authService.refreshToken(refreshToken);
    return res.status(200).json(ok("Token refreshed", tokens));
  } catch (err) {
    return res.status(401).json(fail((err as Error).message));
  }
}

export async function logout(req: Request, res: Response): Promise<Response> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json(fail("Missing refreshToken"));
    await authService.logout(refreshToken);
    return res.status(200).json(ok("Logged out"));
  } catch (err) {
    return res.status(500).json(fail((err as Error).message));
  }
}
