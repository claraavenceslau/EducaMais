import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import type { Discussion } from '../types';
import { timeAgo } from '../utils/dates';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';

type Props = {
  discussion: Discussion;
  now: Date;
  onOpen: () => void;
  /** Moderação do professor: remover o tópico. */
  onRemove?: () => void;
};

export function DiscussionCard({ discussion, now, onOpen, onRemove }: Props) {
  const count = discussion.replies.length;
  return (
    <Card style={styles.card}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Abrir a discussão ${discussion.title}, ${count} ${count === 1 ? 'resposta' : 'respostas'}`}
        style={styles.row}
      >
        <Avatar name={discussion.author} />
        <View style={styles.body}>
          <Text style={styles.meta}>{discussion.author} · {timeAgo(discussion.createdAt, now)} · {discussion.subject}</Text>
          <Text style={styles.title}>{discussion.title}</Text>
          <Text style={styles.snippet} numberOfLines={2}>{discussion.body}</Text>
          <Text style={styles.count}>{count} {count === 1 ? 'resposta' : 'respostas'}</Text>
        </View>
      </Pressable>
      {!!onRemove && (
        <View style={styles.actions}>
          <Button title="Remover" variant="danger" size="sm" onPress={onRemove} accessibilityLabel={`Remover a discussão ${discussion.title}`} />
          <Button title="Responder" variant="secondary" size="sm" onPress={onOpen} accessibilityLabel={`Responder a discussão ${discussion.title}`} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  body: { flex: 1 },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginTop: 2 },
  snippet: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  count: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.background },
});
