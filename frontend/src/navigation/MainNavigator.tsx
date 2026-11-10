import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/AuthContext';
import { AppointmentFormScreen } from '../screens/school/AppointmentFormScreen';
import { AppointmentsScreen } from '../screens/school/AppointmentsScreen';
import { DemandDetailScreen } from '../screens/school/DemandDetailScreen';
import { DemandFormScreen } from '../screens/school/DemandFormScreen';
import { DemandsScreen } from '../screens/school/DemandsScreen';
import { NoticesScreen } from '../screens/school/NoticesScreen';
import { SchoolInfoScreen } from '../screens/school/SchoolInfoScreen';
import { CommunityScreen } from '../screens/shared/CommunityScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { NotificationSettingsScreen } from '../screens/shared/NotificationSettingsScreen';
import { PrivacySettingsScreen } from '../screens/shared/PrivacySettingsScreen';
import { CourseReviewsScreen } from '../screens/teacher/CourseReviewsScreen';
import { DiscussionDetailScreen } from '../screens/shared/DiscussionDetailScreen';
import { DiscussionFormScreen } from '../screens/shared/DiscussionFormScreen';
import { CourseDetailScreen } from '../screens/student/CourseDetailScreen';
import { GamificationScreen } from '../screens/student/GamificationScreen';
import { TaskFormScreen } from '../screens/student/TaskFormScreen';
import { CourseFormScreen } from '../screens/teacher/CourseFormScreen';
import { colors, fonts } from '../theme';
import { StudentTabs } from './StudentTabs';
import { TeacherTabs } from './TeacherTabs';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

// Cabeçalho das telas que abrem por cima das abas (com botão de voltar).
const detailOptions = {
  headerShown: true,
  headerBackTitle: 'Voltar',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontFamily: fonts.semibold, color: colors.text },
} as const;

export function MainNavigator() {
  const user = useUser();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user.role === 'professor' ? (
        <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      ) : (
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
      )}

      <Stack.Group screenOptions={detailOptions}>
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({ title: route.params?.taskId ? 'Editar tarefa' : 'Nova tarefa' })}
        />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Curso' }} />
        <Stack.Screen
          name="CourseForm"
          component={CourseFormScreen}
          options={({ route }) => ({ title: route.params?.courseId ? 'Editar curso' : 'Novo curso' })}
        />
        <Stack.Screen name="DiscussionDetail" component={DiscussionDetailScreen} options={{ title: 'Discussão' }} />
        <Stack.Screen name="DiscussionForm" component={DiscussionFormScreen} options={{ title: 'Nova discussão' }} />
        <Stack.Screen name="Gamification" component={GamificationScreen} options={{ title: 'Conquistas' }} />
        <Stack.Screen name="CourseReviews" component={CourseReviewsScreen} options={{ title: 'Avaliações' }} />
        <Stack.Screen
          name="Community"
          component={CommunityScreen}
          options={{ title: user.role === 'professor' ? 'Comunidade' : 'Fórum' }}
        />
        <Stack.Screen name="Demands" component={DemandsScreen} options={{ title: 'Demandas' }} />
        <Stack.Screen name="DemandForm" component={DemandFormScreen} options={{ title: 'Nova demanda' }} />
        <Stack.Screen name="DemandDetail" component={DemandDetailScreen} options={{ title: 'Demanda' }} />
        <Stack.Screen name="Notices" component={NoticesScreen} options={{ title: 'Avisos' }} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Agendamentos' }} />
        <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Agendar atendimento' }} />
        <Stack.Screen name="SchoolInfo" component={SchoolInfoScreen} options={{ title: 'Informações' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notificações' }} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: 'Privacidade' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
