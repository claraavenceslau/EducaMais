import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { confirmAction } from '../../utils/confirm';
import { timeAgo } from '../../utils/dates';
import { newId } from '../../utils/id';
import { validateReply } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'DiscussionDetail'>;

export function DiscussionDetailScreen({ navigation, route }: Props) {
  const user = useUser();
  const { data, actions } = useData();
  const discussion = data.discussions.find((d) => d.id === route.params.discussionId);
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const now = new Date();

  if (!discussion) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Text style={styles.notFound}>Esta discussão não existe mais.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  function handleReply() {
    const message = validateReply(text);
    setError(message);
    if (message || !discussion) return;
    actions.addReply(discussion.id, {
      id: newId('r'),
      author: user.name,
      body: text.trim(),
      createdAt: new Date().toISOString(),
    });
    setText('');
  }

  function handleRemove() {
    if (!discussion) return;
    confirmAction('Remover discussão', `Remover "${discussion.title}" e todas as respostas?`, 'Remover', () => {
      actions.removeDiscussion(discussion.id);
      navigation.goBack();
    });
  }

  const count = discussion.replies.length;

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Card>
          <View style={styles.head}>
            <Avatar name={discussion.author} />
            <View style={{ flex: 1 }}>
              <Text style={styles.author}>{discussion.author}</Text>
              <Text style={styles.meta}>{timeAgo(discussion.createdAt, now)} · {discussion.subject}</Text>
            </View>
          </View>
          <Text style={styles.title} accessibilityRole="header">{discussion.title}</Text>
          <Text style={styles.body}>{discussion.body}</Text>
          {user.role === 'professor' && (
            <View style={styles.moderate}>
              <Button title="Remover discussão" variant="danger" size="sm" onPress={handleRemove} />
            </View>
          )}
        </Card>

        <Text style={styles.section} accessibilityRole="header">
          {count} {count === 1 ? 'resposta' : 'respostas'}
        </Text>
        {discussion.replies.map((r) => (
          <View key={r.id} style={styles.reply}>
            <Avatar name={r.author} size={32} />
            <View style={styles.replyBody}>
              <Text style={styles.replyAuthor}>{r.author} · <Text style={styles.meta}>{timeAgo(r.createdAt, now)}</Text></Text>
              <Text style={styles.replyText}>{r.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.compose}>
          <TextField
            label="Adicionar comentário"
            placeholder="Escreva sua resposta"
            value={text}
            onChangeText={(v) => {
              setText(v);
              if (error) setError(undefined);
            }}
            error={error}
            multiline
          />
          <Button title="Publicar resposta" onPress={handleReply} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  author: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, marginTop: 8, lineHeight: 21 },
  moderate: { alignSelf: 'flex-start', marginTop: 14 },
  section: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginTop: 24, marginBottom: 10 },
  reply: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  replyBody: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
  replyAuthor: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  replyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, marginTop: 4 },
  compose: { marginTop: 16 },
});
