import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { Button } from '../../components/Button';
import { CourseHeader } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { RatingText } from '../../components/StarRating';
import { Tag } from '../../components/Tag';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts, radius, shadow } from '../../theme';
import type { Course } from '../../types';
import { courseRating } from '../../utils/reviews';

function ReviewsLink({ course, reviews, onOpen }: { course: Course; reviews: import('../../types').Review[]; onOpen: () => void }) {
  const r = courseRating(reviews, course.id);
  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Ver avaliações de ${course.title}`} style={styles.reviews}>
      <RatingText average={r.average} count={r.count} />
      <Text style={styles.reviewsLink}>Ver avaliações</Text>
    </Pressable>
  );
}

export function MyCoursesScreen() {
  const nav = useMainNavigation();
  const { status, data, reload } = useData();
  const courses = data.courses;

  async function handleShare(course: Course) {
    try {
      await Share.share({ message: `Conheça o curso "${course.title}" no Educa+.` });
    } catch {
      // Compartilhar é opcional: se o sistema recusar, nada de grave acontece.
    }
  }

  return (
    <Screen fab={status === 'ready' ? <Fab label="Novo curso" onPress={() => nav.navigate('CourseForm')} /> : undefined}>
      <Text style={styles.title} accessibilityRole="header">Meus cursos</Text>
      <AsyncView status={status} onRetry={reload}>
        <Text style={styles.count}>
          {courses.length} {courses.length === 1 ? 'curso criado' : 'cursos criados'}
        </Text>

        {courses.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="Você ainda não criou cursos"
            message="Crie o primeiro para começar a publicar conteúdo."
            actionLabel="Novo curso"
            onAction={() => nav.navigate('CourseForm')}
          />
        ) : (
          <View style={styles.list}>
            {courses.map((c) => (
              <View key={c.id} style={styles.card}>
                <CourseHeader course={c} />
                <View style={styles.body}>
                  <View style={styles.row}>
                    <Text style={styles.name} numberOfLines={2}>{c.title}</Text>
                    <Tag label={c.status === 'publicado' ? 'Publicado' : 'Rascunho'} tone={c.status === 'publicado' ? 'success' : 'warn'} />
                  </View>
                  <Text style={styles.meta}>{c.students} alunos · {c.contentCreated}% do conteúdo criado</Text>
                  <ReviewsLink course={c} onOpen={() => nav.navigate('CourseReviews', { courseId: c.id })} reviews={data.reviews} />
                  <View style={styles.actions}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Editar"
                        size="sm"
                        variant="secondary"
                        accessibilityLabel={`Editar o curso ${c.title}`}
                        onPress={() => nav.navigate('CourseForm', { courseId: c.id })}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Compartilhar"
                        size="sm"
                        accessibilityLabel={`Compartilhar o curso ${c.title}`}
                        onPress={() => handleShare(c)}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  list: { gap: 14 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  body: { padding: 14, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  name: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  reviews: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  reviewsLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
