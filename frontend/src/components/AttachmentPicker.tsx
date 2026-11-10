import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickDocument, pickPhoto, takePhoto, type PickResult } from '../services/media';
import { colors, fonts, radius } from '../theme';
import type { Attachment } from '../types';
import { formatBytes, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, validateAttachment } from '../utils/attachments';
import { Button } from './Button';

type Props = {
  value: Attachment[];
  onChange: (next: Attachment[]) => void;
};

// Anexos da demanda: tirar foto, escolher da galeria ou anexar um documento.
// Mostra prévia das imagens, valida tamanho e quantidade e permite remover.
export function AttachmentPicker({ value, onChange }: Props) {
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function run(pick: () => Promise<PickResult>) {
    if (busy) return;
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await pick();
      if (result.status === 'ok') {
        const problem = validateAttachment(result.attachment, value);
        if (problem) setMessage(problem);
        else onChange([...value, result.attachment]);
      } else if (result.status === 'denied' || result.status === 'error') {
        setMessage(result.message);
      }
    } finally {
      setBusy(false);
    }
  }

  const full = value.length >= MAX_ATTACHMENTS;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Fotos e documentos (opcional)</Text>
      <Text style={styles.hint}>
        Até {MAX_ATTACHMENTS} arquivos de {formatBytes(MAX_ATTACHMENT_BYTES)} cada. Documentos: PDF, Word ou texto.
      </Text>

      <View style={styles.buttons}>
        {Platform.OS !== 'web' && (
          <View style={{ flex: 1 }}><Button title="Tirar foto" size="sm" variant="secondary" disabled={full || busy} onPress={() => run(takePhoto)} /></View>
        )}
        <View style={{ flex: 1 }}><Button title="Galeria" size="sm" variant="secondary" disabled={full || busy} onPress={() => run(pickPhoto)} /></View>
        <View style={{ flex: 1 }}><Button title="Documento" size="sm" variant="secondary" disabled={full || busy} onPress={() => run(pickDocument)} /></View>
      </View>

      {!!message && (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{message}</Text>
      )}

      {value.length > 0 && (
        <View style={styles.list}>
          {value.map((a) => (
            <View key={a.id} style={styles.item}>
              {a.kind === 'image' ? (
                <Image source={{ uri: a.uri }} style={styles.thumb} accessibilityLabel={`Prévia da foto ${a.name}`} />
              ) : (
                <View style={[styles.thumb, styles.doc]}>
                  <Ionicons name="document-text-outline" size={26} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
                <Text style={styles.size}>{formatBytes(a.sizeBytes)}</Text>
              </View>
              <Pressable
                onPress={() => onChange(value.filter((x) => x.id !== a.id))}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remover anexo ${a.name}`}
                style={styles.remove}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 10 },
  buttons: { flexDirection: 'row', gap: 8 },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.error, marginTop: 8 },
  list: { gap: 8, marginTop: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 8, borderWidth: 1, borderColor: colors.border },
  thumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: colors.background },
  doc: { alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  size: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  remove: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
});
