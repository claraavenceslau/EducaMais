import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SchoolScreen } from '../screens/school/SchoolScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { CoursesScreen } from '../screens/student/CoursesScreen';
import { HomeScreen } from '../screens/student/HomeScreen';
import { TasksScreen } from '../screens/student/TasksScreen';
import { tabScreenOptions } from './tabOptions';
import type { StudentTabParamList } from './types';

const Tab = createBottomTabNavigator<StudentTabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) =>
  ({ color, size }: { color: string; size: number }) => <Ionicons name={name} size={size} color={color} />;

export function StudentTabs() {
  const { width } = useWindowDimensions();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(width)}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início', tabBarIcon: icon('home-outline') }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tarefas', tabBarIcon: icon('checkmark-circle-outline') }} />
      <Tab.Screen name="Courses" component={CoursesScreen} options={{ title: 'Cursos', tabBarIcon: icon('grid-outline') }} />
      <Tab.Screen name="School" component={SchoolScreen} options={{ title: 'Escola', tabBarIcon: icon('school-outline') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', tabBarIcon: icon('person-outline') }} />
    </Tab.Navigator>
  );
}
