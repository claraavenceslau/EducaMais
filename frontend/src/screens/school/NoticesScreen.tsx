import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useData } from '../../context/DataContext';
import { colors, fonts } from '../../theme';
import { timeAgo } from '../../utils/dates';
import { filterNotices, NOTICE_LABEL, NOTICE_TONE, unreadCount, type NoticeFilter } from '../../utils/notices';

const FILTERS: { key: NoticeFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'urgente', label: 'Urgentes' },
  { key: 'evento', label: 'Eventos' },
  { key: 'pedagogico', label: 'Pedagógico' },
  { key: 'geral', label: 'Geral' },
];

// Mural de avisos. Tocar em um aviso abre o texto completo e o marca como lido.
export function NoticesScreen() {
  const { status, data, actions, reload } = useData();
  const [filter, setFilter] = useState<NoticeFilter>('todos');
  const [openId, setOpenId] = useState<string>();
  const now = new Date();
  const items = filterNotices(data.notices, filter);
  const unread = unreadCount(data.notices);

  function toggle(id: string, read: boolean) {
    setOpenId((current) => (current === id ? undefined : id));
    if (!read) actions.readNotice(id);
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <AsyncView status={status} onRetry={reload}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />)}
        </ScrollView>

        {unread > 0 && (
          <View style={styles.readAll}>
            <Button title={`Marcar ${unread} como lidos`} size="sm" variant="secondary" onPress={actions.readAllNotices} />
          </View>
        )}

        <View style={styles.list}>
          {items.length === 0 ? (
            <EmptyState icon="notifications-off-outline" title="Nenhum aviso" message="Quando a escola publicar algo, aparecerá aqui." />
          ) : (
            items.map((n) => {
              const open = openId === n.id;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => toggle(n.id, n.read)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={`${n.read ? '' : 'Novo. '}${NOTICE_LABEL[n.category]}. ${n.title}`}
                >
                  <Card style={{ gap: 6 }}>
                    <View style={styles.top}>
                      <Tag label={NOTICE_LABEL[n.category]} tone={NOTICE_TONE[n.category]} />
                      {!n.read && <Text style={styles.new}>NOVO</Text>}
                      <Text style={styles.when}>{timeAgo(n.publishedAt, now)}</Text>
                    </View>
                    <Text style={[styles.title, n.read && { fontFamily: fonts.medium }]}>{n.title}</Text>
                    <Text style={styles.author}>{n.author}</Text>
                    {open ? <Text style={styles.body}>{n.body}</Text> : <Text style={styles.preview} numberOfLines={2}>{n.body}</Text>}
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 8, paddingBottom: 4 },
  readAll: { alignSelf: 'flex-start', marginTop: 10 },
  list: { marginTop: 14, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  new: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary },
  when: { marginLeft: 'auto', fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  author: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 21, marginTop: 4 },
  preview: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
