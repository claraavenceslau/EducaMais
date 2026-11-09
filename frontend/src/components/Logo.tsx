import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.violet]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      accessibilityRole="image"
      accessibilityLabel="Logotipo Educa+"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: size * 0.36 }}>E+</Text>
    </LinearGradient>
  );
}