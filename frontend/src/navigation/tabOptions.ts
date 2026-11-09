import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { colors, fonts, layout } from '../theme';

/**
 * Opções comuns às abas do aluno e do professor.
 * Até 767 px (celular) a barra fica embaixo; a partir de 1025 px (desktop), na lateral,
 * como no protótipo. Entre os dois valores, mantém a barra inferior.
 */
export function tabScreenOptions(width: number): BottomTabNavigationOptions {
  const wide = width >= layout.wideMin;
  return {
    headerShown: false,
    tabBarPosition: wide ? 'left' : 'bottom',
    tabBarVariant: wide ? 'material' : undefined,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
    tabBarStyle: { backgroundColor: colors.surface, borderColor: colors.border },
  };
}
