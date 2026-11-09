import { Router } from "express";
import { requireAuth } from "./auth.middleware";
import { authService } from "./auth.service";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./auth.schemas";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await authService.currentUser(req.auth!.userId);
  res.status(200).json({ user });
});

router.post("/register", async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json(result);
});

router.post("/login", async (req, res) => {
  const input = loginSchema.parse(req.body);
  res.status(200).json(await authService.login(input.email, input.password));
});

router.post("/forgot-password", async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await authService.requestPasswordReset(email);
  res.status(202).json({
    message: "Token de recuperação local gerado. Ele expira em uma hora.",
    resetToken: result.resetToken,
  });
});

router.post("/reset-password", async (req, res) => {
  const input = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(input.token, input.password);
  res.status(200).json({ message: "Senha atualizada com sucesso." });
});

export default router;
