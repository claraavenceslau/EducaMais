import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { LoadStatus } from '../context/DataContext';
import { colors, fonts } from '../theme';
import { EmptyState } from './EmptyState';

type Props = { status: LoadStatus; onRetry: () => void; children: ReactNode };

// Mostra carregamento, erro (com "Tentar novamente") ou o conteúdo da tela.
// O estado vazio de cada lista é tratado na própria tela, com <EmptyState>.
export function AsyncView({ status, onRetry, children }: Props) {
  if (status === 'loading') {
    return (
      <View style={styles.center} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.text}>Carregando...</Text>
      </View>
    );
  }
  if (status === 'error') {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Não foi possível carregar"
        message="Verifique sua conexão e tente novamente."
        actionLabel="Tentar novamente"
        onAction={onRetry}
      />
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  text: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
});
