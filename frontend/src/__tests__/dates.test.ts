import { describe, expect, it } from '@jest/globals';
import { addDays, dayChipLabel, daysUntil, dueLabel, isoToBr, longDate, maskBrDate, parseBrDate, timeAgo, toIsoDate } from '../utils/dates';
import { NOW } from '../testing/helpers';

describe('parseBrDate', () => {
  it('converte data válida para AAAA-MM-DD', () => {
    expect(parseBrDate('15/11/2026')).toBe('2026-11-15');
    expect(parseBrDate(' 01/01/2027 ')).toBe('2027-01-01');
  });
  it('rejeita datas que não existem', () => {
    expect(parseBrDate('31/02/2026')).toBeUndefined();
    expect(parseBrDate('00/10/2026')).toBeUndefined();
    expect(parseBrDate('10/13/2026')).toBeUndefined();
  });
  it('aceita 29/02 só em ano bissexto', () => {
    expect(parseBrDate('29/02/2028')).toBe('2028-02-29');
    expect(parseBrDate('29/02/2027')).toBeUndefined();
  });
  it('rejeita formato errado e anos fora do intervalo', () => {
    expect(parseBrDate('2026-11-15')).toBeUndefined();
    expect(parseBrDate('1/1/2026')).toBeUndefined();
    expect(parseBrDate('01/01/1800')).toBeUndefined();
  });
});

describe('máscara e conversões', () => {
  it('maskBrDate insere as barras', () => {
    expect(maskBrDate('2')).toBe('2');
    expect(maskBrDate('251')).toBe('25/1');
    expect(maskBrDate('25122026')).toBe('25/12/2026');
    expect(maskBrDate('25/12/2026999')).toBe('25/12/2026');
  });
  it('isoToBr inverte a data', () => {
    expect(isoToBr('2026-11-15')).toBe('15/11/2026');
  });
  it('toIsoDate e addDays usam a data local', () => {
    expect(toIsoDate(NOW)).toBe('2026-11-09');
    expect(addDays(NOW, 1)).toBe('2026-11-10');
    expect(addDays(NOW, -9)).toBe('2026-10-31');
    expect(addDays(new Date(2026, 11, 31), 1)).toBe('2027-01-01');
  });
});

describe('prazos', () => {
  it('daysUntil ignora a hora do dia', () => {
    const lateNight = new Date(2026, 10, 9, 23, 59);
    expect(daysUntil('2026-11-09', lateNight)).toBe(0);
    expect(daysUntil('2026-11-10', lateNight)).toBe(1);
    expect(daysUntil('2026-11-08', lateNight)).toBe(-1);
  });
  it('dueLabel', () => {
    expect(dueLabel('2026-11-09', NOW)).toBe('Hoje');
    expect(dueLabel('2026-11-10', NOW)).toBe('Amanhã');
    expect(dueLabel('2026-11-20', NOW)).toBe('20/11');
    expect(dueLabel('2026-11-05', NOW)).toBe('Atrasada · 05/11');
  });
});

describe('timeAgo', () => {
  const ago = (min: number) => new Date(NOW.getTime() - min * 60_000).toISOString();
  it('formata minutos, horas, ontem e data', () => {
    expect(timeAgo(ago(0), NOW)).toBe('agora');
    expect(timeAgo(ago(15), NOW)).toBe('há 15 min');
    expect(timeAgo(ago(120), NOW)).toBe('há 2 h');
    expect(timeAgo(ago(60 * 30), NOW)).toBe('ontem');
    expect(timeAgo(ago(60 * 24 * 5), NOW)).toBe('04/11');
  });
  it('data inválida vira "agora"', () => {
    expect(timeAgo('lixo', NOW)).toBe('agora');
  });
});

describe('rótulos de dia', () => {
  it('dayChipLabel e longDate', () => {
    expect(dayChipLabel('2026-11-09')).toBe('Seg 09/11');
    expect(longDate('2026-11-13')).toBe('Sex, 13/11/2026');
  });
});
