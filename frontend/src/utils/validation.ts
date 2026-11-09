import { daysUntil, parseBrDate } from './dates';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (v: string): string | undefined => {
  if (!v.trim()) return 'Informe seu e-mail.';
  if (!EMAIL_REGEX.test(v.trim())) return 'Digite um e-mail válido.';
  return undefined;
};

export const validatePassword = (v: string): string | undefined => {
  if (!v) return 'Informe sua senha.';
  return undefined;
};

export const validateName = (v: string): string | undefined => {
  if (!v.trim()) return 'Informe seu nome.';
  return undefined;
};

export const validateNewPassword = (v: string): string | undefined => {
  if (!v) return 'Crie uma senha.';
  if (v.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  return undefined;
};

export const validateConfirmPassword = (v: string, original: string): string | undefined => {
  if (!v) return 'Confirme sua senha.';
  if (v !== original) return 'As senhas não coincidem.';
  return undefined;
};

// ---- Tarefas, cursos e comunidade ----

export const validateTaskTitle = (v: string): string | undefined => {
  if (!v.trim()) return 'Informe o título da tarefa.';
  if (v.trim().length > 80) return 'Use até 80 caracteres no título.';
  return undefined;
};

/** Prazo em DD/MM/AAAA. Aceita datas passadas, pois uma tarefa pode estar atrasada. */
export const validateDueDate = (v: string): string | undefined => {
  if (!v.trim()) return 'Informe o prazo.';
  if (!parseBrDate(v)) return 'Use uma data válida, como 25/12/2026.';
  return undefined;
};

/** Aviso (não bloqueia) quando o prazo já passou. */
export const isPastDue = (v: string, now: Date): boolean => {
  const iso = parseBrDate(v);
  return !!iso && daysUntil(iso, now) < 0;
};

export const validateCourseTitle = (v: string): string | undefined => {
  if (!v.trim()) return 'Informe o título do curso.';
  if (v.trim().length > 60) return 'Use até 60 caracteres no título.';
  return undefined;
};

export const validateRequiredText = (label: string) => (v: string): string | undefined =>
  v.trim() ? undefined : `Preencha ${label}.`;

export const validateDiscussionTitle = (v: string): string | undefined => {
  if (!v.trim()) return 'Informe o título da discussão.';
  if (v.trim().length > 100) return 'Use até 100 caracteres no título.';
  return undefined;
};

export const validateReply = (v: string): string | undefined => {
  if (!v.trim()) return 'Escreva um comentário antes de enviar.';
  return undefined;
};
