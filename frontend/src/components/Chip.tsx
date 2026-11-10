import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string; disabled?: boolean };

export function Chip({ label, selected, onPress, accessibilityLabel, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled: !!disabled }}
      style={[styles.chip, selected && styles.chipSelected, disabled && { opacity: 0.45 }]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.infoBg },
  text: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  textSelected: { fontFamily: fonts.semibold, color: colors.primary },
});
