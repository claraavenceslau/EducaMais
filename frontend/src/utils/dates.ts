const pad = (n: number) => String(n).padStart(2, '0');

/** Data local no formato AAAA-MM-DD. */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Soma dias a uma data e devolve AAAA-MM-DD. */
export function addDays(base: Date, days: number): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  return toIsoDate(d);
}

/** Converte DD/MM/AAAA em AAAA-MM-DD. Devolve undefined se a data não existir. */
export function parseBrDate(text: string): string | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!m) return undefined;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (year < 1900 || year > 2100) return undefined;
  const d = new Date(year, month - 1, day);
  // o Date "corrige" datas impossíveis (31/02 vira março), então conferimos
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return undefined;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Converte AAAA-MM-DD em DD/MM/AAAA. */
export function isoToBr(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Máscara de digitação: "25122026" vira "25/12/2026". */
export function maskBrDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function startOfDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Diferença em dias entre a data (AAAA-MM-DD) e hoje. Negativo = já passou. */
export function daysUntil(iso: string, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfDay(iso).getTime() - today.getTime()) / 86_400_000);
}

/** Texto curto do prazo: Hoje, Amanhã, 25/12 ou Atrasada · 20/10. */
export function dueLabel(iso: string, now: Date): string {
  const diff = daysUntil(iso, now);
  const short = `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff < 0) return `Atrasada · ${short}`;
  return short;
}

/** "agora", "há 15 min", "há 2 h", "ontem" ou "20/10". */
export function timeAgo(isoDateTime: string, now: Date): string {
  const then = new Date(isoDateTime);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
  if (Number.isNaN(minutes) || minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  return `${pad(then.getDate())}/${pad(then.getMonth() + 1)}`;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** "Seg 10/11", para botões de escolha de dia. */
export function dayChipLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** "Seg, 10/11/2026". */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]}, ${isoToBr(iso)}`;
}
