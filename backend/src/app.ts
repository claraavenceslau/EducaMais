import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import { errorMiddleware } from "./modules/auth/error.middleware";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : "*" }));
app.use(express.json());
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use(errorMiddleware);

export default app;
