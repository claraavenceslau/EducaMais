import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUser } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, fonts, radius } from '../theme';
import type { Course, Stars } from '../types';
import { confirmAction } from '../utils/confirm';
import { newId } from '../utils/id';
import { courseRating, myReview, newestFirst, reviewEligibility, reviewsOf } from '../utils/reviews';
import { firstName } from '../utils/selectors';
import { validateReviewComment } from '../utils/validation';
import { Button } from './Button';
import { ReviewItem } from './ReviewItem';
import { StarRating } from './StarRating';
import { TextField } from './TextField';

// Avaliação do curso na tela de detalhe do aluno. Regras:
// - só aluno matriculado e com parte do curso concluída avalia;
// - uma avaliação por aluno por curso (ao enviar de novo, a anterior é editada);
// - a identidade (nome ou anônimo) segue a escolha em Perfil > Privacidade.
export function ReviewSection({ course }: { course: Course }) {
  const user = useUser();
  const { data, actions } = useData();
  const now = new Date();

  const mine = myReview(data.reviews, course.id, user.id);
  const summary = courseRating(data.reviews, course.id);
  const others = newestFirst(reviewsOf(data.reviews, course.id).filter((r) => r.id !== mine?.id)).slice(0, 3);
  const eligibility = reviewEligibility(course, user.role);

  const [editing, setEditing] = useState(false);
  const [stars, setStars] = useState<number>(mine?.stars ?? 0);
  const [comment, setComment] = useState(mine?.comment ?? '');
  const [error, setError] = useState<string>();

  if (user.role !== 'aluno') return null;

  const anonymous = data.preferences.privacy.reviewIdentity === 'anonimo';

  function handleSave() {
    const commentError = validateReviewComment(comment);
    const starsError = stars === 0 ? 'Escolha de 1 a 5 estrelas.' : undefined;
    setError(starsError ?? commentError);
    if (starsError || commentError) return;
    const at = new Date().toISOString();
    actions.saveReview({
      id: mine?.id ?? newId('rv'),
      courseId: course.id,
      studentId: user.id,
      authorName: anonymous ? 'Aluno anônimo' : firstName(user.name),
      anonymous,
      stars: stars as Stars,
      comment: comment.trim() || undefined,
      createdAt: mine?.createdAt ?? at,
      updatedAt: at,
    });
    setEditing(false);
  }

  function handleRemove() {
    if (!mine) return;
    confirmAction('Remover avaliação', 'Deseja apagar a sua avaliação deste curso?', 'Remover', () => {
      actions.removeReview(mine.id);
      setStars(0);
      setComment('');
      setEditing(false);
    });
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} accessibilityRole="header">Avaliações</Text>
      <Text style={styles.summary}>
        {summary.count === 0
          ? 'Este curso ainda não tem avaliações.'
          : `Nota média ${summary.average.toFixed(1).replace('.', ',')} de 5, com ${summary.count} ${summary.count === 1 ? 'avaliação' : 'avaliações'}.`}
      </Text>

      {mine && !editing ? (
        <View style={styles.mine}>
          <Text style={styles.mineTitle}>Sua avaliação</Text>
          <ReviewItem review={mine} now={now} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><Button title="Editar" size="sm" variant="secondary" onPress={() => setEditing(true)} /></View>
            <View style={{ flex: 1 }}><Button title="Remover" size="sm" variant="danger" onPress={handleRemove} /></View>
          </View>
        </View>
      ) : eligibility.allowed ? (
        <View style={styles.form}>
          <Text style={styles.mineTitle}>{mine ? 'Editar sua avaliação' : 'Avalie este curso'}</Text>
          <StarRating value={stars} size={30} onChange={(n) => { setStars(n); setError(undefined); }} />
          <Text style={styles.identity}>
            {anonymous ? 'Será publicada como "Aluno anônimo".' : `Será publicada com o nome "${firstName(user.name)}".`} Você muda isso em Perfil &gt; Privacidade.
          </Text>
          <TextField
            label="Comentário (opcional)"
            placeholder="O que você achou do curso?"
            value={comment}
            onChangeText={(v) => { setComment(v); setError(undefined); }}
            multiline
            maxLength={500}
            error={error}
          />
          <View style={styles.row}>
            {mine && <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" onPress={() => { setEditing(false); setStars(mine.stars); setComment(mine.comment ?? ''); }} /></View>}
            <View style={{ flex: 1 }}><Button title={mine ? 'Salvar' : 'Enviar avaliação'} onPress={handleSave} /></View>
          </View>
        </View>
      ) : (
        <Text style={styles.locked} accessibilityRole="text">{eligibility.reason}</Text>
      )}

      {others.length > 0 && (
        <View style={styles.list}>
          {others.map((r) => <ReviewItem key={r.id} review={r} now={now} />)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  summary: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  mine: { gap: 8 },
  mineTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 8 },
  identity: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  locked: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12 },
  list: { gap: 8, marginTop: 14 },
});
