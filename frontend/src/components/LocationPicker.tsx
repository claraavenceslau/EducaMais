import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { getCurrentLocation } from '../services/location';
import { colors, fonts, radius } from '../theme';
import type { DemandLocation } from '../types';
import { formatCoords, hasCoords, manualLocation, mapsUrl } from '../utils/location';
import { validateManualLocation } from '../utils/validation';
import { Button } from './Button';
import { TextField } from './TextField';

type Props = {
  value?: DemandLocation;
  onChange: (next?: DemandLocation) => void;
  /** Pede a localização ao abrir (só quando a pessoa ligou isso em Privacidade). */
  autoLocate?: boolean;
};

// Local da demanda, sempre opcional e sempre por escolha da pessoa:
// 1) "Usar minha localização" explica o motivo e pede permissão só nesse momento;
// 2) se a permissão for negada (ou der erro), o campo de endereço manual continua disponível.
export function LocationPicker({ value, onChange, autoLocate }: Props) {
  const [manual, setManual] = useState(value?.source === 'manual' ? value.description : '');
  const [manualOpen, setManualOpen] = useState(value?.source === 'manual');
  const [manualError, setManualError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string>();

  async function useGps() {
    if (loading) return;
    setLoading(true);
    setNotice(undefined);
    const result = await getCurrentLocation();
    setLoading(false);
    if (result.status === 'ok') {
      setManualOpen(false);
      onChange(result.location);
    } else if (result.status === 'denied') {
      setNotice(
        result.canAskAgain
          ? 'Sem permissão de localização. Você pode tentar de novo ou informar o endereço.'
          : 'A permissão está bloqueada nas configurações do aparelho. Informe o endereço abaixo.',
      );
      setManualOpen(true);
    } else {
      setNotice('Não foi possível obter a localização agora. Informe o endereço abaixo.');
      setManualOpen(true);
    }
  }

  useEffect(() => {
    if (autoLocate && !value) useGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onManualChange(text: string) {
    setManual(text);
    setManualError(undefined);
    if (!text.trim()) onChange(undefined);
  }

  function onManualBlur() {
    if (!manual.trim()) return;
    const error = validateManualLocation(manual);
    setManualError(error);
    if (!error) onChange(manualLocation(manual));
  }

  function clear() {
    setManual('');
    setManualOpen(false);
    setNotice(undefined);
    onChange(undefined);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Local do problema (opcional)</Text>
      <Text style={styles.hint}>
        Usamos sua localização apenas para registrar o local desta demanda, só quando você tocar no botão abaixo.
      </Text>

      {value?.source === 'gps' && (
        <View style={styles.found} accessibilityLiveRegion="polite">
          <Text style={styles.foundTitle}>Localização registrada</Text>
          <Text style={styles.foundText}>{value.description}</Text>
          {hasCoords(value) && <Text style={styles.coords}>{formatCoords(value.latitude, value.longitude)}</Text>}
          {hasCoords(value) && (
            <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(mapsUrl(value.latitude, value.longitude))}>
              Ver no mapa
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttons}>
        <View style={{ flex: 1 }}>
          <Button
            title={value?.source === 'gps' ? 'Atualizar localização' : 'Usar minha localização'}
            size="sm"
            variant="secondary"
            loading={loading}
            onPress={useGps}
          />
        </View>
        {!manualOpen && (
          <View style={{ flex: 1 }}>
            <Button title="Informar endereço" size="sm" variant="secondary" onPress={() => setManualOpen(true)} />
          </View>
        )}
      </View>

      {!!notice && <Text style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">{notice}</Text>}

      {manualOpen && (
        <View style={{ marginTop: 12 }}>
          <TextField
            label="Endereço ou ponto de referência"
            placeholder="Ex.: Corredor B, ao lado da biblioteca"
            value={manual}
            onChangeText={onManualChange}
            onBlur={onManualBlur}
            error={manualError}
            maxLength={160}
          />
        </View>
      )}

      {(value || manualOpen) && (
        <Text style={styles.link} accessibilityRole="button" onPress={clear}>Remover local</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 10 },
  buttons: { flexDirection: 'row', gap: 8 },
  notice: { fontFamily: fonts.medium, fontSize: 12, color: colors.warnText, marginTop: 8 },
  found: { backgroundColor: colors.successBg, borderRadius: radius.md, padding: 12, marginBottom: 10, gap: 2 },
  foundTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.successText },
  foundText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  coords: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary, paddingVertical: 8 },
});
