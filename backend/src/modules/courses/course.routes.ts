import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { courseService } from "./course.service";
import { courseIdSchema, courseInputSchema } from "./course.schemas";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.status(200).json({ courses: await courseService.list(req.auth!.userId, req.auth!.role) });
});

router.post("/", requireRole("TEACHER"), async (req, res) => {
  const input = courseInputSchema.parse(req.body);
  res.status(201).json({ course: await courseService.create(req.auth!.userId, input) });
});

router.put("/:id", requireRole("TEACHER"), async (req, res) => {
  const id = courseIdSchema.parse(req.params.id);
  const input = courseInputSchema.parse(req.body);
  res.status(200).json({ course: await courseService.update(req.auth!.userId, id, input) });
});

router.post("/:id/enroll", requireRole("STUDENT"), async (req, res) => {
  const id = courseIdSchema.parse(req.params.id);
  res.status(200).json({ course: await courseService.enroll(req.auth!.userId, id) });
});

router.patch("/:courseId/lessons/:lessonId/toggle", requireRole("STUDENT"), async (req, res) => {
  const courseId = courseIdSchema.parse(req.params.courseId);
  const lessonId = courseIdSchema.parse(req.params.lessonId);
  res.status(200).json({ course: await courseService.toggleLesson(req.auth!.userId, courseId, lessonId) });
});

export default router;
