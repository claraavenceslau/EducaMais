import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ReviewItem } from '../../components/ReviewItem';
import { Screen } from '../../components/Screen';
import { StarRating } from '../../components/StarRating';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts, radius } from '../../theme';
import type { Stars } from '../../types';
import { courseRating, newestFirst, reviewsOf } from '../../utils/reviews';

type Props = NativeStackScreenProps<MainStackParamList, 'CourseReviews'>;

// Visão do professor: média, distribuição por nota e todos os comentários do curso.
// O professor lê, mas não avalia nem apaga avaliações.
export function CourseReviewsScreen({ navigation, route }: Props) {
  const { data } = useData();
  const course = data.courses.find((c) => c.id === route.params.courseId);
  const now = new Date();

  if (!course) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.empty}>Este curso não existe mais.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const summary = courseRating(data.reviews, course.id);
  const list = newestFirst(reviewsOf(data.reviews, course.id));

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <Text style={styles.title} accessibilityRole="header">{course.title}</Text>

      <Card style={styles.summary}>
        <Text style={styles.avg} accessibilityLabel={summary.count ? `Nota média ${summary.average} de 5` : 'Sem avaliações'}>
          {summary.count ? summary.average.toFixed(1).replace('.', ',') : '—'}
        </Text>
        <StarRating value={summary.average} size={22} />
        <Text style={styles.count}>{summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'}</Text>

        <View style={styles.bars}>
          {([5, 4, 3, 2, 1] as Stars[]).map((n) => {
            const qty = summary.distribution[n];
            const pct = summary.count ? (qty / summary.count) * 100 : 0;
            return (
              <View key={n} style={styles.barRow} accessible accessibilityLabel={`${n} estrelas: ${qty}`}>
                <Text style={styles.barLabel}>{n}★</Text>
                <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
                <Text style={styles.barQty}>{qty}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Text style={styles.section} accessibilityRole="header">Comentários</Text>
      {list.length === 0 ? (
        <Text style={styles.empty}>Quando os alunos avaliarem, os comentários aparecerão aqui.</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {list.map((r) => <ReviewItem key={r.id} review={r} now={now} />)}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, marginBottom: 12 },
  summary: { alignItems: 'center', gap: 6 },
  avg: { fontFamily: fonts.bold, fontSize: 40, color: colors.text },
  count: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  bars: { alignSelf: 'stretch', gap: 6, marginTop: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 28, fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  track: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.background, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.primary },
  barQty: { width: 24, textAlign: 'right', fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  section: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginTop: 24, marginBottom: 10 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
});
