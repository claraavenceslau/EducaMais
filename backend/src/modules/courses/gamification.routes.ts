import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { courseService } from "./course.service";

const router = Router();
router.use(requireAuth, requireRole("STUDENT"));

router.get("/", async (req, res) => {
  res.status(200).json(await courseService.gamification(req.auth!.userId));
});

export default router;
