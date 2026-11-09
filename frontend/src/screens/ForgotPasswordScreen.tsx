import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import type { AuthStackParamList } from '../navigation/types';
import {
  AccountNotFoundError, AuthApiError, authService, PasswordResetUnavailableError,
} from '../services/authService';
import { colors, fonts } from '../theme';
import {
  validateConfirmPassword, validateEmail, validateNewPassword,
} from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [resetComplete, setResetComplete] = useState(false);

  async function handleSend() {
    if (loading) return;
    const emailError = validateEmail(email);
    setError(emailError);
    setFormError(undefined);
    if (emailError) return;

    setLoading(true);
    try {
      const target = email.trim();
      const result = await authService.requestPasswordReset(target);
      setResetToken(result.resetToken);
    } catch (requestError) {
      setFormError(requestError instanceof AccountNotFoundError
        ? 'Não encontramos uma conta com esse e-mail.'
        : requestError instanceof PasswordResetUnavailableError
          ? 'O envio de e-mail ainda não foi configurado. No ambiente local, habilite EXPOSE_PASSWORD_RESET_TOKEN no backend.'
          : 'Não foi possível iniciar a recuperação. Confira a conexão com a API e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (loading || !resetToken) return;
    const nextPasswordError = validateNewPassword(password);
    const nextConfirmError = validateConfirmPassword(confirmPassword, password);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    setFormError(undefined);
    if (nextPasswordError || nextConfirmError) return;

    setLoading(true);
    try {
      await authService.resetPassword(resetToken, password);
      setResetComplete(true);
    } catch (resetError) {
      setFormError(resetError instanceof AuthApiError && resetError.code === 'INVALID_RESET_TOKEN'
        ? 'O código expirou ou já foi usado. Inicie a recuperação novamente.'
        : 'Não foi possível atualizar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const formErrorBox = !!formError && (
    <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Text style={styles.formErrorText}>{formError}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {resetComplete ? (
              <>
                <Ionicons name="checkmark-circle" size={56} color={colors.success} style={styles.center} />
                <Text style={[styles.title, styles.centerText]} accessibilityRole="header">
                  Senha atualizada
                </Text>
                <Text style={[styles.subtitle, styles.centerText]}>
                  Agora você pode entrar com sua nova senha.
                </Text>
                <Button title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
              </>
            ) : resetToken ? (
              <>
                <Text style={styles.title} accessibilityRole="header">Criar nova senha</Text>
                <Text style={styles.subtitle}>
                  Defina uma nova senha para sua conta. Este código local é válido por uma hora e só pode ser usado uma vez.
                </Text>
                <TextField
                  label="Nova senha"
                  placeholder="Crie uma senha"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  isPassword
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="next"
                />
                <TextField
                  label="Confirmar nova senha"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={confirmError}
                  isPassword
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
                {formErrorBox}
                <Button title="Salvar nova senha" onPress={handleReset} loading={loading} />
              </>
            ) : (
              <>
                <Text style={styles.title} accessibilityRole="header">Esqueceu a senha?</Text>
                <Text style={styles.subtitle}>
                  Informe o e-mail cadastrado. No ambiente local, a API gera um código temporário para você definir outra senha.
                </Text>
                <TextField
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  error={error}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                />
                {formErrorBox}
                <Button title="Enviar link" onPress={handleSend} loading={loading} />
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
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginTop: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 8, marginBottom: 24 },
  actions: { gap: 12 },
  formError: { backgroundColor: colors.errorBg, borderRadius: 8, padding: 10, marginBottom: 12 },
  formErrorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
});
