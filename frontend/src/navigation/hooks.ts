import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types';

/**
 * Navegação das telas logadas. Mesmo as telas que ficam dentro das abas usam a pilha
 * principal, o que permite abrir detalhes por cima das abas e trocar de aba com
 * navigate('StudentTabs', { screen: 'Tasks' }).
 */
export const useMainNavigation = () => useNavigation<NativeStackNavigationProp<MainStackParamList>>();
