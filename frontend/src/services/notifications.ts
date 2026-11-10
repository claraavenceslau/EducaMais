import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

// Notificações do aparelho. Todas as funções são seguras: se o recurso não existir
// (web, emulador sem suporte), devolvem um valor neutro em vez de quebrar o app.
export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

const supported = Platform.OS !== 'web';

/** Chame uma vez ao iniciar: define como a notificação aparece com o app aberto. */
export function configureNotifications(): void {
  if (!supported) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // sem suporte: segue sem notificações
  }
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Avisos do Educa+',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function getPermission(): Promise<PermissionState> {
  if (!supported) return 'unavailable';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
  } catch {
    return 'unavailable';
  }
}

export async function requestPermission(): Promise<PermissionState> {
  if (!supported) return 'unavailable';
  try {
    await ensureChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/** Agenda um lembrete local. Devolve o id (para cancelar depois) ou undefined. */
export async function scheduleReminder(title: string, body: string, date: Date): Promise<string | undefined> {
  if (!supported || date.getTime() <= Date.now()) return undefined;
  try {
    if ((await getPermission()) !== 'granted') return undefined;
    await ensureChannel();
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  } catch {
    return undefined;
  }
}

export async function cancelReminder(id?: string): Promise<void> {
  if (!supported || !id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // já disparou ou não existe mais
  }
}

/** Dispara uma notificação daqui a 3 segundos, para a pessoa testar. */
export async function sendTestNotification(): Promise<boolean> {
  const id = await scheduleReminder(
    'Educa+',
    'Tudo certo! É assim que os avisos vão aparecer.',
    new Date(Date.now() + 3000),
  );
  return !!id;
}

/**
 * Token para push remoto. Só existe com um projeto Expo configurado e fora do Expo Go
 * (Android). Sem servidor ainda não há para quem enviar o token; fica pronto para a API.
 */
export async function getPushToken(): Promise<string | undefined> {
  if (!supported) return undefined;
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return undefined;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return undefined;
  }
}
