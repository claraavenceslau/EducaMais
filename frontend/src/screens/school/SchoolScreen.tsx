import { StyleSheet, Text } from 'react-native';
import { Card } from '../../components/Card';
import { NavRow } from '../../components/NavRow';
import { Screen } from '../../components/Screen';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts } from '../../theme';
import { upcoming } from '../../utils/appointments';
import { demandCounts } from '../../utils/demands';
import { unreadCount } from '../../utils/notices';

// Ponto de entrada dos serviços da comunidade escolar.
export function SchoolScreen() {
  const nav = useMainNavigation();
  const user = useUser();
  const { data } = useData();
  const now = new Date();

  const open = demandCounts(data.demands).open;
  const unread = unreadCount(data.notices);
  const next = upcoming(data.appointments, now).length;

  return (
    <Screen maxWidth={720}>
      <Text style={styles.title} accessibilityRole="header">Escola</Text>
      <Text style={styles.subtitle}>Serviços e comunicação com a escola.</Text>

      <Card style={{ gap: 2 }}>
        <NavRow
          icon="megaphone-outline"
          title="Demandas"
          description="Registre e acompanhe solicitações"
          badge={open > 0 ? `${open} em aberto` : undefined}
          onPress={() => nav.navigate('Demands')}
        />
        <NavRow
          icon="notifications-outline"
          title="Avisos"
          description="Comunicados da escola"
          badge={unread > 0 ? `${unread} novos` : undefined}
          onPress={() => nav.navigate('Notices')}
        />
        <NavRow
          icon="calendar-outline"
          title="Agendamentos"
          description="Marque um atendimento"
          badge={next > 0 ? `${next} marcados` : undefined}
          onPress={() => nav.navigate('Appointments')}
        />
        <NavRow
          icon="information-circle-outline"
          title="Informações"
          description="Calendário, contatos e dúvidas frequentes"
          onPress={() => nav.navigate('SchoolInfo')}
        />
        <NavRow
          icon="chatbubbles-outline"
          title={user.role === 'professor' ? 'Comunidade' : 'Fórum'}
          description="Converse com a turma"
          onPress={() => nav.navigate('Community')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
});
