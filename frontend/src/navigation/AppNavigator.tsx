import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

// Sem sessão: telas de acesso. Com sessão: abas do perfil (aluno ou professor),
// já com os dados carregados para aquele usuário.
export function Navigation() {
  const { user } = useAuth();
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
