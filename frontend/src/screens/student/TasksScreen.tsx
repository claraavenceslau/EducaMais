import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { TaskCard } from '../../components/TaskCard';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts } from '../../theme';
import { confirmAction } from '../../utils/confirm';
import { countOverdue, filterTasks, type TaskFilter } from '../../utils/selectors';

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'concluidas', label: 'Concluídas' },
];

const EMPTY: Record<TaskFilter, { title: string; message: string }> = {
  todas: { title: 'Nenhuma tarefa ainda', message: 'Toque no botão + para criar a primeira.' },
  pendentes: { title: 'Nada pendente', message: 'Você concluiu tudo por aqui.' },
  concluidas: { title: 'Nenhuma tarefa concluída', message: 'Marque uma tarefa como concluída para vê-la aqui.' },
};

export function TasksScreen() {
  const nav = useMainNavigation();
  const { status, data, actions, reload, mutationError } = useData();
  const [filter, setFilter] = useState<TaskFilter>('todas');
  const now = new Date();

  const tasks = filterTasks(data.tasks, filter);
  const overdue = countOverdue(data.tasks, now);

  function askDelete(id: string, title: string) {
    confirmAction('Excluir tarefa', `Deseja excluir "${title}"? Esta ação não pode ser desfeita.`, 'Excluir', () =>
      { void actions.removeTask(id).catch(() => undefined); },
    );
  }

  return (
    <Screen fab={<Fab label="Nova tarefa" onPress={() => nav.navigate('TaskForm')} />}>
      <Text style={styles.title} accessibilityRole="header">Minhas tarefas</Text>

      <AsyncView status={status} onRetry={reload}>
        <SegmentedTabs options={FILTERS} value={filter} onChange={setFilter} />
        {!!mutationError && <Text style={styles.mutationError} accessibilityRole="alert">{mutationError}</Text>}
        {overdue > 0 && (
          <Text style={styles.overdue} accessibilityLiveRegion="polite">
            {overdue} {overdue === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}
          </Text>
        )}

        <View style={styles.list}>
          {tasks.length === 0 ? (
            <EmptyState icon="checkmark-done-outline" title={EMPTY[filter].title} message={EMPTY[filter].message} />
          ) : (
            tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                now={now}
                onToggle={() => { void actions.toggleTask(t.id).catch(() => undefined); }}
                onEdit={() => nav.navigate('TaskForm', { taskId: t.id })}
                onDelete={() => askDelete(t.id, t.title)}
              />
            ))
          )}
        </View>
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 16 },
  overdue: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, marginTop: 12 },
  mutationError: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, marginTop: 12 },
  list: { marginTop: 16 },
});
