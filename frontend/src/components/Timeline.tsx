import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import type { DemandEvent } from '../types';
import { STATUS_LABEL } from '../utils/demands';

const formatter = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Linha do tempo de uma demanda. O último evento é o status atual e fica destacado.
export function Timeline({ events }: { events: DemandEvent[] }) {
  return (
    <View accessibilityLabel="Linha do tempo da demanda">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <View key={e.id} style={styles.row} accessible accessibilityLabel={`${STATUS_LABEL[e.status]}. ${e.text}. ${formatter(e.at)}`}>
            <View style={styles.rail}>
              <View style={[styles.dot, last && styles.dotCurrent]} />
              {!last && <View style={styles.line} />}
            </View>
            <View style={styles.body}>
              <Text style={[styles.status, last && { color: colors.primary }]}>{STATUS_LABEL[e.status]}</Text>
              <Text style={styles.text}>{e.text}</Text>
              <Text style={styles.date}>{formatter(e.at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginTop: 4 },
  dotCurrent: { backgroundColor: colors.primary },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  body: { flex: 1, paddingBottom: 16 },
  status: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 13, color: colors.text, marginTop: 2 },
  date: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
