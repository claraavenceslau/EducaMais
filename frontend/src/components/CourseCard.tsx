import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, shadow } from '../theme';
import type { Course } from '../types';
import { courseProgress, themeBadge, themeTone } from '../utils/selectors';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';

type Props = {
  course: Course;
  onPress: () => void;
  /** Ações extras no rodapé (professor: Editar e Compartilhar). Se faltar, mostra "Ver curso". */
  footer?: ReactNode;
  /** Mostra a barra de progresso do aluno. */
  showStudentProgress?: boolean;
};

export function CourseHeader({ course }: { course: Course }) {
  const gradient = themeTone(course.theme) === 'gradient';
  const label = (
    <Text style={[styles.badge, !gradient && { color: colors.text }]}>{themeBadge(course.theme)}</Text>
  );
  return gradient ? (
    <LinearGradient colors={[colors.primary, colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      {label}
    </LinearGradient>
  ) : (
    <View style={[styles.header, { backgroundColor: colors.accent }]}>{label}</View>
  );
}

export function CourseCard({ course, onPress, footer, showStudentProgress = true }: Props) {
  const progress = courseProgress(course);
  return (
    <View style={styles.card}>
      <CourseHeader course={course} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.teacher}>{course.teacher}</Text>
        {course.rating > 0 && <Text style={styles.rating} accessibilityLabel={`Avaliação ${course.rating}`}>★ {course.rating.toFixed(1)}</Text>}

        {showStudentProgress && course.enrolled && (
          <View style={styles.progress}>
            <ProgressBar value={progress} label={`Progresso em ${course.title}`} />
            <Text style={styles.progressText}>{progress}% concluído</Text>
          </View>
        )}

        <View style={styles.footer}>
          {footer ?? (
            <Button
              title="Ver curso"
              size="sm"
              onPress={onPress}
              accessibilityLabel={`Ver o curso ${course.title}`}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  header: { height: 92, alignItems: 'center', justifyContent: 'center' },
  badge: { fontFamily: fonts.bold, fontSize: 18, color: '#fff', letterSpacing: 0.5 },
  body: { padding: 12, flex: 1 },
  title: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, minHeight: 36 },
  teacher: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rating: { fontFamily: fonts.medium, fontSize: 12, color: colors.warnText, marginTop: 4 },
  progress: { marginTop: 10, gap: 4 },
  progressText: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  footer: { marginTop: 'auto', paddingTop: 12 },
});
