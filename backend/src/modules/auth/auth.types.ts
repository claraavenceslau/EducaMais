import type { Role } from "../../generated/prisma/client";

export type AuthPayload = {
  userId: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "aluno" | "professor";
};

export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "STUDENT" ? "aluno" : "professor",
  };
}
