import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { ToggleRow } from '../../components/ToggleRow';
import { useUser } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { clearDrafts } from '../../services/storage';
import { colors, fonts } from '../../theme';
import { confirmAction } from '../../utils/confirm';

export function PrivacySettingsScreen() {
  const user = useUser();
  const { data, actions } = useData();
  const privacy = data.preferences.privacy;
  const [message, setMessage] = useState<string>();

  function handleClearDrafts() {
    clearDrafts(user.id).then(() => setMessage('Rascunhos apagados.'));
  }

  function handleReset() {
    confirmAction(
      'Restaurar dados de demonstração',
      'Isso apaga o que você criou neste aparelho (demandas, tarefas, avaliações, agendamentos) e volta aos dados de exemplo.',
      'Restaurar',
      () => {
        actions.resetData().then(() => setMessage('Dados restaurados.'));
      },
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720}>
      <SectionHeader title="Localização" />
      <Card>
        <ToggleRow
          title="Preencher o local automaticamente"
          description="Ao registrar uma demanda, o app pede a sua localização assim que a tela abre. Desligado, ela só é lida quando você toca no botão."
          value={privacy.shareLocationByDefault}
          onChange={(v) => actions.setPreferences({ privacy: { shareLocationByDefault: v } })}
        />
      </Card>

      {user.role === 'aluno' && (
        <>
          <SectionHeader title="Avaliações de cursos" />
          <Card style={{ gap: 10 }}>
            <Text style={styles.text}>Como seu nome aparece nas novas avaliações:</Text>
            <View style={styles.chips}>
              <Chip label="Meu primeiro nome" selected={privacy.reviewIdentity === 'nome'} onPress={() => actions.setPreferences({ privacy: { reviewIdentity: 'nome' } })} />
              <Chip label="Anônimo" selected={privacy.reviewIdentity === 'anonimo'} onPress={() => actions.setPreferences({ privacy: { reviewIdentity: 'anonimo' } })} />
            </View>
            <Text style={styles.hint}>Avaliações já enviadas não mudam. Para alterar uma delas, edite a avaliação no curso.</Text>
          </Card>
        </>
      )}

      <SectionHeader title="Dados neste aparelho" />
      <Card style={{ gap: 10 }}>
        <Text style={styles.text}>
          O Educa+ guarda suas demandas, tarefas e preferências apenas neste aparelho. Nada é enviado a servidores nesta versão.
        </Text>
        <Button title="Apagar rascunhos" variant="secondary" onPress={handleClearDrafts} />
        <Button title="Restaurar dados de demonstração" variant="danger" onPress={handleReset} />
        {!!message && <Text style={styles.hint} accessibilityLiveRegion="polite">{message}</Text>}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 20 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
