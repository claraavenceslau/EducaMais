import { PointSource, Prisma, TaskStatus } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../auth/AppError";
import type { TaskInput } from "./task.schemas";

function toTaskDto(task: Prisma.TaskGetPayload<{ include: { subject: true } }>) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    subject: task.subject.name,
    dueDate: task.dueDate.toISOString().slice(0, 10),
    done: task.status === TaskStatus.COMPLETED,
  };
}

async function subjectIdFor(name: string): Promise<string> {
  const subjectName = name || "Geral";
  const subject = await prisma.subject.upsert({
    where: { name: subjectName },
    update: {},
    create: { name: subjectName },
  });
  return subject.id;
}

function taskData(input: TaskInput, subjectId: string): Omit<Prisma.TaskUncheckedCreateInput, "userId"> {
  const done = input.done;
  return {
    title: input.title,
    description: input.description || null,
    subjectId,
    dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
    status: done ? TaskStatus.COMPLETED : TaskStatus.PENDING,
    completedAt: done ? new Date() : null,
  };
}

async function awardTaskPoints(tx: Prisma.TransactionClient, userId: string, taskId: string) {
  const existing = await tx.pointEvent.findUnique({
    where: { userId_source_sourceId: { userId, source: PointSource.TASK, sourceId: taskId } },
    select: { id: true },
  });
  if (existing) return;
  await tx.pointEvent.create({ data: { userId, source: PointSource.TASK, sourceId: taskId, points: 10 } });
  await tx.user.update({ where: { id: userId }, data: { totalPoints: { increment: 10 } } });
}

export const taskService = {
  async list(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
    return tasks.map(toTaskDto);
  },

  async listSubjects() {
    return prisma.subject.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  },

  async create(userId: string, input: TaskInput) {
    const subjectId = await subjectIdFor(input.subject);
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: { ...taskData(input, subjectId), userId },
        include: { subject: true },
      });
      if (input.done) await awardTaskPoints(tx, userId, task.id);
      return toTaskDto(task);
    });
  },

  async update(userId: string, id: string, input: TaskInput) {
    const subjectId = await subjectIdFor(input.subject);
    return prisma.$transaction(async (tx) => {
      const existing = await tx.task.findFirst({ where: { id, userId }, select: { id: true, status: true } });
      if (!existing) throw new AppError(404, "TASK_NOT_FOUND", "Tarefa não encontrada.");

      const task = await tx.task.update({
        where: { id },
        data: taskData(input, subjectId),
        include: { subject: true },
      });
      if (input.done && existing.status !== TaskStatus.COMPLETED) await awardTaskPoints(tx, userId, id);
      return toTaskDto(task);
    });
  },

  async toggle(userId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.task.findFirst({
        where: { id, userId },
        select: { id: true, status: true },
      });
      if (!existing) throw new AppError(404, "TASK_NOT_FOUND", "Tarefa não encontrada.");

      const done = existing.status !== TaskStatus.COMPLETED;
      const task = await tx.task.update({
        where: { id },
        data: {
          status: done ? TaskStatus.COMPLETED : TaskStatus.PENDING,
          completedAt: done ? new Date() : null,
        },
        include: { subject: true },
      });

      if (done) {
        await awardTaskPoints(tx, userId, id);
      }

      return toTaskDto(task);
    });
  },

  async remove(userId: string, id: string) {
    const result = await prisma.task.deleteMany({ where: { id, userId } });
    if (result.count === 0) throw new AppError(404, "TASK_NOT_FOUND", "Tarefa não encontrada.");
  },
};
