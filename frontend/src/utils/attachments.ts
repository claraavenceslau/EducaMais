import type { Attachment, AttachmentKind } from '../types';

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB por arquivo

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export function formatBytes(bytes?: number): string {
  if (bytes === undefined) return 'tamanho desconhecido';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function kindFromMime(mime?: string): AttachmentKind {
  return mime?.startsWith('image/') ? 'image' : 'document';
}

/** Devolve a mensagem de erro ou undefined quando o arquivo pode ser anexado. */
export function validateAttachment(candidate: Attachment, current: Attachment[]): string | undefined {
  if (current.length >= MAX_ATTACHMENTS) return `Você pode anexar até ${MAX_ATTACHMENTS} arquivos.`;
  if (current.some((a) => a.uri === candidate.uri)) return 'Este arquivo já foi anexado.';
  if (candidate.sizeBytes !== undefined && candidate.sizeBytes > MAX_ATTACHMENT_BYTES) {
    return `"${candidate.name}" tem ${formatBytes(candidate.sizeBytes)}. O limite é ${formatBytes(MAX_ATTACHMENT_BYTES)}.`;
  }
  if (candidate.kind === 'document' && candidate.mimeType && !ALLOWED_DOCUMENT_TYPES.includes(candidate.mimeType)) {
    return 'Tipo de documento não aceito. Use PDF, Word ou texto.';
  }
  return undefined;
}
