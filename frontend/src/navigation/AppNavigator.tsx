import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

// Sem sessão: telas de acesso. Com sessão: abas do perfil (aluno ou professor),
// já com os dados carregados para aquele usuário.
export function Navigation() {
  const { user, isRestoring } = useAuth();
  if (isRestoring) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  }
  return (
    <NavigationContainer>
      {user ? (
        <DataProvider user={user}>
          <MainNavigator />
        </DataProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
