import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import type { Demand } from '../types';
import { CATEGORIES, categoryLabel, STATUS_LABEL, STATUS_TONE } from '../utils/demands';
import { timeAgo } from '../utils/dates';
import { Card } from './Card';
import { Tag } from './Tag';

export function DemandCard({ demand, now, onOpen }: { demand: Demand; now: Date; onOpen: () => void }) {
  const icon = (CATEGORIES.find((c) => c.key === demand.category)?.icon ?? 'ellipsis-horizontal-circle-outline') as keyof typeof Ionicons.glyphMap;
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Demanda ${demand.protocol}: ${demand.title}. ${STATUS_LABEL[demand.status]}`}
    >
      <Card style={styles.card}>
        <View style={styles.icon}><Ionicons name={icon} size={22} color={colors.primary} /></View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title} numberOfLines={2}>{demand.title}</Text>
          <Text style={styles.meta}>{categoryLabel(demand.category)} · #{demand.protocol} · {timeAgo(demand.createdAt, now)}</Text>
          <View style={{ marginTop: 4 }}>
            <Tag label={STATUS_LABEL[demand.status]} tone={STATUS_TONE[demand.status]} />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
