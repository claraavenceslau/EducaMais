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
import { authService } from '../services/authService';
import { colors, fonts } from '../theme';
import { validateEmail } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  async function handleSend() {
    if (loading) return;
    const emailError = validateEmail(email);
    setError(emailError);
    setFormError(undefined);
    if (emailError) return;

    setLoading(true);
    try {
      const target = email.trim();
      await authService.requestPasswordReset(target);
      setSentTo(target);
    } catch {
      setFormError('Não foi possível enviar o link agora. Tente novamente em instantes.');
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
            {sentTo ? (
              <>
                <Ionicons name="mail-outline" size={56} color={colors.primary} style={styles.center} />
                <Text style={[styles.title, styles.centerText]} accessibilityRole="header">
                  Verifique seu e-mail
                </Text>
                {/* Mensagem genérica: não revela se a conta existe */}
                <Text style={[styles.subtitle, styles.centerText]}>
                  Se existir uma conta com o e-mail {sentTo}, enviamos um link para redefinir sua senha.
                  Confira também a caixa de spam.
                </Text>
                {formErrorBox}
                <View style={styles.actions}>
                  <Button title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
                  <Button title="Reenviar link" variant="secondary" onPress={handleSend} loading={loading} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title} accessibilityRole="header">Esqueceu a senha?</Text>
                <Text style={styles.subtitle}>
                  Informe o e-mail da sua conta e enviaremos um link para redefinir sua senha.
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