import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AsyncView } from '../../components/AsyncView';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { useData } from '../../context/DataContext';
import { colors, fonts, radius } from '../../theme';

type Tab = 'conquistas' | 'ranking';

// Somente leitura. O protótipo marca gamificação completa (níveis, trilhas, notificações)
// como fora do MVP; aqui só aparecem os estados visuais: conquistada e bloqueada.
export function GamificationScreen() {
  const { status, data, reload } = useData();
  const [tab, setTab] = useState<Tab>('conquistas');
  const { progress, achievements, ranking } = data;
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <AsyncView status={status} onRetry={reload}>
        <LinearGradient colors={[colors.primary, colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Nível {progress.level}</Text>
              <Text style={styles.heroValue}>{progress.xp} XP</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.heroLabel}>Sequência</Text>
              <Text style={styles.heroValue}>{progress.streak} d</Text>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <ProgressBar value={(progress.xp / progress.xpNext) * 100} label="Progresso para o próximo nível" color="#fff" />
          </View>
          <Text style={styles.heroHint}>{progress.xp} / {progress.xpNext} XP para o nível {progress.level + 1}</Text>
        </LinearGradient>

        <View style={{ marginTop: 16 }}>
          <SegmentedTabs
            options={[{ key: 'conquistas', label: 'Conquistas' }, { key: 'ranking', label: 'Ranking' }]}
            value={tab}
            onChange={setTab}
          />
        </View>

        {tab === 'conquistas' ? (
          <>
            <Text style={styles.count}>{unlocked} de {achievements.length} conquistas</Text>
            <View style={styles.grid}>
              {achievements.map((a) => (
                <View
                  key={a.id}
                  style={styles.cell}
                  accessible
                  accessibilityLabel={`${a.title}. ${a.description}. ${a.unlocked ? 'Conquistada' : 'Bloqueada'}`}
                >
                  <Card style={[styles.badge, !a.unlocked && styles.badgeLocked]}>
                    <View style={[styles.icon, a.unlocked ? styles.iconOn : styles.iconOff]}>
                      <Ionicons
                        name={a.unlocked ? 'trophy' : 'lock-closed'}
                        size={22}
                        color={a.unlocked ? colors.warnText : colors.textMuted}
                      />
                    </View>
                    <Text style={styles.badgeTitle}>{a.title}</Text>
                    <Text style={styles.badgeDesc}>{a.description}</Text>
                  </Card>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={{ marginTop: 16, gap: 8 }}>
            {ranking.map((r, i) => (
              <Card key={r.name} style={styles.rank}>
                <Text style={styles.rankPos}>{i + 1}º</Text>
                <Text style={styles.rankName}>{r.name}</Text>
                <Text style={styles.rankPts}>{r.points} pts</Text>
              </Card>
            ))}
          </View>
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: 20 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heroLabel: { fontFamily: fonts.medium, fontSize: 12, color: '#fff' },
  heroValue: { fontFamily: fonts.bold, fontSize: 28, color: '#fff' },
  heroHint: { fontFamily: fonts.regular, fontSize: 12, color: '#fff', marginTop: 8 },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginHorizontal: -5 },
  cell: { width: '50%', padding: 5 },
  badge: { alignItems: 'center', minHeight: 150, gap: 4 },
  badgeLocked: { opacity: 0.7 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconOn: { backgroundColor: colors.warnBg },
  iconOff: { backgroundColor: colors.background },
  badgeTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, textAlign: 'center' },
  badgeDesc: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rankPos: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, width: 32 },
  rankName: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  rankPts: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
});
