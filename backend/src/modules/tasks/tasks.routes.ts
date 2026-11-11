import { Router } from "express";
import { z } from "zod";
import { Role, TaskStatus } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../auth/AppError";
import { requireAuth } from "../auth/auth.middleware";
import { requireRole } from "../auth/auth.roles";

const router = Router();

// Todas as rotas daqui exigem login.
router.use(requireAuth);

const listQuerySchema = z.object({
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  dueDate: z.coerce.date(),
  subjectId: z.uuid(),
});

const taskInclude = { subject: { select: { id: true, name: true } } } as const;

// Lista só as tarefas de quem está logado (o userId vem do token, nunca do corpo da requisição).
router.get("/", async (req, res) => {
  const { status } = listQuerySchema.parse(req.query);
  const tasks = await prisma.task.findMany({
    where: { userId: req.auth!.userId, ...(status ? { status } : {}) },
    include: taskInclude,
    orderBy: { dueDate: "asc" },
  });
  res.status(200).json({ tasks });
});

// Só aluno cria tarefa.
router.post("/", requireRole(Role.STUDENT), async (req, res) => {
  const input = createTaskSchema.parse(req.body);

  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } });
  if (!subject) throw new AppError(404, "SUBJECT_NOT_FOUND", "Matéria não encontrada.");

  const task = await prisma.task.create({
    data: {
      userId: req.auth!.userId,
      subjectId: input.subjectId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
    },
    include: taskInclude,
  });
  res.status(201).json({ task });
});

// Só aluno conclui, e só a própria tarefa.
router.patch("/:id/complete", requireRole(Role.STUDENT), async (req, res) => {
  const id = z.uuid().parse(req.params.id);

  const result = await prisma.task.updateMany({
    where: { id, userId: req.auth!.userId },
    data: { status: TaskStatus.COMPLETED, completedAt: new Date() },
  });
  if (result.count === 0) throw new AppError(404, "TASK_NOT_FOUND", "Tarefa não encontrada.");

  const task = await prisma.task.findUniqueOrThrow({ where: { id }, include: taskInclude });
  res.status(200).json({ task });
});

export default router;