import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, type TextInputInstance } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import type { MainStackParamList } from '../../navigation/types';
import { newId } from '../../utils/id';
import { validateDiscussionTitle, validateRequiredText } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'DiscussionForm'>;

const validateBody = validateRequiredText('a mensagem');

export function DiscussionFormScreen({ navigation }: Props) {
  const user = useUser();
  const { actions } = useData();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const bodyRef = useRef<TextInputInstance>(null);

  // Se o app fechar no meio, o texto digitado é recuperado na próxima vez.
  const draft = useFormDraft('discussion', { title, body, subject }, (d) => {
    if (d.title) setTitle(d.title);
    if (d.body) setBody(d.body);
    if (d.subject) setSubject(d.subject);
  });

  function handleSave() {
    const next = { title: validateDiscussionTitle(title), body: validateBody(body) };
    setErrors(next);
    if (next.title || next.body) return;

    actions.addDiscussion({
      id: newId('d'),
      author: user.name,
      title: title.trim(),
      body: body.trim(),
      subject: subject.trim() || 'Geral',
      createdAt: new Date().toISOString(),
      replies: [],
    });
    draft.clear();
    navigation.goBack();
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={560}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TextField
          label="Título"
          placeholder="Qual é a sua dúvida ou assunto?"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => bodyRef.current?.focus()}
        />
        <TextField
          ref={bodyRef}
          label="Mensagem"
          placeholder="Explique com detalhes"
          value={body}
          onChangeText={setBody}
          error={errors.body}
          multiline
        />
        <TextField
          label="Disciplina (opcional)"
          placeholder="Ex.: Mobile"
          value={subject}
          onChangeText={setSubject}
          maxLength={24}
        />
        <View style={styles.actions}>
          <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" onPress={() => navigation.goBack()} /></View>
          <View style={{ flex: 1 }}><Button title="Publicar" onPress={handleSave} /></View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
