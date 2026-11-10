import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '../context/AuthContext';
import { draftKey, storage } from '../services/storage';

/**
 * Guarda o que a pessoa já digitou em um formulário, para não perder se o app fechar.
 * - Ao abrir, recupera o rascunho (se houver) e chama `onRestore`.
 * - Enquanto digita, salva depois de uma pausa.
 * - `clear()` apaga o rascunho (use ao enviar ou descartar).
 * Só campos de texto entram no rascunho; fotos e localização não são guardadas.
 */
export function useFormDraft<T extends Record<string, string>>(
  name: string,
  values: T,
  onRestore: (draft: Partial<T>) => void,
) {
  const user = useUser();
  const key = draftKey(user.id, name);
  const [restored, setRestored] = useState(false);
  const ready = useRef(false);
  const stopped = useRef(false);
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  useEffect(() => {
    let active = true;
    storage.get(key).then((raw) => {
      if (!active) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<T>;
          if (Object.values(parsed).some((v) => typeof v === 'string' && v.trim())) {
            restoreRef.current(parsed);
            setRestored(true);
          }
        } catch {
          // rascunho corrompido: ignora
        }
      }
      ready.current = true;
    });
    return () => {
      active = false;
    };
  }, [key]);

  const serialized = JSON.stringify(values);
  useEffect(() => {
    if (!ready.current || stopped.current) return;
    const timer = setTimeout(() => {
      const hasText = Object.values(values).some((v) => v.trim());
      if (hasText) storage.set(key, serialized);
      else storage.remove(key);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, key]);

  const clear = useCallback(() => {
    stopped.current = true;
    setRestored(false);
    return storage.remove(key);
  }, [key]);

  return { restored, clear };
}
