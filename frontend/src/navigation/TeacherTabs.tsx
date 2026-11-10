import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SchoolScreen } from '../screens/school/SchoolScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { DashboardScreen } from '../screens/teacher/DashboardScreen';
import { MyCoursesScreen } from '../screens/teacher/MyCoursesScreen';
import { tabScreenOptions } from './tabOptions';
import type { TeacherTabParamList } from './types';

const Tab = createBottomTabNavigator<TeacherTabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) =>
  ({ color, size }: { color: string; size: number }) => <Ionicons name={name} size={size} color={color} />;

export function TeacherTabs() {
  const { width } = useWindowDimensions();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(width)}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Início', tabBarIcon: icon('home-outline') }} />
      <Tab.Screen name="MyCourses" component={MyCoursesScreen} options={{ title: 'Cursos', tabBarIcon: icon('book-outline') }} />
      <Tab.Screen name="School" component={SchoolScreen} options={{ title: 'Escola', tabBarIcon: icon('school-outline') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', tabBarIcon: icon('person-outline') }} />
    </Tab.Navigator>
  );
}
