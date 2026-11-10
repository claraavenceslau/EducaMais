import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { Tag } from '../../components/Tag';
import { TextField } from '../../components/TextField';
import { CONTACTS, FAQ, calendarEvents } from '../../data/schoolInfo';
import { colors, fonts } from '../../theme';
import { isoToBr } from '../../utils/dates';

const KIND_LABEL = { aula: 'Aula', prova: 'Prova', evento: 'Evento', feriado: 'Feriado' } as const;
const KIND_TONE = { aula: 'info', prova: 'warn', evento: 'success', feriado: 'neutral' } as const;

async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // aparelho sem aplicativo para abrir o link
  }
}

// Consulta de informações educacionais: calendário, contatos e perguntas frequentes (com busca).
export function SchoolInfoScreen() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string>();
  const events = calendarEvents(new Date());
  const q = query.trim().toLowerCase();
  const faq = q ? FAQ.filter((f) => (f.question + ' ' + f.answer).toLowerCase().includes(q)) : FAQ;

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <SectionHeader title="Calendário" />
      <Card style={{ gap: 12 }}>
        {events.map((e) => (
          <View key={e.id} style={styles.event} accessible accessibilityLabel={`${isoToBr(e.date)}, ${e.title}, ${KIND_LABEL[e.kind]}`}>
            <Text style={styles.date}>{isoToBr(e.date).slice(0, 5)}</Text>
            <Text style={styles.eventTitle}>{e.title}</Text>
            <Tag label={KIND_LABEL[e.kind]} tone={KIND_TONE[e.kind]} />
          </View>
        ))}
      </Card>

      <SectionHeader title="Contatos" />
      <View style={{ gap: 10 }}>
        {CONTACTS.map((c) => (
          <Card key={c.id} style={{ gap: 4 }}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.hours}>{c.hours}</Text>
            {!!c.phone && <Text style={styles.link} accessibilityRole="link" onPress={() => open(`tel:${c.phone!.replace(/\D/g, '')}`)}>{c.phone}</Text>}
            {!!c.email && <Text style={styles.link} accessibilityRole="link" onPress={() => open(`mailto:${c.email}`)}>{c.email}</Text>}
          </Card>
        ))}
      </View>

      <SectionHeader title="Perguntas frequentes" />
      <TextField label="Buscar" placeholder="Ex.: declaração, localização" value={query} onChangeText={setQuery} />
      {faq.length === 0 ? (
        <Text style={styles.hours}>Nenhuma pergunta encontrada.</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {faq.map((f) => {
            const expanded = openId === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setOpenId(expanded ? undefined : f.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <Card style={{ gap: 6 }}>
                  <Text style={styles.name}>{f.question}</Text>
                  {expanded && <Text style={styles.answer}>{f.answer}</Text>}
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  event: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  date: { width: 44, fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  eventTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  name: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  hours: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary, paddingVertical: 6 },
  answer: { fontFamily: fonts.regular, fontSize: 13, color: colors.text, lineHeight: 20 },
});
