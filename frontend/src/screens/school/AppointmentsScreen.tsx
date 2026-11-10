import { StyleSheet, Text, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { Tag } from '../../components/Tag';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { cancelReminder } from '../../services/notifications';
import { colors, fonts } from '../../theme';
import type { Appointment } from '../../types';
import { history, serviceLabel, upcoming } from '../../utils/appointments';
import { confirmAction } from '../../utils/confirm';
import { longDate } from '../../utils/dates';

export function AppointmentsScreen() {
  const nav = useMainNavigation();
  const { status, data, actions, reload } = useData();
  const now = new Date();
  const next = upcoming(data.appointments, now);
  const past = history(data.appointments, now);

  function askCancel(a: Appointment) {
    confirmAction(
      'Cancelar atendimento',
      `${serviceLabel(a.service)}, ${longDate(a.date)} às ${a.time}.`,
      'Cancelar atendimento',
      () => {
        cancelReminder(a.reminderId);
        actions.cancelAppointment(a.id);
      },
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720} fab={status === 'ready' ? <Fab label="Agendar atendimento" onPress={() => nav.navigate('AppointmentForm')} /> : undefined}>
      <AsyncView status={status} onRetry={reload}>
        <SectionHeader title="Próximos" />
        {next.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Nenhum atendimento marcado"
            message="Escolha o setor, o dia e o horário que preferir."
            actionLabel="Agendar"
            onAction={() => nav.navigate('AppointmentForm')}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {next.map((a) => (
              <Card key={a.id} style={{ gap: 6 }}>
                <Text style={styles.title}>{serviceLabel(a.service)}</Text>
                <Text style={styles.when}>{longDate(a.date)} às {a.time}</Text>
                <Text style={styles.reason}>{a.reason}</Text>
                <View style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                  <Button title="Cancelar" size="sm" variant="danger" accessibilityLabel={`Cancelar atendimento de ${serviceLabel(a.service)}`} onPress={() => askCancel(a)} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {past.length > 0 && (
          <>
            <SectionHeader title="Histórico" />
            <View style={{ gap: 10 }}>
              {past.map((a) => (
                <Card key={a.id} style={{ gap: 4, opacity: 0.85 }}>
                  <View style={styles.top}>
                    <Text style={styles.title}>{serviceLabel(a.service)}</Text>
                    <Tag label={a.status === 'cancelado' ? 'Cancelado' : 'Realizado'} tone="neutral" />
                  </View>
                  <Text style={styles.when}>{longDate(a.date)} às {a.time}</Text>
                </Card>
              ))}
            </View>
          </>
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  when: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  reason: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
