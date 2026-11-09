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
import type { Course, CourseLevel, CourseStatus, CourseTheme, Lesson } from '../../types';
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
  const [lessons, setLessons] = useState<Lesson[]>(existing?.lessons ?? []);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonMinutes, setLessonMinutes] = useState('10');
  const [lessonError, setLessonError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const descRef = useRef<TextInputInstance>(null);

  if (courseId && !existing) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.notFound}>Este curso não existe mais.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  function addLesson() {
    const minutes = Number(lessonMinutes);
    if (!lessonTitle.trim()) {
      setLessonError('Informe o título da aula.');
      return;
    }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
      setLessonError('A duração deve ser de 1 a 600 minutos.');
      return;
    }
    setLessons((current) => [...current, { id: `new-${Date.now()}-${current.length}`, title: lessonTitle.trim(), minutes, done: false }]);
    setLessonTitle('');
    setLessonMinutes('10');
    setLessonError(undefined);
  }

  async function handleSave() {
    if (saving) return;
    const message = validateCourseTitle(title);
    setError(message);
    if (message) return;
    if (status === 'publicado' && lessons.length === 0) {
      setLessonError('Adicione ao menos uma aula para publicar este curso.');
      return;
    }
    setSaveError(undefined);

    const course: Course = {
      id: existing?.id ?? '',
      title: title.trim(),
      description: description.trim(),
      theme,
      level,
      status,
      teacher: existing?.teacher ?? user.name,
      rating: existing?.rating ?? 0,
      lessons,
      enrolled: existing?.enrolled ?? false,
      students: existing?.students ?? 0,
      contentCreated: existing?.contentCreated ?? 0,
    };
    setSaving(true);
    try {
      await actions.saveCourse(course);
      navigation.goBack();
    } catch {
      setSaveError('O curso não foi salvo. Verifique se a API está conectada e tente novamente.');
    } finally {
      setSaving(false);
    }
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

      <Text style={styles.label}>Aulas do curso</Text>
      {lessons.map((lesson, index) => (
        <View key={lesson.id} style={styles.lessonRow}>
          <Text style={styles.lessonText}>{index + 1}. {lesson.title} · {lesson.minutes} min</Text>
          <Button
            title="Remover"
            size="sm"
            variant="secondary"
            accessibilityLabel={`Remover aula ${lesson.title}`}
            onPress={() => setLessons((current) => current.filter((item) => item.id !== lesson.id))}
          />
        </View>
      ))}
      <View style={styles.lessonEntry}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Título da aula"
            placeholder="Ex.: Introdução ao tema"
            value={lessonTitle}
            onChangeText={setLessonTitle}
            maxLength={120}
          />
        </View>
        <View style={styles.minutesField}>
          <TextField
            label="Minutos"
            value={lessonMinutes}
            onChangeText={setLessonMinutes}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      </View>
      {!!lessonError && <Text style={styles.errorText} accessibilityRole="alert">{lessonError}</Text>}
      <Button title="Adicionar aula" variant="secondary" onPress={addLesson} />

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

      {!!saveError && <Text style={styles.errorText} accessibilityRole="alert">{saveError}</Text>}
      <View style={styles.actions}>
        <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" disabled={saving} onPress={() => navigation.goBack()} /></View>
        <View style={{ flex: 1 }}><Button title="Salvar" loading={saving} onPress={handleSave} /></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: 8, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  lessonText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  lessonEntry: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  minutesField: { width: 92 },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, marginBottom: 10 },
});
