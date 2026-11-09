import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { Button } from './Button';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={44} color={colors.textMuted} />
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!actionLabel && !!onAction && (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 16, gap: 8 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 4 },
  message: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  action: { marginTop: 8 },
});
