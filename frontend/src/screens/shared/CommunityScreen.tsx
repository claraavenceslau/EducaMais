import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { DiscussionCard } from '../../components/DiscussionCard';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { Tag } from '../../components/Tag';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts } from '../../theme';
import { confirmAction } from '../../utils/confirm';
import { sortDiscussions, type DiscussionSort } from '../../utils/selectors';

const TABS: { key: DiscussionSort; label: string }[] = [
  { key: 'recentes', label: 'Recentes' },
  { key: 'populares', label: 'Populares' },
  { key: 'disciplinas', label: 'Disciplinas' },
];

// Mesma tela para aluno ("Fórum") e professor ("Comunidade"). O professor também
// pode remover tópicos (moderação) e responder.
export function CommunityScreen() {
  const nav = useMainNavigation();
  const user = useUser();
  const { status, data, actions, reload } = useData();
  const [sort, setSort] = useState<DiscussionSort>('recentes');
  const now = new Date();
  const isTeacher = user.role === 'professor';

  const items = sortDiscussions(data.discussions, sort);

  function askRemove(id: string, title: string) {
    confirmAction('Remover discussão', `Remover "${title}" e todas as respostas?`, 'Remover', async () => {
      try { await actions.removeDiscussion(id); } catch { reload(); }
    });
  }

  return (
    <Screen fab={<Fab label="Nova discussão" onPress={() => nav.navigate('DiscussionForm')} />}>
      <Text style={styles.title} accessibilityRole="header">{isTeacher ? 'Comunidade' : 'Fórum'}</Text>
      {isTeacher && (
        <View style={styles.banner}>
          <Tag label="PROFESSOR" tone="warn" />
          <Text style={styles.bannerText}>Você pode moderar e responder tópicos.</Text>
        </View>
      )}

      <AsyncView status={status} onRetry={reload}>
        <SegmentedTabs options={TABS} value={sort} onChange={setSort} />
        <View style={styles.list}>
          {items.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="Nenhuma discussão por aqui"
              message="Comece uma conversa com a turma."
              actionLabel="Criar discussão"
              onAction={() => nav.navigate('DiscussionForm')}
            />
          ) : (
            items.map((d, i) => (
              <View key={d.id}>
                {sort === 'disciplinas' && (i === 0 || items[i - 1].subject !== d.subject) && (
                  <Text style={styles.group}>{d.subject}</Text>
                )}
                <DiscussionCard
                  discussion={d}
                  now={now}
                  onOpen={() => nav.navigate('DiscussionDetail', { discussionId: d.id })}
                  onRemove={isTeacher ? () => askRemove(d.id, d.title) : undefined}
                />
              </View>
            ))
          )}
        </View>
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 12 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  bannerText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  list: { marginTop: 16 },
  group: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
});
