import { Router } from "express";
import {
  listUsersHandler,
  getUserHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler
} from "../controllers/userController";
import { requireAuth } from "../middleware/requireAuth";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Protected routes
router.get("/", requireAuth, listUsersHandler);
router.get("/:id", requireAuth, getUserHandler);

// Admin-only
router.post("/", requireAuth, isAdmin, createUserHandler);
router.delete("/:id", requireAuth, isAdmin, deleteUserHandler);

// Update allowed for owner or admin (middleware checks inside controller)
router.put("/:id", requireAuth, updateUserHandler);

export default router;
