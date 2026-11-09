import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
};

// Abas em forma de pílulas (Todas / Pendentes / Concluídas, Explorar / Meus cursos...).
export function SegmentedTabs<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="tab"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingHorizontal: 8 },
  itemSelected: { backgroundColor: colors.infoBg },
  text: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  textSelected: { fontFamily: fonts.semibold, color: colors.primary },
});
