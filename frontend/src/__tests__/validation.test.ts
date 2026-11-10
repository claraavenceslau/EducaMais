import { describe, expect, it } from '@jest/globals';
import {
  isPastDue, maskPhone, validateAppointmentReason, validateConfirmPassword, validateCourseTitle, validateDemandDescription,
  validateDemandTitle, validateDueDate, validateEmail, validateManualLocation, validateNewPassword, validatePhone,
  validateReviewComment, validateTaskTitle,
} from '../utils/validation';
import { NOW } from '../testing/helpers';

describe('acesso', () => {
  it('e-mail', () => {
    expect(validateEmail('')).toBeDefined();
    expect(validateEmail('sem-arroba')).toBeDefined();
    expect(validateEmail('a@b')).toBeDefined();
    expect(validateEmail(' ana@escola.com ')).toBeUndefined();
  });
  it('senha nova exige 8 caracteres', () => {
    expect(validateNewPassword('1234567')).toBeDefined();
    expect(validateNewPassword('12345678')).toBeUndefined();
  });
  it('confirmação precisa ser igual', () => {
    expect(validateConfirmPassword('a', 'b')).toBeDefined();
    expect(validateConfirmPassword('abc', 'abc')).toBeUndefined();
  });
});

describe('tarefas e cursos', () => {
  it('título da tarefa', () => {
    expect(validateTaskTitle('   ')).toBeDefined();
    expect(validateTaskTitle('x'.repeat(81))).toBeDefined();
    expect(validateTaskTitle('Revisar')).toBeUndefined();
  });
  it('prazo aceita data passada mas isPastDue avisa', () => {
    expect(validateDueDate('31/02/2026')).toBeDefined();
    expect(validateDueDate('05/11/2026')).toBeUndefined();
    expect(isPastDue('05/11/2026', NOW)).toBe(true);
    expect(isPastDue('09/11/2026', NOW)).toBe(false);
  });
  it('título do curso', () => {
    expect(validateCourseTitle('')).toBeDefined();
    expect(validateCourseTitle('x'.repeat(61))).toBeDefined();
    expect(validateCourseTitle('UX')).toBeUndefined();
  });
});

describe('demandas', () => {
  it('título entre 5 e 80', () => {
    expect(validateDemandTitle('abc')).toBeDefined();
    expect(validateDemandTitle('x'.repeat(81))).toBeDefined();
    expect(validateDemandTitle('Lâmpada queimada')).toBeUndefined();
  });
  it('descrição entre 15 e 1000', () => {
    expect(validateDemandDescription('curta')).toBeDefined();
    expect(validateDemandDescription('x'.repeat(1001))).toBeDefined();
    expect(validateDemandDescription('Lâmpadas queimadas no corredor')).toBeUndefined();
  });
  it('local manual', () => {
    expect(validateManualLocation('')).toBeDefined();
    expect(validateManualLocation('sala')).toBeDefined();
    expect(validateManualLocation('Sala 12, bloco B')).toBeUndefined();
  });
});

describe('avaliação, agendamento e perfil', () => {
  it('comentário da avaliação é opcional, até 500', () => {
    expect(validateReviewComment('')).toBeUndefined();
    expect(validateReviewComment('x'.repeat(501))).toBeDefined();
  });
  it('motivo do atendimento', () => {
    expect(validateAppointmentReason('')).toBeDefined();
    expect(validateAppointmentReason('oi')).toBeDefined();
    expect(validateAppointmentReason('Pedir declaração')).toBeUndefined();
  });
  it('telefone é opcional; preenchido exige DDD', () => {
    expect(validatePhone('')).toBeUndefined();
    expect(validatePhone('9999-9999')).toBeDefined();
    expect(validatePhone('(81) 3333-4444')).toBeUndefined();
    expect(validatePhone('(81) 99999-4444')).toBeUndefined();
  });
  it('maskPhone', () => {
    expect(maskPhone('81')).toBe('81');
    expect(maskPhone('81999')).toBe('(81) 999');
    expect(maskPhone('8133334444')).toBe('(81) 3333-4444');
    expect(maskPhone('81999994444')).toBe('(81) 99999-4444');
    expect(maskPhone('819999944449999')).toBe('(81) 99999-4444');
  });
});
