// ============================================
// v2.1 Navigation Types - 6탭 구조
// ============================================

export type RootStackParamList = {
  // Entry
  Splash: undefined;
  OnboardingSlides: undefined;

  // Auth
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  // Main
  MainTab: { screen?: keyof MainTabParamList };

  // Modals
  Menu: undefined;
};

// 6탭 구조
export type MainTabParamList = {
  HomeTab: undefined;
  ConsultTab: undefined;
  DiagnosisTab: undefined;
  LogTab: undefined;
  MyFarmTab: undefined;
  MoreTab: undefined;
};

// 탭 1: 홈 (보고서 포함)
export type HomeStackParamList = {
  Home: undefined;
  TodayReport: undefined;
  ReportHub: undefined;
  ReportList: undefined;
  IrrigationDetail: undefined;
  DiagnosisDetail: undefined;
  PredictionDetail: undefined;
  DSSDetail: undefined;
  SensorDetail: undefined;
  RealtimeDetail: undefined;
  SprayDetail: undefined;
  FertilizerDetail: undefined;
};

// TodayStackNavigator 에서 사용하는 별칭
export type TodayStackParamList = HomeStackParamList;

// 탭 2: AI 상담
export type ConsultStackParamList = {
  ConsultHome: undefined;
  QnA: undefined;
};

// (deprecated) 보고서 탭 - 이제 홈에서 접근
export type ReportStackParamList = {
  ReportList: undefined;
  IrrigationDetail: undefined;
  DiagnosisDetail: undefined;
  PredictionDetail: undefined;
  DSSDetail: undefined;
  SensorDetail: undefined;
  RealtimeDetail: undefined;
  SprayDetail: undefined;
  FertilizerDetail: undefined;
};

// 탭 3: 진단
export type DiagnosisStackParamList = {
  DiagnosisHub: undefined;
  DiagnosisCamera: undefined;
  DiagnosisResult: { imageUri: string; result?: any };
  GrowthRecord: undefined;
  GrowthRecordWrite: { hasIssue?: boolean };
  CanopyGuide: undefined;
  CanopyCamera: undefined;
  SmartScanner: undefined;
};

// 탭 4: 영농일지
export type LogStackParamList = {
  FarmingLog: undefined;
  LogWrite: { date?: string; logId?: string };
  AutoLog: undefined;
};

// 탭 5: 내 농장
export type MyFarmStackParamList = {
  MyFarmHub: undefined;
  UnifiedFarmSettings: undefined;
  SensorManage: undefined;
  SensorDashboard: undefined;
  SensorRegistration: undefined;
  ExternalSensor: undefined;
  FarmMap: undefined;
  ProductHistory: undefined;
  Certificates: undefined;
  // GAP 인증 관리
  GAPHub: undefined;
  GAPChecklist: undefined;
  SoilTestForm: undefined;
  WaterTestForm: undefined;
  FertilizerForm: undefined;
  HarvestForm: undefined;
  TrainingForm: undefined;
  ExportDashboard: undefined;
  Sealing: undefined;
  SmartGreenhouse: undefined;
  IrrigationDashboard: { sectorId?: string };
};

// 탭 6: 더보기
export type MoreStackParamList = {
  MoreMenu: undefined;
  NotificationSettings: undefined;
  AppSettings: undefined;
  HelpCenter: undefined;
  AppInfo: undefined;
  Terms: undefined;
  Profile: undefined;
  NotificationList: undefined;
  Community: undefined;
  Consultation: undefined;
  PrivacyPolicy: undefined;
  PostWrite: { topicId?: string };
  TopicDetail: { topic: any };
};

// Farming Log Types (preserved from v1)
export enum LogCategory {
  GROWTH = 'GROWTH',
  WATER = 'WATER',
  PEST = 'PEST',
  TREE = 'TREE',
  HARVEST = 'HARVEST',
  SHIPPING = 'SHIPPING',
  FACILITY = 'FACILITY',
  ETC = 'ETC',
}

export interface FarmingLogBase {
  id: string;
  date: string;
  weather?: { desc: string; temp: number; humidity: number };
  category: LogCategory;
  images?: string[];
  memo?: string;
}

export interface GrowthLog extends FarmingLogBase {
  category: LogCategory.GROWTH;
  stage?: string;
  observation?: {
    newShootLength?: string;
    leafStatus?: 'GOOD' | 'CAUTION' | 'BAD';
    fruitSize?: string;
    sugarContent?: string;
  };
}

export interface WaterLog extends FarmingLogBase {
  category: LogCategory.WATER;
  type: 'WATER' | 'FERTILIZER';
  amount?: string;
  fertilizerName?: string;
  dilutionRatio?: string;
}

export interface PestLog extends FarmingLogBase {
  category: LogCategory.PEST;
  purpose: 'DISEASE' | 'INSECT' | 'PREVENTION';
  targetPest?: string;
  pesticideName?: string;
  dilutionRatio?: string;
  amount?: string;
  method?: 'SPRAY' | 'FOG' | 'DRENCH';
  safeHarvestDate?: string;
}

export interface HarvestLog extends FarmingLogBase {
  category: LogCategory.HARVEST;
  variety?: string;
  amount?: string;
  grade?: 'SPECIAL' | 'HIGH' | 'MID' | 'LOW';
  sugarContent?: string;
}

export type FarmingLogEntry =
  | FarmingLogBase
  | GrowthLog
  | WaterLog
  | PestLog
  | HarvestLog;
