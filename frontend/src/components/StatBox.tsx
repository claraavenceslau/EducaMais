import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

export function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.box} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
