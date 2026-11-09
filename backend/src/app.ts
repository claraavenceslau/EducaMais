import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import { errorMiddleware } from "./modules/auth/error.middleware";
import taskRoutes from "./modules/tasks/task.routes";
import subjectRoutes from "./modules/tasks/subject.routes";
import courseRoutes from "./modules/courses/course.routes";
import gamificationRoutes from "./modules/courses/gamification.routes";
import communityRoutes from "./modules/community/community.routes";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : "*" }));
app.use(express.json());
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/subjects", subjectRoutes);
app.use("/courses", courseRoutes);
app.use("/gamification", gamificationRoutes);
app.use("/community", communityRoutes);
app.use(errorMiddleware);

export default app;
