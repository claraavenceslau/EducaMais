import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, type TextInputInstance } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AttachmentPicker } from '../../components/AttachmentPicker';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { LocationPicker } from '../../components/LocationPicker';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useData } from '../../context/DataContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts, radius } from '../../theme';
import type { Attachment, Demand, DemandCategory, DemandLocation } from '../../types';
import { CATEGORIES, nextProtocol, STATUS_EVENT_TEXT } from '../../utils/demands';
import { newId } from '../../utils/id';
import { validateDemandDescription, validateDemandTitle } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'DemandForm'>;

const isCategory = (v: unknown): v is DemandCategory => CATEGORIES.some((c) => c.key === v);

export function DemandFormScreen({ navigation }: Props) {
  const { data, actions } = useData();
  const [category, setCategory] = useState<DemandCategory>('infraestrutura');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [location, setLocation] = useState<DemandLocation>();
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const descRef = useRef<TextInputInstance>(null);

  // Rascunho: título, descrição e categoria são recuperados se o app fechar no meio.
  const draft = useFormDraft('demand', { title, description, category }, (d) => {
    if (d.title) setTitle(d.title);
    if (d.description) setDescription(d.description);
    if (isCategory(d.category)) setCategory(d.category);
  });

  function handleSend() {
    const next = { title: validateDemandTitle(title), description: validateDemandDescription(description) };
    setErrors(next);
    if (next.title || next.description) return;

    const now = new Date();
    const at = now.toISOString();
    const id = newId('dm');
    const demand: Demand = {
      id,
      protocol: nextProtocol(data.demands, now),
      category,
      title: title.trim(),
      description: description.trim(),
      status: 'aberta',
      createdAt: at,
      updatedAt: at,
      attachments,
      location,
      timeline: [{ id: `${id}-e1`, status: 'aberta', text: STATUS_EVENT_TEXT.aberta, at }],
    };
    actions.addDemand(demand);
    draft.clear();
    navigation.replace('DemandDetail', { demandId: id });
  }

  function handleDiscard() {
    draft.clear();
    setTitle('');
    setDescription('');
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={560}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {draft.restored && (
          <View style={styles.banner} accessibilityLiveRegion="polite">
            <Text style={styles.bannerText}>Recuperamos o rascunho que você não terminou.</Text>
            <Text style={styles.bannerLink} accessibilityRole="button" onPress={handleDiscard}>Descartar</Text>
          </View>
        )}

        <Text style={styles.label}>Assunto</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} label={c.label} selected={category === c.key} onPress={() => setCategory(c.key)} />
          ))}
        </View>
        <Text style={styles.hint}>{CATEGORIES.find((c) => c.key === category)?.hint}</Text>

        <TextField
          label="Título"
          placeholder="Resuma em uma frase"
          value={title}
          onChangeText={(v) => { setTitle(v); if (errors.title) setErrors((e) => ({ ...e, title: undefined })); }}
          error={errors.title}
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={() => descRef.current?.focus()}
        />
        <TextField
          ref={descRef}
          label="Descrição"
          placeholder="O que está acontecendo? Desde quando?"
          value={description}
          onChangeText={(v) => { setDescription(v); if (errors.description) setErrors((e) => ({ ...e, description: undefined })); }}
          error={errors.description}
          multiline
          maxLength={1000}
        />

        <AttachmentPicker value={attachments} onChange={setAttachments} />
        <LocationPicker value={location} onChange={setLocation} autoLocate={data.preferences.privacy.shareLocationByDefault} />

        <View style={styles.actions}>
          <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" onPress={() => navigation.goBack()} /></View>
          <View style={{ flex: 1 }}><Button title="Enviar demanda" onPress={handleSend} /></View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: 12, marginBottom: 16 },
  bannerText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  bannerLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary, paddingVertical: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 6, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
