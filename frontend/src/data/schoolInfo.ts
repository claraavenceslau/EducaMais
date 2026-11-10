// Informações educacionais mostradas na tela "Informações". Hoje são fixas e fictícias;
// com API, o calendário, os contatos e as perguntas frequentes passam a vir do servidor.
import { addDays } from '../utils/dates';

export type CalendarEvent = { id: string; title: string; date: string; kind: 'aula' | 'prova' | 'evento' | 'feriado' };
export type Contact = { id: string; name: string; phone?: string; email?: string; hours: string };
export type FaqItem = { id: string; question: string; answer: string };

export function calendarEvents(now: Date): CalendarEvent[] {
  return [
    { id: 'ev1', title: 'Reunião de pais e responsáveis', date: addDays(now, 4), kind: 'evento' },
    { id: 'ev2', title: 'Avaliações do trimestre', date: addDays(now, 9), kind: 'prova' },
    { id: 'ev3', title: 'Feira de Ciências', date: addDays(now, 16), kind: 'evento' },
    { id: 'ev4', title: 'Feriado: sem aula', date: addDays(now, 21), kind: 'feriado' },
    { id: 'ev5', title: 'Entrega de boletins', date: addDays(now, 30), kind: 'aula' },
  ];
}

export const CONTACTS: Contact[] = [
  { id: 'ct1', name: 'Secretaria', phone: '(00) 0000-0001', email: 'secretaria@escola.exemplo', hours: 'Seg a sex, 8h às 17h' },
  { id: 'ct2', name: 'Coordenação pedagógica', phone: '(00) 0000-0002', email: 'coordenacao@escola.exemplo', hours: 'Seg a sex, 8h às 16h' },
  { id: 'ct3', name: 'Direção', email: 'direcao@escola.exemplo', hours: 'Com horário marcado' },
];

export const FAQ: FaqItem[] = [
  { id: 'q1', question: 'Como peço uma declaração de matrícula?', answer: 'Na secretaria, com um documento de identificação. O prazo é de até 3 dias úteis. Você também pode agendar o atendimento pelo app.' },
  { id: 'q2', question: 'Quem pode registrar uma demanda?', answer: 'Estudantes, professores e responsáveis. Informe o assunto, descreva o problema e, se puder, anexe uma foto e o local.' },
  { id: 'q3', question: 'Como acompanho minha demanda?', answer: 'Em Escola > Demandas. Cada demanda tem um protocolo e uma linha do tempo com as etapas.' },
  { id: 'q4', question: 'Qual o horário de atendimento?', answer: 'De segunda a sexta, das 8h às 11h30 e das 14h às 17h. Os horários disponíveis para agendamento aparecem no app.' },
  { id: 'q5', question: 'O app usa minha localização o tempo todo?', answer: 'Não. A localização só é lida quando você toca em "Usar minha localização" ao registrar uma demanda, e você pode informar o endereço à mão.' },
  { id: 'q6', question: 'Como mudo as notificações?', answer: 'Em Perfil > Notificações, você escolhe quais tipos de aviso quer receber.' },
];
