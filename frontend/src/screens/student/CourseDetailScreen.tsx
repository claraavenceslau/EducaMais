import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { ReviewSection } from '../../components/ReviewSection';
import { RatingText } from '../../components/StarRating';
import { Card } from '../../components/Card';
import { CourseHeader } from '../../components/CourseCard';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts, radius } from '../../theme';
import { courseRating } from '../../utils/reviews';
import { courseProgress } from '../../utils/selectors';

type Props = NativeStackScreenProps<MainStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ navigation, route }: Props) {
  const { data, actions } = useData();
  const course = data.courses.find((c) => c.id === route.params.courseId);

  if (!course) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.notFound}>Este curso não está mais disponível.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const progress = courseProgress(course);
  const rating = courseRating(data.reviews, course.id);
  const doneCount = course.lessons.filter((l) => l.done).length;

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <View style={styles.hero}>
        <CourseHeader course={course} />
      </View>

      <Text style={styles.title} accessibilityRole="header">{course.title}</Text>
      <Text style={styles.teacher}>{course.teacher}</Text>
      <View style={styles.rating}><RatingText average={rating.average} count={rating.count} /></View>
      <View style={styles.tags}>
        <Tag label={course.theme} />
        <Tag label={course.level} tone="neutral" />
      </View>
      <Text style={styles.description}>{course.description}</Text>

      {course.enrolled ? (
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Seu progresso</Text>
          <ProgressBar value={progress} label={`Progresso em ${course.title}`} />
          <Text style={styles.progressText}>{doneCount} de {course.lessons.length} aulas concluídas ({progress}%)</Text>
        </Card>
      ) : (
        <View style={styles.enroll}>
          <Button title="Inscrever-se no curso" onPress={() => actions.enroll(course.id)} />
        </View>
      )}

      <Text style={styles.sectionTitle} accessibilityRole="header">Aulas</Text>
      {course.lessons.length === 0 ? (
        <Text style={styles.description}>Este curso ainda não tem aulas publicadas.</Text>
      ) : (
        course.lessons.map((lesson, index) => (
          <Pressable
            key={lesson.id}
            disabled={!course.enrolled}
            onPress={() => actions.toggleLesson(course.id, lesson.id)}
            accessibilityRole="checkbox"
            accessibilityLabel={`Aula ${index + 1}: ${lesson.title}, ${lesson.minutes} minutos`}
            accessibilityHint={course.enrolled ? 'Toque para marcar ou desmarcar como concluída' : 'Inscreva-se para acompanhar as aulas'}
            accessibilityState={{ checked: lesson.done, disabled: !course.enrolled }}
            style={[styles.lesson, !course.enrolled && { opacity: 0.7 }]}
          >
            <View style={[styles.check, lesson.done && styles.checkDone]}>
              {lesson.done && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.lessonTitle, lesson.done && styles.lessonDone]}>{index + 1}. {lesson.title}</Text>
              <Text style={styles.lessonMeta}>{lesson.minutes} min</Text>
            </View>
          </Pressable>
        ))
      )}
      {!course.enrolled && course.lessons.length > 0 && (
        <Text style={styles.hint}>Inscreva-se para marcar aulas como concluídas.</Text>
      )}

      <ReviewSection course={course} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginBottom: 16 },
  hero: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  rating: { marginTop: 4 },
  teacher: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },
  tags: { flexDirection: 'row', gap: 8, marginTop: 10 },
  description: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, marginTop: 12, lineHeight: 21 },
  progressCard: { marginTop: 16, gap: 8 },
  progressTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  progressText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  enroll: { marginTop: 16 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginTop: 24, marginBottom: 10 },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.successFill, borderColor: colors.successFill },
  lessonTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  lessonDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  lessonMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
