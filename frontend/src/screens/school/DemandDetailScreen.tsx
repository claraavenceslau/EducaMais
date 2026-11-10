import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { Tag } from '../../components/Tag';
import { Timeline } from '../../components/Timeline';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, fonts } from '../../theme';
import { formatBytes } from '../../utils/attachments';
import { confirmAction } from '../../utils/confirm';
import { canCancel, categoryLabel, STATUS_EVENT_TEXT, STATUS_FLOW, STATUS_LABEL, STATUS_TONE } from '../../utils/demands';
import { formatCoords, hasCoords, mapsUrl } from '../../utils/location';
import type { DemandStatus } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'DemandDetail'>;

export function DemandDetailScreen({ navigation, route }: Props) {
  const { data, actions } = useData();
  const demand = data.demands.find((d) => d.id === route.params.demandId);

  if (!demand) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.muted}>Esta demanda não existe mais.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  function pushEvent(status: DemandStatus) {
    if (!demand) return;
    const at = new Date().toISOString();
    actions.addDemandEvent(demand.id, { id: `${demand.id}-e${demand.timeline.length + 1}`, status, text: STATUS_EVENT_TEXT[status], at });
  }

  function handleCancel() {
    confirmAction('Cancelar demanda', 'Deseja cancelar esta demanda? Esta ação não pode ser desfeita.', 'Cancelar demanda', () => pushEvent('cancelada'));
  }

  const loc = demand.location;
  const nextStatus = STATUS_FLOW[demand.status][0];

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <View style={styles.tags}>
        <Tag label={STATUS_LABEL[demand.status]} tone={STATUS_TONE[demand.status]} />
        <Tag label={categoryLabel(demand.category)} tone="neutral" />
      </View>
      <Text style={styles.title} accessibilityRole="header">{demand.title}</Text>
      <Text style={styles.meta}>Protocolo {demand.protocol}</Text>
      {!!demand.seiProcess && <Text style={styles.meta}>Processo SEI {demand.seiProcess}</Text>}
      <Text style={styles.body}>{demand.description}</Text>

      {loc && (
        <Card style={{ marginTop: 16, gap: 4 }}>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Local</Text>
          </View>
          <Text style={styles.body2}>{loc.description}</Text>
          {hasCoords(loc) && <Text style={styles.meta}>{formatCoords(loc.latitude, loc.longitude)}</Text>}
          {hasCoords(loc) && (
            <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(mapsUrl(loc.latitude, loc.longitude))}>
              Ver no mapa
            </Text>
          )}
        </Card>
      )}

      {demand.attachments.length > 0 && (
        <>
          <SectionHeader title="Anexos" />
          <View style={{ gap: 8 }}>
            {demand.attachments.map((a) =>
              a.kind === 'image' ? (
                <Image key={a.id} source={{ uri: a.uri }} style={styles.image} resizeMode="cover" accessibilityLabel={`Foto anexada: ${a.name}`} />
              ) : (
                <Card key={a.id} style={styles.row}>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{a.name}</Text>
                    <Text style={styles.meta}>{formatBytes(a.sizeBytes)}</Text>
                  </View>
                </Card>
              ),
            )}
          </View>
        </>
      )}

      <SectionHeader title="Acompanhamento" />
      <Card>
        <Timeline events={demand.timeline} />
      </Card>

      {canCancel(demand) && (
        <View style={{ marginTop: 16 }}>
          <Button title="Cancelar demanda" variant="danger" onPress={handleCancel} />
        </View>
      )}

      {authService.demoEnabled && !!nextStatus && demand.status !== 'cancelada' && (
        <View style={styles.demo}>
          <Text style={styles.demoText}>
            Modo de demonstração: como ainda não há painel da escola, use o botão para simular o próximo passo.
          </Text>
          <Button title={`Simular: ${STATUS_LABEL[nextStatus]}`} variant="secondary" size="sm" onPress={() => pushEvent(nextStatus)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tags: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, marginTop: 12, lineHeight: 21 },
  body2: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary, paddingVertical: 6 },
  image: { width: '100%', height: 200, borderRadius: 12, backgroundColor: colors.background },
  demo: { marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, gap: 10 },
  demoText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
