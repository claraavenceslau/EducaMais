import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { authService, type AccountRole } from '../services/authService';
import { colors, fonts } from '../theme';
import { validateEmail, validatePassword } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { startSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<AccountRole>();
  const passwordRef = useRef<TextInputInstance>(null);

  async function handleLogin() {
    if (loading) return;
    const next = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    setFormError(undefined);
    if (next.email || next.password) return;

    setLoading(true);
    try {
      const user = await authService.signIn({ email: email.trim(), password });
      startSession(user);
    } catch (e) {
      const notConfigured = e instanceof Error && e.message === 'AUTH_NOT_CONFIGURED';
      setFormError(
        notConfigured
          ? 'O servidor de login ainda não está disponível. Use o modo de demonstração abaixo para explorar o app.'
          : 'E-mail ou senha incorretos.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(role: AccountRole) {
    if (demoLoading) return;
    setDemoLoading(role);
    try {
      startSession(await authService.signInDemo(role));
    } catch {
      setFormError('Não foi possível abrir o modo de demonstração.');
      setDemoLoading(undefined);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.logo}><Logo /></View>
            <Text style={styles.title} accessibilityRole="header">Entrar no Educa+</Text>
            <Text style={styles.subtitle}>Acesse sua conta de aluno ou professor.</Text>

            <TextField
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
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {!!formError && (
              <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="assertive">
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            <Button title="Entrar" onPress={handleLogin} loading={loading} />

            <View style={styles.links}>
              <Text style={styles.link} accessibilityRole="link" onPress={() => navigation.navigate('ForgotPassword')}>
                Esqueci a senha
              </Text>
              <Text style={styles.link} accessibilityRole="link" onPress={() => navigation.navigate('SignUp')}>
                Criar conta
              </Text>
            </View>

            {authService.demoEnabled && (
              <View style={styles.demo}>
                <Text style={styles.demoTitle}>Modo de demonstração</Text>
                <Text style={styles.demoText}>
                  Sem servidor, os dados são fictícios e ficam só neste aparelho.
                </Text>
                <View style={{ gap: 10 }}>
                  <Button
                    title="Entrar como aluno"
                    variant="secondary"
                    loading={demoLoading === 'aluno'}
                    disabled={!!demoLoading}
                    onPress={() => handleDemo('aluno')}
                  />
                  <Button
                    title="Entrar como professor"
                    variant="secondary"
                    loading={demoLoading === 'professor'}
                    disabled={!!demoLoading}
                    onPress={() => handleDemo('professor')}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  container: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  logo: { alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  formError: { backgroundColor: colors.errorBg, borderRadius: 8, padding: 10, marginBottom: 12 },
  formErrorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary, paddingVertical: 8 },
  demo: { marginTop: 28, padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, gap: 8 },
  demoTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  demoText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginBottom: 6 },
});
