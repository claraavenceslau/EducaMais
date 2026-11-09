import { StyleSheet, Text, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatBox } from '../../components/StatBox';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts } from '../../theme';
import { firstName, teacherStats } from '../../utils/selectors';

export function DashboardScreen() {
  const nav = useMainNavigation();
  const user = useUser();
  const { status, data, reload } = useData();
  const stats = teacherStats(data.courses);

  return (
    <Screen>
      <Text style={styles.hello}>Olá, {firstName(user.name)}</Text>
      <Text style={styles.title} accessibilityRole="header">Painel do Professor</Text>

      <AsyncView status={status} onRetry={reload}>
        <View style={styles.stats}>
          <StatBox value={stats.activeCourses} label="Cursos ativos" />
          <StatBox value={stats.students} label="Alunos" />
          <StatBox value={stats.contents} label="Conteúdos" />
        </View>

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <Button title="Criar curso" onPress={() => nav.navigate('CourseForm')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Publicar"
              variant="secondary"
              onPress={() => nav.navigate('TeacherTabs', { screen: 'MyCourses' })}
            />
          </View>
        </View>

        <SectionHeader title="Atividade recente" />
        <Card style={{ gap: 12 }}>
          {data.activity.length === 0 ? (
            <Text style={styles.muted}>Nenhuma atividade ainda.</Text>
          ) : (
            data.activity.map((a) => (
              <View key={a.id}>
                <Text style={styles.text}>{a.text}</Text>
                {!!a.detail && <Text style={styles.muted}>{a.detail}</Text>}
              </View>
            ))
          )}
        </Card>
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 16 },
  stats: { flexDirection: 'row', gap: 10 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  text: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
