import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Crie o arquivo .env a partir do .env.example.");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });