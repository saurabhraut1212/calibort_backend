import { Router } from "express";
import { forgotPasswordHandler, resetPasswordHandler } from "../controllers/passwordController";

const router = Router();

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPasswordHandler);

// POST /api/auth/reset-password
router.post("/reset-password", resetPasswordHandler);

export default router;
