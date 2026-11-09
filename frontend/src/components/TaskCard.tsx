import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import type { Task } from '../types';
import { daysUntil, dueLabel } from '../utils/dates';
import { Button } from './Button';
import { Card } from './Card';
import { Tag } from './Tag';

type Props = {
  task: Task;
  now: Date;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

// Estados do protótipo: pendente (caixa vazia) e concluída (marca verde e título riscado).
export function TaskCard({ task, now, onToggle, onEdit, onDelete }: Props) {
  const overdue = !task.done && daysUntil(task.dueDate, now) < 0;

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Pressable
          onPress={onToggle}
          hitSlop={6}
          accessibilityRole="checkbox"
          accessibilityLabel={task.done ? `Reabrir a tarefa ${task.title}` : `Concluir a tarefa ${task.title}`}
          accessibilityState={{ checked: task.done }}
          style={styles.checkWrap}
        >
          <View style={[styles.box, task.done && styles.boxDone]}>
            {task.done && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </Pressable>

        <View style={styles.body}>
          <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
          {!!task.description && <Text style={styles.description}>{task.description}</Text>}
          <View style={styles.meta}>
            {!!task.subject && <Tag label={task.subject} />}
            <Text style={[styles.due, overdue && styles.dueOverdue]}>{dueLabel(task.dueDate, now)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Editar" variant="secondary" size="sm" onPress={onEdit} accessibilityLabel={`Editar a tarefa ${task.title}`} />
        <Button title="Excluir" variant="danger" size="sm" onPress={onDelete} accessibilityLabel={`Excluir a tarefa ${task.title}`} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  top: { flexDirection: 'row', gap: 12 },
  checkWrap: { paddingTop: 2 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxDone: { backgroundColor: colors.successFill, borderColor: colors.successFill },
  body: { flex: 1 },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  description: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  due: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  dueOverdue: { color: colors.error },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.background },
});
