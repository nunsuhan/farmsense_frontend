export type RootStackParamList = {
    // Auth
    AuthIntro: undefined;
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Home: undefined;
    Menu: undefined; // Menu Modal
    OnboardingSlides: undefined;


    // Settings
    Settings: undefined;
    PermissionRequest: undefined;
    FarmRegistration: undefined;
    FarmBasicInfo: undefined;
    FarmDetailInfo: undefined;
    AlertSettings: undefined;
    SensorRegistration: undefined;
    AccountSettings: undefined;
    NotificationSettings: undefined;

    // New Settings
    FarmDetail: undefined;
    SoilEnvironment: undefined;
    SectorManage: undefined;
    SensorManage: undefined;
    Notification: undefined;
    Help: undefined;
    Support: undefined;
    AppInfo: undefined;

    // Main
    MainTab: { screen?: keyof MainTabParamList }; // Bottom Tab Host with optional nested screen
    QnAScreen: undefined; // AI 상담소

    // Core Features
    DailyPrescription: undefined;
    GrowthDiary: undefined;
    FarmMap: undefined;
    FarmMapAdvanced: undefined;
    FacilityInfo: undefined;
    ReverseAnalysis: undefined;
    PesticideRecord: undefined;
    CanopyCamera: undefined;

    // Misc
    Profile: undefined;
    NotificationList: undefined;
    Terms: undefined;
    PrivacyPolicy: undefined;

    // Fullscreen Modals / Stacks
    SmartLens: undefined; // Camera
    LogWrite: { date?: string; logId?: string }; // Create/Edit Log
    PostWrite: undefined; // New Post
    PostDetail: { postId: string }; // View Post
    PesticideManagement: undefined; // Safety Check
    Diagnosis: undefined; // AI Diagnosis Camera
    DiagnosisResult: { imageUri: string; result: any }; // AI Diagnosis Result
    FarmDoctor: undefined;
    SmartFarm: undefined;
    Irrigation: undefined;
    Fertilizer: undefined;
    Environment: undefined;
    HarvestPrediction: undefined;
    Prevention: undefined;
    DiagnosisHistory: undefined;
    PrescriptionGuide: undefined;

    // New Features (Jan 2026)
    FertilizerPrescription: { pnuCode: string };
    Benchmark: undefined;
    YearlyReport: { year?: number };
};

export type MainTabParamList = {
    HomeTab: undefined;
    FarmingLog: undefined;
    Community: undefined;
    MyFarm: undefined;
    SmartLens: undefined;
    // Menu removed from Tab
};

// Farming Log Types
export enum LogCategory {
    GROWTH = 'GROWTH',     // 생육관리
    WATER = 'WATER',       // 관수/관비
    PEST = 'PEST',         // 방제
    TREE = 'TREE',         // 수체관리
    HARVEST = 'HARVEST',   // 수확
    SHIPPING = 'SHIPPING', // 출하
    FACILITY = 'FACILITY', // 시설관리
    ETC = 'ETC'            // 기타
}

export interface FarmingLogBase {
    id: string;
    date: string;
    weather?: {
        desc: string;
        temp: number;
        humidity: number;
    };
    category: LogCategory;
    images?: string[];
    memo?: string;
}

export interface GrowthLog extends FarmingLogBase {
    category: LogCategory.GROWTH;
    stage?: string; // 생육단계
    observation?: {
        newShootLength?: string; // 신초길이
        leafStatus?: 'GOOD' | 'CAUTION' | 'BAD';
        fruitSize?: string;
        sugarContent?: string;
    };
}

export interface WaterLog extends FarmingLogBase {
    category: LogCategory.WATER;
    type: 'WATER' | 'FERTILIZER'; // 관수 OR 액비
    amount?: string; // 관수량 (L or min)
    fertilizerName?: string;
    dilutionRatio?: string; // 희석배율
}

export interface PestLog extends FarmingLogBase {
    category: LogCategory.PEST;
    purpose: 'DISEASE' | 'INSECT' | 'PREVENTION';
    targetPest?: string;
    pesticideName?: string;
    dilutionRatio?: string;
    amount?: string; // 살포량
    method?: 'SPRAY' | 'FOG' | 'DRENCH'; // 분무/연무/관주
    safeHarvestDate?: string; // 수확가능일
}

export interface HarvestLog extends FarmingLogBase {
    category: LogCategory.HARVEST;
    variety?: string;
    amount?: string; // kg
    grade?: 'SPECIAL' | 'HIGH' | 'MID' | 'LOW';
    sugarContent?: string;
}

export type FarmingLogEntry =
    | FarmingLogBase
    | GrowthLog
    | WaterLog
    | PestLog
    | HarvestLog;

