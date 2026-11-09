import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Tone = 'info' | 'success' | 'warn' | 'neutral';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.infoBg, fg: colors.primary },
  success: { bg: colors.successBg, fg: colors.successText },
  warn: { bg: colors.warnBg, fg: colors.warnText },
  neutral: { bg: colors.background, fg: colors.textMuted },
};

export function Tag({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  text: { fontFamily: fonts.semibold, fontSize: 11 },
});
