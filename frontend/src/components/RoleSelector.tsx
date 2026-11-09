import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AccountRole } from '../services/authService';
import { colors, fonts, radius } from '../theme';

type Props = {
  value?: AccountRole;
  onChange: (role: AccountRole) => void;
  error?: string;
};

const OPTIONS: { role: AccountRole; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { role: 'aluno', label: 'Sou aluno(a)', icon: 'school-outline' },
  { role: 'professor', label: 'Sou professor(a)', icon: 'easel-outline' },
];

export function RoleSelector({ value, onChange, error }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Como você vai usar o Educa+?</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {OPTIONS.map((opt) => {
          const selected = value === opt.role;
          return (
            <Pressable
              key={opt.role}
              onPress={() => onChange(opt.role)}
              accessibilityRole="radio"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Ionicons name={opt.icon} size={26} color={selected ? colors.primary : colors.textMuted} />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: 8,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#EEF0FD' },
  optionText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  optionTextSelected: { color: colors.primary, fontFamily: fonts.semibold },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.error, marginTop: 6 },
});
