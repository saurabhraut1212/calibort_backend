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

router.get("/", requireAuth, listUsersHandler);
router.get("/:id", requireAuth, getUserHandler);

router.post("/", requireAuth, isAdmin, createUserHandler);
router.delete("/:id", requireAuth, isAdmin, deleteUserHandler);

router.put("/:id", requireAuth, updateUserHandler);

export default router;
