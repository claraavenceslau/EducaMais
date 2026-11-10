import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import type { Review } from '../types';
import { timeAgo } from '../utils/dates';
import { StarRating } from './StarRating';

export function ReviewItem({ review, now }: { review: Review; now: Date }) {
  return (
    <View style={styles.item}>
      <View style={styles.head}>
        <Text style={styles.author}>{review.authorName}</Text>
        <Text style={styles.when}>{timeAgo(review.updatedAt, now)}</Text>
      </View>
      <StarRating value={review.stars} size={14} />
      {!!review.comment && <Text style={styles.comment}>{review.comment}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, gap: 4 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  author: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  when: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  comment: { fontFamily: fonts.regular, fontSize: 13, color: colors.text, marginTop: 4, lineHeight: 19 },
});
