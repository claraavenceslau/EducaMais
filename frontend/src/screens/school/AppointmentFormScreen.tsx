import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { scheduleReminder } from '../../services/notifications';
import { colors, fonts, radius } from '../../theme';
import type { Appointment, ServiceKey } from '../../types';
import { bookableDays, reminderDate, serviceLabel, SERVICES, slotsForDay, validateBooking } from '../../utils/appointments';
import { dayChipLabel, longDate } from '../../utils/dates';
import { newId } from '../../utils/id';
import { validateAppointmentReason } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'AppointmentForm'>;

// Escolha em ordem: setor, dia, horário e motivo. Horários que já passaram, estão
// ocupados ou já são seus aparecem desabilitados, com o motivo no rótulo.
export function AppointmentFormScreen({ navigation }: Props) {
  const { data, actions } = useData();
  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => bookableDays(now), [now]);

  const [service, setService] = useState<ServiceKey>();
  const [date, setDate] = useState<string>();
  const [time, setTime] = useState<string>();
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const slots = service && date ? slotsForDay(date, service, data.appointments, now) : [];

  async function handleConfirm() {
    if (saving) return;
    const rError = validateAppointmentReason(reason);
    setReasonError(rError);
    const bookingError = validateBooking(date, time, service, data.appointments, new Date());
    setFormError(bookingError);
    if (rError || bookingError || !service || !date || !time) return;

    setSaving(true);
    const appointment: Appointment = {
      id: newId('ap'),
      service,
      date,
      time,
      reason: reason.trim(),
      status: 'agendado',
      createdAt: new Date().toISOString(),
    };
    if (data.preferences.notifications.appointments) {
      appointment.reminderId = await scheduleReminder(
        'Atendimento em 1 hora',
        `${serviceLabel(service)}, hoje às ${time}.`,
        reminderDate(appointment),
      );
    }
    actions.saveAppointment(appointment);
    setSaving(false);
    navigation.goBack();
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={560}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.label}>1. Tipo de atendimento</Text>
        <View style={styles.services}>
          {SERVICES.map((s) => {
            const selected = service === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => { setService(s.key); setTime(undefined); }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${s.label}. ${s.description}`}
                style={[styles.service, selected && styles.serviceOn]}
              >
                <Text style={[styles.serviceTitle, selected && { color: colors.primary }]}>{s.label}</Text>
                <Text style={styles.serviceDesc}>{s.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>2. Dia</Text>
        <View style={styles.chips}>
          {days.map((d) => (
            <Chip key={d} label={dayChipLabel(d)} selected={date === d} accessibilityLabel={longDate(d)} onPress={() => { setDate(d); setTime(undefined); }} />
          ))}
        </View>

        <Text style={styles.label}>3. Horário</Text>
        {!service || !date ? (
          <Text style={styles.hint}>Escolha o tipo de atendimento e o dia para ver os horários.</Text>
        ) : (
          <View style={styles.chips}>
            {slots.map((s) => (
              <Chip
                key={s.time}
                label={s.time}
                selected={time === s.time}
                disabled={!s.available}
                accessibilityLabel={s.available ? s.time : `${s.time}, indisponível`}
                onPress={() => setTime(s.time)}
              />
            ))}
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <TextField
            label="Motivo"
            placeholder="Ex.: pedir declaração de matrícula"
            value={reason}
            onChangeText={(v) => { setReason(v); setReasonError(undefined); }}
            error={reasonError}
            multiline
            maxLength={200}
          />
        </View>

        {!!formError && (
          <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" onPress={() => navigation.goBack()} /></View>
          <View style={{ flex: 1 }}><Button title="Confirmar" onPress={handleConfirm} loading={saving} /></View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: 8, marginBottom: 8 },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  services: { gap: 8 },
  service: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, padding: 12, minHeight: 56, justifyContent: 'center' },
  serviceOn: { borderColor: colors.primary, backgroundColor: colors.infoBg },
  serviceTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  serviceDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  formError: { backgroundColor: colors.errorBg, borderRadius: 8, padding: 10, marginBottom: 12 },
  formErrorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
