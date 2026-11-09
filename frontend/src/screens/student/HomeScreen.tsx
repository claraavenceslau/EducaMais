import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AsyncView } from '../../components/AsyncView';
import { Card } from '../../components/Card';
import { CourseHeader } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts, radius } from '../../theme';
import { dueLabel } from '../../utils/dates';
import { courseProgress, firstName, inProgressCourses, upcomingTasks } from '../../utils/selectors';

export function HomeScreen() {
  const nav = useMainNavigation();
  const user = useUser();
  const { status, data, reload } = useData();
  const now = new Date();

  const tasks = upcomingTasks(data.tasks, 2);
  const courses = inProgressCourses(data.courses);

  return (
    <Screen>
      <Text style={styles.hello}>Olá, {firstName(user.name)}</Text>
      <Text style={styles.title} accessibilityRole="header">Vamos estudar?</Text>

      <AsyncView status={status} onRetry={reload}>
        <LinearGradient colors={[colors.primary, colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.points}>
          <Text style={styles.pointsLabel}>Seus pontos</Text>
          <Text style={styles.pointsValue} accessibilityLabel={`${data.progress.points} pontos`}>
            {data.progress.points} pts
          </Text>
          <Text style={styles.pointsHint}>Continue avançando</Text>
          <Pressable
            onPress={() => nav.navigate('Gamification')}
            accessibilityRole="button"
            accessibilityLabel="Ver conquistas"
            style={styles.pointsButton}
          >
            <Text style={styles.pointsButtonText}>Ver conquistas →</Text>
          </Pressable>
        </LinearGradient>

        <SectionHeader
          title="Próximas tarefas"
          actionLabel="Ver mais"
          onAction={() => nav.navigate('StudentTabs', { screen: 'Tasks' })}
        />
        {tasks.length === 0 ? (
          <Card>
            <Text style={styles.empty}>Nenhuma tarefa pendente. Bom trabalho!</Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {tasks.map((t) => (
              <Card key={t.id} style={styles.taskRow}>
                <View style={styles.dot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{t.title}</Text>
                  <Text style={styles.taskMeta}>{dueLabel(t.dueDate, now)} · {t.subject}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        <SectionHeader
          title="Cursos em andamento"
          actionLabel="Explorar"
          onAction={() => nav.navigate('StudentTabs', { screen: 'Courses' })}
        />
        {courses.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="Você ainda não iniciou um curso"
            message="Explore o catálogo e escolha por onde começar."
            actionLabel="Explorar cursos"
            onAction={() => nav.navigate('StudentTabs', { screen: 'Courses' })}
          />
        ) : (
          <View style={styles.list}>
            {courses.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => nav.navigate('CourseDetail', { courseId: c.id })}
                accessibilityRole="button"
                accessibilityLabel={`Abrir o curso ${c.title}, ${courseProgress(c)}% concluído`}
                style={styles.courseCard}
              >
                <CourseHeader course={c} />
                <View style={styles.courseBody}>
                  <Text style={styles.taskTitle}>{c.title}</Text>
                  <View style={{ marginTop: 8, gap: 4 }}>
                    <ProgressBar value={courseProgress(c)} label={`Progresso em ${c.title}`} />
                    <Text style={styles.taskMeta}>{courseProgress(c)}% concluído</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 16 },
  points: { borderRadius: radius.lg, padding: 20 },
  pointsLabel: { fontFamily: fonts.medium, fontSize: 13, color: '#fff' },
  pointsValue: { fontFamily: fonts.bold, fontSize: 36, color: '#fff', marginTop: 2 },
  pointsHint: { fontFamily: fonts.regular, fontSize: 13, color: '#fff', marginTop: 2 },
  pointsButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  pointsButtonText: { fontFamily: fonts.semibold, fontSize: 13, color: '#fff' },
  list: { gap: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  taskTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  taskMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  courseCard: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  courseBody: { padding: 14 },
});
