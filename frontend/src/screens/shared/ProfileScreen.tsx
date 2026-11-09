import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatBox } from '../../components/StatBox';
import { Tag } from '../../components/Tag';
import { useAuth, useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { colors, fonts } from '../../theme';
import { confirmAction } from '../../utils/confirm';
import { studentStats, teacherStats } from '../../utils/selectors';

// Permissões previstas no protótipo do professor (somente informativas).
const TEACHER_PERMISSIONS = [
  'Criar e publicar cursos',
  'Compartilhar conteúdo',
  'Responder na comunidade',
  'Moderar tópicos',
  'Ver relatório de alunos',
];

// Itens de configuração do protótipo. Ainda não têm função: ficam sinalizados como "Em breve".
const SETTINGS = ['Editar perfil', 'Notificações', 'Privacidade'];

export function ProfileScreen() {
  const user = useUser();
  const { endSession } = useAuth();
  const { data } = useData();
  const isTeacher = user.role === 'professor';

  const stats = isTeacher
    ? (() => {
        const s = teacherStats(data.courses);
        return [
          { value: s.activeCourses, label: 'Cursos' },
          { value: s.students, label: 'Alunos' },
          { value: s.contents, label: 'Conteúdos' },
        ];
      })()
    : (() => {
        const s = studentStats(data);
        return [
          { value: s.points, label: 'Pontos' },
          { value: s.tasksDone, label: 'Tarefas' },
          { value: s.courses, label: 'Cursos' },
        ];
      })();

  function askSignOut() {
    confirmAction('Sair da conta', 'Deseja encerrar a sessão?', 'Sair', endSession);
  }

  return (
    <Screen maxWidth={720}>
      <View style={styles.header}>
        <Avatar name={user.name} size={72} />
        <Text style={styles.name}>{user.name}</Text>
        <Tag label={isTeacher ? 'Professor' : 'Aluno'} tone={isTeacher ? 'warn' : 'info'} />
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.stats}>
        {stats.map((s) => <StatBox key={s.label} value={s.value} label={s.label} />)}
      </View>

      {isTeacher ? (
        <>
          <SectionHeader title="Permissões" />
          <Card style={{ gap: 10 }}>
            {TEACHER_PERMISSIONS.map((p) => (
              <View key={p} style={styles.permission}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.permissionText}>{p}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <>
          <SectionHeader title="Histórico de atividade" />
          <Card style={{ gap: 12 }}>
            {data.activity.length === 0 ? (
              <Text style={styles.muted}>Sua atividade aparecerá aqui.</Text>
            ) : (
              data.activity.map((a) => (
                <View key={a.id} style={styles.activity}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permissionText}>{a.text}</Text>
                    {!!a.detail && <Text style={styles.muted}>{a.detail}</Text>}
                  </View>
                  {a.points !== undefined && <Text style={styles.points}>+{a.points} pts</Text>}
                </View>
              ))
            )}
          </Card>
        </>
      )}

      <SectionHeader title="Configurações" />
      <Card style={{ gap: 4 }}>
        {SETTINGS.map((s) => (
          <View key={s} style={styles.setting} accessible accessibilityLabel={`${s}, em breve`}>
            <Text style={styles.permissionText}>{s}</Text>
            <Text style={styles.soon}>Em breve</Text>
          </View>
        ))}
      </Card>

      <View style={{ marginTop: 20 }}>
        <Button title="Sair" variant="danger" onPress={askSignOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 8, marginBottom: 20 },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, marginTop: 6 },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  stats: { flexDirection: 'row', gap: 10 },
  permission: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  permissionText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  points: { fontFamily: fonts.semibold, fontSize: 13, color: colors.successText },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  setting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  soon: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
});
