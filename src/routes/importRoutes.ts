import { Router } from "express";
import { importReqresHandler } from "../controllers/importController";
import { requireAuth } from "../middleware/requireAuth";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.post("/reqres", requireAuth, isAdmin, importReqresHandler);

export default router;
