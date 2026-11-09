import { Role } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../auth/AppError";
import type { discussionInputSchema, replyInputSchema } from "./community.schemas";
import type { z } from "zod";

type DiscussionInput = z.infer<typeof discussionInputSchema>;
type ReplyInput = z.infer<typeof replyInputSchema>;

const includeDiscussion = {
  user: { select: { name: true } },
  replies: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" as const } },
};

function toDto(discussion: Awaited<ReturnType<typeof findDiscussion>>) {
  if (!discussion) return null;
  return {
    id: discussion.id,
    author: discussion.user.name,
    title: discussion.title,
    body: discussion.body,
    subject: discussion.subject,
    createdAt: discussion.createdAt.toISOString(),
    replies: discussion.replies.map((reply) => ({
      id: reply.id,
      author: reply.user.name,
      body: reply.body,
      createdAt: reply.createdAt.toISOString(),
    })),
  };
}

function findDiscussion(id: string) {
  return prisma.discussion.findUnique({ where: { id }, include: includeDiscussion });
}

export const communityService = {
  async list() {
    const discussions = await prisma.discussion.findMany({ include: includeDiscussion, orderBy: { createdAt: "desc" } });
    return discussions.map((item) => toDto(item));
  },
  async create(userId: string, input: DiscussionInput) {
    const discussion = await prisma.discussion.create({
      data: { userId, title: input.title, body: input.body, subject: input.subject || "Geral" },
      include: includeDiscussion,
    });
    return toDto(discussion);
  },
  async remove(userId: string, role: Role, id: string) {
    const where = role === Role.TEACHER ? { id } : { id, userId };
    const result = await prisma.discussion.deleteMany({ where });
    if (!result.count) throw new AppError(404, "DISCUSSION_NOT_FOUND", "Discussão não encontrada.");
  },
  async reply(userId: string, discussionId: string, input: ReplyInput) {
    const exists = await prisma.discussion.findUnique({ where: { id: discussionId }, select: { id: true } });
    if (!exists) throw new AppError(404, "DISCUSSION_NOT_FOUND", "Discussão não encontrada.");
    await prisma.reply.create({ data: { discussionId, userId, body: input.body } });
    return toDto(await findDiscussion(discussionId));
  },
};
