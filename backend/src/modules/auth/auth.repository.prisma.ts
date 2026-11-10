import { prisma } from "../../lib/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: { name: string; email: string; password: string; role: "STUDENT" | "TEACHER" }) {
    return prisma.user.create({ data });
  },
};
