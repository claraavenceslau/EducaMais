import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { initials } from '../utils/selectors';

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bold, color: colors.primary },
});
