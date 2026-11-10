import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, type TextInputInstance } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useAuth, useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { MainStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { maskPhone, validateClassGroup, validateName, validatePhone } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const user = useUser();
  const { updateUser } = useAuth();
  const { data, actions } = useData();
  const isTeacher = user.role === 'professor';

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(data.profile.phone ?? '');
  const [group, setGroup] = useState(data.profile.classGroup ?? '');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; group?: string }>({});
  const phoneRef = useRef<TextInputInstance>(null);
  const groupRef = useRef<TextInputInstance>(null);

  function handleSave() {
    const next = { name: validateName(name), phone: validatePhone(phone), group: validateClassGroup(group) };
    setErrors(next);
    if (next.name || next.phone || next.group) return;
    const cleanName = name.trim();
    actions.saveProfile({ name: cleanName, phone: phone.trim() || undefined, classGroup: group.trim() || undefined });
    updateUser({ name: cleanName });
    navigation.goBack();
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={560}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TextField
          label="Nome completo"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoComplete="name"
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
        />
        <TextField
          ref={phoneRef}
          label="Telefone (opcional)"
          placeholder="(81) 99999-9999"
          value={phone}
          onChangeText={(v) => setPhone(maskPhone(v))}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="next"
          onSubmitEditing={() => groupRef.current?.focus()}
        />
        <TextField
          ref={groupRef}
          label={isTeacher ? 'Disciplinas (opcional)' : 'Turma (opcional)'}
          placeholder={isTeacher ? 'Ex.: Mobile e Design' : 'Ex.: 3º ano B'}
          value={group}
          onChangeText={setGroup}
          error={errors.group}
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <View style={styles.emailBox}>
          <Text style={styles.emailLabel}>E-mail</Text>
          <Text style={styles.emailValue}>{user.email}</Text>
          <Text style={styles.emailHint}>O e-mail não pode ser alterado aqui. Para trocá-lo, procure a secretaria.</Text>
        </View>

        <View style={styles.actions}>
          <View style={{ flex: 1 }}><Button title="Cancelar" variant="secondary" onPress={() => navigation.goBack()} /></View>
          <View style={{ flex: 1 }}><Button title="Salvar" onPress={handleSave} /></View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emailBox: { marginBottom: 20, gap: 2 },
  emailLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  emailValue: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  emailHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 12 },
});
