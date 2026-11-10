import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

type Props = {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string;
  onPress: () => void;
};

// Linha tocável com seta, usada em listas de configurações e no hub "Escola".
export function NavRow({ title, description, icon, badge, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${title}, ${badge}` : title}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      {!!icon && (
        <View style={styles.icon}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>
      {!!badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  description: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badge: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, minWidth: 22, alignItems: 'center' },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: '#fff' },
});
