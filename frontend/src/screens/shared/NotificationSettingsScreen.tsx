import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { ToggleRow } from '../../components/ToggleRow';
import { useData } from '../../context/DataContext';
import {
  getPermission, getPushToken, requestPermission, sendTestNotification, type PermissionState,
} from '../../services/notifications';
import { colors, fonts, radius } from '../../theme';

const PERMISSION_TEXT: Record<PermissionState, string> = {
  granted: 'Notificações ativadas neste aparelho.',
  denied: 'As notificações estão bloqueadas. Ative-as nas configurações do aparelho para recebê-las.',
  undetermined: 'Ative as notificações para receber avisos, mesmo com o app fechado.',
  unavailable: 'Este ambiente (por exemplo, o navegador) não oferece notificações.',
};

export function NotificationSettingsScreen() {
  const { data, actions } = useData();
  const prefs = data.preferences.notifications;
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [pushReady, setPushReady] = useState<boolean>();

  const refresh = useCallback(async () => setPermission(await getPermission()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleEnable() {
    if (busy) return;
    setBusy(true);
    const state = await requestPermission();
    setPermission(state);
    if (state === 'granted') setPushReady(!!(await getPushToken()));
    setBusy(false);
  }

  async function handleTest() {
    setMessage(undefined);
    const ok = await sendTestNotification();
    setMessage(ok ? 'Enviada! Ela chega em alguns segundos.' : 'Não foi possível enviar. Verifique se as notificações estão ativadas.');
  }

  const granted = permission === 'granted';

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <Card style={{ gap: 12 }}>
        <Text style={styles.status} accessibilityLiveRegion="polite">{PERMISSION_TEXT[permission]}</Text>
        {!granted && permission !== 'unavailable' && permission !== 'denied' && (
          <Button title="Ativar notificações" onPress={handleEnable} loading={busy} />
        )}
        {granted && <Button title="Enviar notificação de teste" variant="secondary" onPress={handleTest} />}
        {!!message && <Text style={styles.note} accessibilityLiveRegion="polite">{message}</Text>}
        {granted && pushReady === false && (
          <Text style={styles.note}>
            Os avisos enviados pela escola (push) dependem de um servidor e de um projeto configurado. Por enquanto, valem os lembretes locais.
          </Text>
        )}
      </Card>

      <SectionHeader title="O que você quer receber" />
      <Card>
        <ToggleRow title="Avisos da escola" description="Comunicados e urgências" value={prefs.notices} onChange={(v) => actions.setPreferences({ notifications: { notices: v } })} />
        <ToggleRow title="Andamento das demandas" description="Quando o status da sua demanda mudar" value={prefs.demands} onChange={(v) => actions.setPreferences({ notifications: { demands: v } })} />
        <ToggleRow title="Lembretes de atendimento" description="Uma hora antes do horário marcado" value={prefs.appointments} onChange={(v) => actions.setPreferences({ notifications: { appointments: v } })} />
        <ToggleRow title="Prazos de tarefas" description="Aviso perto da data de entrega" value={prefs.tasks} onChange={(v) => actions.setPreferences({ notifications: { tasks: v } })} />
      </Card>
      <View style={{ height: 8 }} />
      <Text style={styles.footnote}>
        Suas escolhas ficam salvas neste aparelho. Os lembretes de atendimento já funcionam; os demais tipos passam a valer quando a escola enviar avisos pelo servidor.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, backgroundColor: colors.background, borderRadius: radius.sm, padding: 8 },
  footnote: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
