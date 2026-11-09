import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, layout } from '../theme';

type Props = {
  children: ReactNode;
  /** Botão flutuante, desenhado no canto inferior direito. */
  fab?: ReactNode;
  maxWidth?: number;
  /** Telas de formulário precisam ignorar a borda de cima, pois o cabeçalho nativo já cuida dela. */
  edges?: Edge[];
};

// Estrutura comum das telas logadas: área segura, rolagem e largura máxima centralizada
// (em telas largas o conteúdo não se estica, como no protótipo de 1025 px ou mais).
export function Screen({ children, fab, maxWidth = layout.contentMax, edges = ['top', 'left', 'right'] }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { maxWidth }]}>{children}</View>
      </ScrollView>
      {fab}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 96 },
  content: { width: '100%', alignSelf: 'center' },
});
