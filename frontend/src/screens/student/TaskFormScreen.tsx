import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, type TextInputInstance } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { TextField } from '../../components/TextField';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import type { Task } from '../../types';
import { addDays, isoToBr, maskBrDate, parseBrDate } from '../../utils/dates';
import { isPastDue, validateDueDate, validateTaskTitle } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskForm'>;

// Serve para criar, ver e editar. Ao editar, também é possível mudar o status.
export function TaskFormScreen({ navigation, route }: Props) {
  const { data, actions } = useData();
  const taskId = route.params?.taskId;
  const existing = taskId ? data.tasks.find((t) => t.id === taskId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [subject, setSubject] = useState(existing?.subject ?? '');
  const [due, setDue] = useState(isoToBr(existing?.dueDate ?? addDays(new Date(), 1)));
  const [done, setDone] = useState(existing?.done ?? false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [errors, setErrors] = useState<{ title?: string; due?: string }>({});
  const descRef = useRef<TextInputInstance>(null);
  const subjectRef = useRef<TextInputInstance>(null);
  const dueRef = useRef<TextInputInstance>(null);

  if (taskId && !existing) {
    // A tarefa foi excluída enquanto esta tela estava aberta.
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.notFound}>Esta tarefa não existe mais.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  async function handleSave() {
    if (saving) return;
    const next = { title: validateTaskTitle(title), due: validateDueDate(due) };
    setErrors(next);
    setSaveError(undefined);
    if (next.title || next.due) return;

    const task: Task = {
      id: existing?.id ?? '',
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      dueDate: parseBrDate(due)!, // a validação acima garante que a data existe
      done,
    };
    setSaving(true);
    try {
      await actions.saveTask(task);
      navigation.goBack();
    } catch {
      setSaveError('A tarefa não foi salva. Verifique se a API está conectada e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const pastDue = !errors.due && isPastDue(due, new Date()) && !done;

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={560}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TextField
          label="Título"
          placeholder="Ex.: Revisar capítulo 3"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          returnKeyType="next"
          maxLength={80}
          onSubmitEditing={() => descRef.current?.focus()}
        />
        <TextField
          ref={descRef}
          label="Descrição (opcional)"
          placeholder="Detalhes da tarefa"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextField
          ref={subjectRef}
          label="Disciplina ou curso (opcional)"
          placeholder="Ex.: Mobile II"
          value={subject}
          onChangeText={setSubject}
          returnKeyType="next"
          maxLength={24}
          onSubmitEditing={() => dueRef.current?.focus()}
        />
        <TextField
          ref={dueRef}
          label="Prazo"
          placeholder="DD/MM/AAAA"
          value={due}
          onChangeText={(v) => setDue(maskBrDate(v))}
          error={errors.due}
          hint={pastDue ? 'Este prazo já passou; a tarefa aparecerá como atrasada.' : undefined}
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        {!!existing && (
          <View style={styles.status}>
            <Text style={styles.statusLabel}>Status</Text>
            <SegmentedTabs
              options={[{ key: 'pendente', label: 'Pendente' }, { key: 'concluida', label: 'Concluída' }]}
              value={done ? 'concluida' : 'pendente'}
              onChange={(k) => setDone(k === 'concluida')}
            />
          </View>
        )}

        {!!saveError && <Text style={styles.saveError} accessibilityRole="alert">{saveError}</Text>}

        <View style={styles.actions}>
          <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" disabled={saving} onPress={() => navigation.goBack()} /></View>
          <View style={{ flex: 1 }}><Button title="Salvar" loading={saving} onPress={handleSave} /></View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginBottom: 16 },
  status: { marginBottom: 16 },
  statusLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  saveError: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, marginBottom: 12 },
});
