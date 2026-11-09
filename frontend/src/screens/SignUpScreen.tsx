import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { RoleSelector } from '../components/RoleSelector';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { authService, type AccountRole } from '../services/authService';
import type { User } from '../types';
import { colors, fonts } from '../theme';
import {
  validateConfirmPassword, validateEmail, validateName, validateNewPassword,
} from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

// Cadastro em duas etapas: 1) perfil (aluno ou professor), 2) dados da conta.
export function SignUpScreen({ navigation }: Props) {
  const { startSession } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<AccountRole>();
  const [roleError, setRoleError] = useState<string>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<User>();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  function handleNext() {
    if (!role) {
      setRoleError('Escolha como você vai usar o Educa+.');
      return;
    }
    setRoleError(undefined);
    setStep(2);
  }

  async function handleSubmit() {
    if (loading || !role) return;
    const next = {
      name: validateName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
      confirm: validateConfirmPassword(confirm, password),
    };
    setErrors(next);
    setFormError(undefined);
    if (next.name || next.email || next.password || next.confirm) return;

    setLoading(true);
    try {
      const user = await authService.signUp({ role, name: name.trim(), email: email.trim(), password });
      setCreatedUser(user);
    } catch {
      setFormError('Não foi possível criar a conta agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {createdUser ? (
              <>
                <Ionicons name="checkmark-circle" size={56} color={colors.success} style={styles.center} />
                <Text style={[styles.title, styles.centerText]} accessibilityRole="header">Conta criada!</Text>
                <Text style={[styles.subtitle, styles.centerText]}>
                  Bem-vindo(a), {createdUser.name}. Este cadastro é apenas uma demonstração: nenhum dado foi
                  enviado ou guardado.
                </Text>
                <View style={{ gap: 12 }}>
                  {authService.demoEnabled && (
                    <Button title="Entrar agora" onPress={() => startSession(createdUser)} />
                  )}
                  <Button title="Ir para o login" variant="secondary" onPress={() => navigation.navigate('Login')} />
                </View>
              </>
            ) : step === 1 ? (
              <>
                <Text style={styles.step}>Etapa 1 de 2</Text>
                <Text style={styles.title} accessibilityRole="header">Criar conta</Text>
                <Text style={styles.subtitle}>Primeiro, conte quem você é.</Text>
                <RoleSelector value={role} onChange={(r) => { setRole(r); setRoleError(undefined); }} error={roleError} />
                <View style={{ gap: 12 }}>
                  <Button title="Continuar" onPress={handleNext} />
                  <Button title="Já tenho conta" variant="secondary" onPress={() => navigation.navigate('Login')} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.step}>Etapa 2 de 2 · {role === 'professor' ? 'Professor(a)' : 'Aluno(a)'}</Text>
                <Text style={styles.title} accessibilityRole="header">Seus dados</Text>
                <Text style={styles.subtitle}>Preencha para criar sua conta.</Text>

                <TextField
                  label="Nome completo"
                  placeholder="Seu nome"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
                <TextField
                  ref={emailRef}
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <TextField
                  ref={passwordRef}
                  label="Senha"
                  placeholder="Crie uma senha"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  isPassword
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                />
                <TextField
                  ref={confirmRef}
                  label="Confirmar senha"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChangeText={setConfirm}
                  error={errors.confirm}
                  isPassword
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                {!!formError && (
                  <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="assertive">
                    <Text style={styles.formErrorText}>{formError}</Text>
                  </View>
                )}

                <View style={{ gap: 12 }}>
                  <Button title="Criar conta" onPress={handleSubmit} loading={loading} />
                  <Button title="Voltar" variant="secondary" onPress={() => setStep(1)} disabled={loading} />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 24 },
  container: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  center: { alignSelf: 'center' },
  centerText: { textAlign: 'center' },
  step: { fontFamily: fonts.semibold, fontSize: 12, color: colors.primary, marginTop: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginTop: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 },
  formError: { backgroundColor: colors.errorBg, borderRadius: 8, padding: 10, marginBottom: 12 },
  formErrorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
});
