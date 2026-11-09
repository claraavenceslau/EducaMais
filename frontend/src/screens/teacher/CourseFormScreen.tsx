import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import type { Course, CourseLevel, CourseStatus, CourseTheme } from '../../types';
import { newId } from '../../utils/id';
import { COURSE_LEVELS, COURSE_THEMES } from '../../utils/selectors';
import { validateCourseTitle } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'CourseForm'>;

export function CourseFormScreen({ navigation, route }: Props) {
  const user = useUser();
  const { data, actions } = useData();
  const courseId = route.params?.courseId;
  const existing = courseId ? data.courses.find((c) => c.id === courseId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [theme, setTheme] = useState<CourseTheme>(existing?.theme ?? 'Mobile');
  const [level, setLevel] = useState<CourseLevel>(existing?.level ?? 'Iniciante');
  const [status, setStatus] = useState<CourseStatus>(existing?.status ?? 'rascunho');
  const [error, setError] = useState<string>();
  const descRef = useRef<TextInputInstance>(null);

  if (courseId && !existing) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.notFound}>Este curso não existe mais.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  function handleSave() {
    const message = validateCourseTitle(title);
    setError(message);
    if (message) return;

    const course: Course = {
      id: existing?.id ?? newId('c'),
      title: title.trim(),
      description: description.trim(),
      theme,
      level,
      status,
      teacher: existing?.teacher ?? user.name,
      rating: existing?.rating ?? 0,
      lessons: existing?.lessons ?? [],
      enrolled: existing?.enrolled ?? false,
      students: existing?.students ?? 0,
      contentCreated: existing?.contentCreated ?? 0,
    };
    actions.saveCourse(course);
    navigation.goBack();
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={560}>
      <TextField
        label="Título do curso"
        placeholder="Ex.: Introdução ao React Native"
        value={title}
        onChangeText={setTitle}
        error={error}
        maxLength={60}
        returnKeyType="next"
        onSubmitEditing={() => descRef.current?.focus()}
      />
      <TextField
        ref={descRef}
        label="Descrição"
        placeholder="O que o aluno vai aprender?"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Tema</Text>
      <View style={styles.chips}>
        {COURSE_THEMES.map((t) => <Chip key={t} label={t} selected={theme === t} onPress={() => setTheme(t)} />)}
      </View>

      <Text style={styles.label}>Nível</Text>
      <View style={styles.chips}>
        {COURSE_LEVELS.map((l) => <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />)}
      </View>

      <Text style={styles.label}>Situação</Text>
      <View style={styles.chips}>
        <Chip label="Rascunho" selected={status === 'rascunho'} onPress={() => setStatus('rascunho')} />
        <Chip label="Publicado" selected={status === 'publicado'} onPress={() => setStatus('publicado')} />
      </View>

      <View style={styles.actions}>
        <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" onPress={() => navigation.goBack()} /></View>
        <View style={{ flex: 1 }}><Button title="Salvar" onPress={handleSave} /></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: 8, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
