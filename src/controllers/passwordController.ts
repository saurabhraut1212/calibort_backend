import { Request, Response } from "express";
import { ok, fail } from "../utils/response";
import { createAndSendResetToken, resetPassword } from "../services/passwordServices";

export async function forgotPasswordHandler(req: Request, res: Response): Promise<Response> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json(fail("Missing email"));
    await createAndSendResetToken(email);
    return res.status(200).json(ok("If the email exists, a reset link has been sent"));
  } catch (err) {
    return res.status(500).json(fail((err as Error).message));
  }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<Response> {
  try {
    const { email, token, newPassword } = req.body as { email?: string; token?: string; newPassword?: string };
    if (!email || !token || !newPassword) {
      return res.status(400).json(fail("email, token and newPassword are required"));
    }
    if (newPassword.length < 8) return res.status(400).json(fail("Password must be at least 8 characters"));

    await resetPassword(email, token, newPassword);
    return res.status(200).json(ok("Password has been reset"));
  } catch (err) {
    return res.status(400).json(fail((err as Error).message));
  }
}
