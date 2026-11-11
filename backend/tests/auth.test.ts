import "dotenv/config";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

// ATENÇÃO: usa o banco do DATABASE_URL do .env. Os testes criam dados com e-mails
// únicos e apagam tudo no final.

const stamp = Date.now();
const studentEmail = `aluno.${stamp}@teste.com`;
const teacherEmail = `prof.${stamp}@teste.com`;
const password = "12345678";

let server: Server;
let baseUrl = "";
let studentToken = "";
let teacherToken = "";
let studentId = "";
let teacherId = "";
let subjectId = "";

async function call(path: string, opts: { method?: string; body?: unknown; token?: string } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = (await response.json().catch(() => ({}))) as any;
  return { status: response.status, json };
}

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  if (studentId) await prisma.task.deleteMany({ where: { userId: studentId } }).catch(() => {});
  if (subjectId) await prisma.subject.delete({ where: { id: subjectId } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: { in: [studentEmail, teacherEmail] } } }).catch(() => {});
  await prisma.$disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("cadastro", () => {
  it("cria aluno e devolve token", async () => {
    const r = await call("/auth/register", {
      method: "POST",
      body: { name: "Aluno Teste", email: studentEmail, password, role: "aluno" },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.user.role, "aluno");
    assert.ok(r.json.token);
    assert.equal(r.json.user.password, undefined, "não pode vazar a senha");
    studentToken = r.json.token;
    studentId = r.json.user.id;
  });

  it("cria professor", async () => {
    const r = await call("/auth/register", {
      method: "POST",
      body: { name: "Prof Teste", email: teacherEmail, password, role: "professor" },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.user.role, "professor");
    teacherToken = r.json.token;
    teacherId = r.json.user.id;
  });

  it("recusa e-mail repetido (409)", async () => {
    const r = await call("/auth/register", {
      method: "POST",
      body: { name: "Outro", email: studentEmail, password, role: "aluno" },
    });
    assert.equal(r.status, 409);
    assert.equal(r.json.error.code, "EMAIL_ALREADY_REGISTERED");
  });

  it("recusa dados inválidos (400)", async () => {
    const r = await call("/auth/register", {
      method: "POST",
      body: { name: "X", email: "invalido", password: "123", role: "aluno" },
    });
    assert.equal(r.status, 400);
    assert.equal(r.json.error.code, "VALIDATION_ERROR");
  });

  it("salva a senha com hash, nunca em texto puro", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: studentEmail } });
    assert.notEqual(user.password, password);
    assert.match(user.password, /^\$2[aby]\$/);
  });
});

describe("login", () => {
  it("entra com a senha certa (200)", async () => {
    const r = await call("/auth/login", { method: "POST", body: { email: studentEmail, password } });
    assert.equal(r.status, 200);
    assert.ok(r.json.token);
  });

  it("recusa senha errada (401)", async () => {
    const r = await call("/auth/login", { method: "POST", body: { email: studentEmail, password: "errada123" } });
    assert.equal(r.status, 401);
    assert.equal(r.json.error.code, "INVALID_CREDENTIALS");
  });

  it("e-mail inexistente dá a mesma resposta da senha errada", async () => {
    const r = await call("/auth/login", { method: "POST", body: { email: "nao.existe@teste.com", password } });
    assert.equal(r.status, 401);
    assert.equal(r.json.error.code, "INVALID_CREDENTIALS");
  });
});

describe("sessão (/auth/me)", () => {
  it("com token válido (200)", async () => {
    const r = await call("/auth/me", { token: studentToken });
    assert.equal(r.status, 200);
    assert.equal(r.json.user.email, studentEmail);
  });

  it("sem token (401)", async () => {
    const r = await call("/auth/me");
    assert.equal(r.status, 401);
    assert.equal(r.json.error.code, "AUTHENTICATION_REQUIRED");
  });

  it("com token adulterado (401)", async () => {
    const r = await call("/auth/me", { token: studentToken.slice(0, -3) + "xxx" });
    assert.equal(r.status, 401);
    assert.equal(r.json.error.code, "INVALID_TOKEN");
  });
});

describe("recuperação de senha", () => {
  it("forgot-password responde 202 mesmo com e-mail que não existe", async () => {
    const r = await call("/auth/forgot-password", { method: "POST", body: { email: "ninguem@teste.com" } });
    assert.equal(r.status, 202);
    assert.equal(r.json.resetToken, undefined);
  });

  it("reset-password recusa token inválido (400)", async () => {
    const r = await call("/auth/reset-password", {
      method: "POST",
      body: { token: "a".repeat(64), password: "novasenha123" },
    });
    assert.equal(r.status, 400);
    assert.equal(r.json.error.code, "INVALID_RESET_TOKEN");
  });
});

describe("tarefas e papéis", () => {
  it("rota de tarefas exige login (401)", async () => {
    const r = await call("/tasks");
    assert.equal(r.status, 401);
  });

  it("professor não pode criar tarefa (403)", async () => {
    const r = await call("/tasks", { method: "POST", token: teacherToken, body: {} });
    assert.equal(r.status, 403);
    assert.equal(r.json.error.code, "FORBIDDEN");
  });

  it("aluno recebe 404 para matéria inexistente", async () => {
    const r = await call("/tasks", {
      method: "POST",
      token: studentToken,
      body: {
        title: "Tarefa",
        dueDate: new Date(Date.now() + 86_400_000).toISOString(),
        subjectId: "00000000-0000-4000-8000-000000000000",
      },
    });
    assert.equal(r.status, 404);
    assert.equal(r.json.error.code, "SUBJECT_NOT_FOUND");
  });

  it("aluno cria, lista e conclui a própria tarefa", async () => {
    const subject = await prisma.subject.create({
      data: { instructorId: teacherId, name: `Matéria teste ${stamp}`, description: "Teste", level: "BEGINNER" },
    });
    subjectId = subject.id;

    const created = await call("/tasks", {
      method: "POST",
      token: studentToken,
      body: { title: "Estudar", dueDate: new Date(Date.now() + 86_400_000).toISOString(), subjectId },
    });
    assert.equal(created.status, 201);
    assert.equal(created.json.task.status, "PENDING");

    const list = await call("/tasks", { token: studentToken });
    assert.equal(list.status, 200);
    assert.equal(list.json.tasks.length, 1);

    // Outro usuário não enxerga a tarefa do aluno.
    const teacherList = await call("/tasks", { token: teacherToken });
    assert.equal(teacherList.json.tasks.length, 0);

    const done = await call(`/tasks/${created.json.task.id}/complete`, { method: "PATCH", token: studentToken });
    assert.equal(done.status, 200);
    assert.equal(done.json.task.status, "COMPLETED");
  });
});