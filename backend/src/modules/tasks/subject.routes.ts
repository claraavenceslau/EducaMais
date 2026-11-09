import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { taskService } from "./task.service";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  res.status(200).json({ subjects: await taskService.listSubjects() });
});

export default router;
