import type { NavigatorScreenParams } from '@react-navigation/native';

// Telas de quem ainda não entrou.
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Abas do aluno e do professor (barra inferior no celular, lateral em telas largas).
// "School" é o hub com Demandas, Avisos, Agendamentos, Informações e Fórum.
export type StudentTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Courses: undefined;
  School: undefined;
  Profile: undefined;
};

export type TeacherTabParamList = {
  Dashboard: undefined;
  MyCourses: undefined;
  School: undefined;
  Profile: undefined;
};

// Telas de quem já entrou: as abas e as telas que abrem por cima delas.
export type MainStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabParamList> | undefined;
  TeacherTabs: NavigatorScreenParams<TeacherTabParamList> | undefined;
  TaskForm: { taskId?: string } | undefined;
  CourseDetail: { courseId: string };
  CourseForm: { courseId?: string } | undefined;
  CourseReviews: { courseId: string };
  Community: undefined;
  DiscussionDetail: { discussionId: string };
  DiscussionForm: undefined;
  Gamification: undefined;
  Demands: undefined;
  DemandForm: undefined;
  DemandDetail: { demandId: string };
  Notices: undefined;
  Appointments: undefined;
  AppointmentForm: undefined;
  SchoolInfo: undefined;
  EditProfile: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
};
