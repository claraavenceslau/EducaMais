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

// ---- Fase 3 ----
export const validateDemandTitle = (v: string): string | undefined => {
  const t = v.trim();
  if (!t) return 'Informe um título para a demanda.';
  if (t.length < 5) return 'Use pelo menos 5 caracteres no título.';
  if (t.length > 80) return 'Use até 80 caracteres no título.';
  return undefined;
};

export const validateDemandDescription = (v: string): string | undefined => {
  const t = v.trim();
  if (!t) return 'Descreva o que está acontecendo.';
  if (t.length < 15) return 'Conte um pouco mais (pelo menos 15 caracteres).';
  if (t.length > 1000) return 'Use até 1000 caracteres na descrição.';
  return undefined;
};

export const validateManualLocation = (v: string): string | undefined => {
  const t = v.trim();
  if (!t) return 'Informe o endereço ou um ponto de referência.';
  if (t.length < 5) return 'Descreva um pouco melhor o local.';
  if (t.length > 160) return 'Use até 160 caracteres no local.';
  return undefined;
};

export const validateReviewComment = (v: string): string | undefined =>
  v.trim().length > 500 ? 'Use até 500 caracteres no comentário.' : undefined;

export const validateAppointmentReason = (v: string): string | undefined => {
  const t = v.trim();
  if (!t) return 'Conte o motivo do atendimento.';
  if (t.length < 5) return 'Descreva o motivo com um pouco mais de detalhe.';
  if (t.length > 200) return 'Use até 200 caracteres no motivo.';
  return undefined;
};

/** Telefone é opcional: vazio vale; se preenchido, precisa de DDD + número (10 ou 11 dígitos). */
export const validatePhone = (v: string): string | undefined => {
  if (!v.trim()) return undefined;
  const digits = v.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? undefined : 'Informe o telefone com DDD.';
};

export const validateClassGroup = (v: string): string | undefined =>
  v.trim().length > 40 ? 'Use até 40 caracteres.' : undefined;

/** (81) 99999-9999 enquanto a pessoa digita. */
export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
