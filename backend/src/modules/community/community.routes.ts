import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { communityService } from "./community.service";
import { discussionIdSchema, discussionInputSchema, replyInputSchema } from "./community.schemas";

const router = Router();
router.use(requireAuth);
router.get("/", async (_req, res) => res.status(200).json({ discussions: await communityService.list() }));
router.post("/", async (req, res) => {
  const input = discussionInputSchema.parse(req.body);
  res.status(201).json({ discussion: await communityService.create(req.auth!.userId, input) });
});
router.delete("/:id", async (req, res) => {
  const id = discussionIdSchema.parse(req.params.id);
  await communityService.remove(req.auth!.userId, req.auth!.role, id);
  res.status(204).end();
});
router.post("/:id/replies", async (req, res) => {
  const id = discussionIdSchema.parse(req.params.id);
  const input = replyInputSchema.parse(req.body);
  res.status(201).json({ discussion: await communityService.reply(req.auth!.userId, id, input) });
});
export default router;
