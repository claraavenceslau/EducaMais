import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { taskService } from "./task.service";
import { taskIdSchema, taskInputSchema } from "./task.schemas";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.status(200).json({ tasks: await taskService.list(req.auth!.userId) });
});

router.post("/", async (req, res) => {
  const input = taskInputSchema.parse(req.body);
  res.status(201).json({ task: await taskService.create(req.auth!.userId, input) });
});

router.put("/:id", async (req, res) => {
  const id = taskIdSchema.parse(req.params.id);
  const input = taskInputSchema.parse(req.body);
  res.status(200).json({ task: await taskService.update(req.auth!.userId, id, input) });
});

router.patch("/:id/toggle", async (req, res) => {
  const id = taskIdSchema.parse(req.params.id);
  res.status(200).json({ task: await taskService.toggle(req.auth!.userId, id) });
});

router.delete("/:id", async (req, res) => {
  const id = taskIdSchema.parse(req.params.id);
  await taskService.remove(req.auth!.userId, id);
  res.status(204).end();
});

export default router;
