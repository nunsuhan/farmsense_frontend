// Navigation Types
import { NavigationProp, RouteProp } from '@react-navigation/native';

// Root Stack Navigator의 파라미터 타입 정의
export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  // Main Tab Navigator
  Main: undefined;
  
  // Tab Screens
  Home: undefined;
  Diagnosis: undefined;
  CommunityTab: undefined;
  GrowthDiaryTab: undefined;

  // Feature Screens
  GrowthDiary: undefined;
  FarmMap: undefined;
  FarmMapAdvanced: undefined;
  ReverseAnalysis: undefined;
  FacilityInfo: undefined;
  Terms: undefined;
  DailyPrescription: undefined;
  PesticideRecord: undefined;
  QnA: undefined;

  // Community Screens
  Community: undefined;
  PostDetail: { postId: string };
  PostWrite: undefined;

  // Profile & Settings Screens
  Profile: undefined;
  Settings: undefined;
  
  // Notification Screens
  NotificationSettings: undefined;
  NotificationList: undefined;

  // Settings 하위 화면들
  SettingsMain: undefined;
  FarmBasicInfo: undefined;
  SensorRegistration: undefined;
  AccountSettings: undefined;
};

// Navigation Prop 타입
export type RootNavigationProp = NavigationProp<RootStackParamList>;

// Route Prop 타입 (특정 스크린용)
export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;

// 스크린 컴포넌트의 Props 타입
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};







