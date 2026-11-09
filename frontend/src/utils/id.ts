let counter = 0;

/** Identificador local e único durante a execução (não serve como chave de banco). */
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
