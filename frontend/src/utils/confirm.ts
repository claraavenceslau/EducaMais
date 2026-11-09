import { Alert, Platform } from 'react-native';

/**
 * Pede confirmação antes de uma ação destrutiva.
 * No celular usa o alerta nativo; na web, onde Alert.alert não faz nada, usa window.confirm.
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === 'web') {
    const ask = (globalThis as { confirm?: (text: string) => boolean }).confirm;
    if (ask && ask(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
