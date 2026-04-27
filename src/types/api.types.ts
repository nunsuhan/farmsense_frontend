// TypeScript Type Definitions for FarmSense API

// ==================== Diagnosis Types ====================

export interface DiagnosisRequest {
  image: string; // Base64 or URI
  fclty_id?: string;
  temp_indoor?: number;
  humid_indoor?: number;
  co2_indoor?: number;
  lux_indoor?: number;
  ec_soil?: number;
  ph_soil?: number;
}

export interface DiagnosisResponse {
  id: number;
  image: string;
  disease_name: string;
  confidence: number;
  description: string;
  treatment: string;
  created_at: string;
  fclty_id?: string;
  temp_indoor?: number;
  humid_indoor?: number;
  co2_indoor?: number;
  consulting_text?: string;
}

export interface HybridDiagnosisRequest {
  image: string; // Base64
  farm_id?: string;
  include_prescription?: boolean;
}

export interface HybridDiagnosisResponse {
  success: boolean;
  diagnosis: {
    disease_code: string;
    disease_name: string;
    confidence: number;
    severity: string;
    top_3: {
      disease: string;
      confidence: number;
    }[];
  };
  prescription?: {
    summary: string;
    recommended_pesticides: any[];
    action_items: string[];
    prevention_tips: string[];
    sources: string[];
  };
  metadata: {
    model_version: string;
    inference_time_ms: number;
    rag_time_ms: number;
  };
}

export interface BatchDiagnosisRequest {
  images: string[]; // Array of Base64 or URIs
  fclty_id?: string;
}

export interface BatchDiagnosisResponse {
  results: DiagnosisResponse[];
  total_count: number;
  success_count: number;
  failed_count: number;
}

// ==================== Canopy & Yield Types ====================

export interface CanopyDiagnosisRequest {
  image: string;      // Base64
  farm_id: string;
  variety: string;    // e.g., 'shine_muscat'
  area_m2: number;
  growth_stage: string; // e.g., 'veraison'
}

export interface CanopyDiagnosisResponse {
  success: boolean;
  analysis_type: 'canopy';
  canopy_analysis: {
    estimated_lai: number;
    canopy_cover: number; // %
    canopy_cover_level: string; // '낮음' | '보통' | '양호' | '밀집'
    growth_stage: string;
  };
  yield_prediction: {
    predicted_yield_kg: number;
    confidence: number;
    lai_factor: number;
    message: string;
  };
  recommendations: {
    type: 'good' | 'warning';
    message: string;
  }[];
  image_path?: string;
}

// ==================== Community Types ====================

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Post {
  id: number;
  category: number;
  category_name?: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  comment_count: number;
  image?: string;
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export interface Comment {
  id: number;
  post: number;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  category: number;
  title: string;
  content: string;
  author: string;
  image?: string;
}

export interface CreateCommentRequest {
  author: string;
  content: string;
}

// ==================== Reverse Analysis Types ====================

export interface PrepareDataRequest {
  fclty_id: string;
  crpsn_sn: string;
  fixplntng_de: string; // YYYY-MM-DD
  crpsn_end_de: string; // YYYY-MM-DD
}

export interface PrepareDataResponse {
  success: boolean;
  period: {
    start: string;
    end: string;
  };
  data_counts: {
    sensor: number;
    environment: number;
    production: number;
    output: number;
  };
  data: {
    sensor_data: SensorData[];
    environment_data: EnvironmentData[];
    production_data: any[];
    output_data: any;
  };
}

export interface SensorData {
  id: number;
  fclty_id: string;
  temp_indoor?: number;
  humid_indoor?: number;
  co2_indoor?: number;
  sensor_meas_time: string;
}

export interface EnvironmentData {
  date: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  wind_speed?: number;
}

export interface AnalyzeRequest {
  fclty_id: string;
  crpsn_sn: string;
  target_production: number;
  fixplntng_de?: string;
  crpsn_end_de?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  target_production: number;
  recommended_conditions: {
    temperature: {
      min: number;
      max: number;
      optimal: number;
    };
    humidity: {
      min: number;
      max: number;
      optimal: number;
    };
    co2: {
      min: number;
      max: number;
      optimal: number;
    };
  };
  estimated_yield: number;
  confidence: number;
  notes: string[];
}

// ==================== Common Types ====================

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== Store Types ====================

export interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Facility info
  facilityId: string;
  setFacilityId: (id: string) => void;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  facilityId?: string;
  // Backend ProfileUpdateView GET 응답 필드 (commit 0b47912)
  username?: string;
  onboarding_completed?: boolean;
  kakao_report_enabled?: boolean;
}

// ==================== Q&A / RAG Types ====================

export interface QnAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: QnASource[];
}

export interface QnASource {
  title: string;
  content: string;
  url?: string;
}

export interface QnARequest {
  question: string;
  conversation_history?: Array<{
    role: string;
    content: string;
  }>;
}

export interface QnAResponse {
  answer: string;
  sources?: QnASource[];
  confidence?: number;
}

// ==================== FarmMap Types ====================

export interface Farm {
  id: string;
  name: string;
  owner: string;
  crop: string;
  variety: string;
  area: number | string;
  latitude?: number;
  longitude?: number;
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  address?: string;
  phone?: string;
  contact?: string;
  description?: string;
  production?: string;
  distance?: number;
  greenhouse_type?: string;
}

export interface NearbyFarmsRequest {
  lat: number;
  lon: number;
  radius?: number;
  crop?: string;
}

export interface NearbyFarmsResponse {
  count: number;
  radius: number;
  center: {
    latitude: number;
    longitude: number;
  };
  farms: Farm[];
}

// ==================== 고급 FarmMap Types ====================

export interface Field {
  pnu: string;                    // 필지고유번호
  fl_nm?: string;                 // 필지명 (논/밭/과수)
  fl_ar?: number;                 // 면적 (m²)
  sb_ldcg_cd?: string;            // 농경지분류코드 (01:논, 02:밭, 03:과수)
  crop?: string;                  // 작물
  variety?: string;               // 품종
  address: string;                // 주소
  distance?: number;              // 중심으로부터 거리 (m)
  coordinates?: [number, number][]; // 경계 좌표 [[lat, lon], ...]
  center?: {
    latitude: number;
    longitude: number;
  };
  boundary?: [number, number][];  // 상세 경계 좌표
  location?: {
    lat: number;
    lon: number;
  };
  field_type?: string;
  area?: number;
  owner?: string;
  crops?: string[];
  facilities?: string[];
  land_use?: string;
  official_price?: number;

  // 확장된 토양 정보 (물리적 + 화학적)
  soil?: {
    // 물리적 특성 (토양특성 API)
    type: string;                 // 토성 (사양토, 식양토 등)
    texture_code?: string;        // SL, CL 등
    drainage?: string;            // 배수 등급
    depth?: string;               // 토양 깊이
    erosion?: string;             // 침식등급
    terrain_type?: string;        // 분포지형

    // 화학적 특성 (토양검정 API) ⭐ 실측 데이터
    ph?: number;                  // 산도 (실측)
    organic_matter?: number;      // 유기물 (%) (실측)
    available_phosphorus?: number; // 유효인산 (mg/kg) (실측)
    potassium?: number;           // 칼륨 (cmol+/kg) (실측)
    calcium?: number;             // 칼슘 (cmol+/kg) (실측)
    magnesium?: number;           // 마그네슘 (cmol+/kg) (실측)
    ec?: number;                  // 전기전도도 (dS/m) (실측)

    // 검정 정보
    exam_date?: string;           // 검정일 (YYYYMMDD)
    exam_year?: string;           // 검정 연도
    exam_type?: string;           // 경지구분 (1:논, 2:밭, 3:시설, 4:과수)

    // 레거시 필드
    fertility?: string;           // 지력
    nitrogen?: string;            // 질소
    phosphorus?: string;          // 인산 (레거시)
  };

  // 확장된 지형 정보
  terrain?: {
    slope_degree?: number;        // 경사도 (각도)
    slope_category?: string;      // 경사 분류
    aspect?: string;              // 방향 (남향, 북향 등)
    aspect_degree?: number;       // 방향 각도
    elevation?: number;           // 해발 고도 (m)
    terrain_type?: string;        // 지형 형태
    flood_risk?: string;          // 침수 위험
  };

  // 재배 적합도
  suitability?: {
    grape_score?: number;         // 포도 재배 적합도 (0-100)
    rating?: string;              // 평가
    strengths?: string[];         // 장점
    limitations?: string[];       // 제약 요소
    recommendations?: string[];   // 추천 품종
  };

  // 관리 조언
  management_advice?: {
    irrigation?: string;          // 관수 조언
    fertilizer?: string;          // 비료 조언
    soil_improvement?: string;    // 토양 개량
    drainage?: string;            // 배수 조언
  };
}

export interface SearchByLocationRequest {
  lat: number;
  lon: number;
}

export interface SearchByLocationResponse {
  count: number;
  location: {
    latitude: number;
    longitude: number;
  };
  fields: Field[];
}

export interface SearchByPNURequest {
  pnu: string;
}

export interface SearchByPNUResponse {
  field: Field;
}

export interface SearchRadiusRequest {
  lat: number;
  lon: number;
  radius?: number;
  field_type?: '논' | '밭' | '과수';
}

export interface SearchRadiusResponse {
  count: number;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  field_type?: string;
  fields: Field[];
}

export interface FieldInfoResponse {
  field: Field;
}

// 내 농장 정보
export interface MyFarm {
  id?: string;
  pnu: string;
  name: string;
  field: Field;
  created_at?: Date;
  updated_at?: Date;
}

// ==================== Farm-Sector Map Integration Types ====================

export interface SyncSectorGeoResponse {
  success: boolean;
  farm_id: string | number;
  updated_fields: string[];
  address_info: {
    address: string;
    road_address?: string;
    region?: string;
  };
  center: {
    lat: number;
    lon: number;
  };
}

export interface SyncFarmGeoRequest {
  address: string;
}

export interface SyncFarmGeoResponse {
  success: boolean;
  farm_id: string | number;
  coordinates: {
    lat: number;
    lon: number;
  };
  display_type: 'pin' | 'boundary';
  message: string;
}

export interface FarmMapDataResponse {
  farm: {
    id: string | number;
    name: string;
    address: string;
    total_area?: number;
  };
  center: {
    lat: number;
    lon: number;
  };
  display_type: 'pin' | 'boundary';
  sectors: {
    id: string | number;
    name: string;
    sector_type: string;
    area: number;
    variety?: string;
    coordinates: [number, number][];
    has_boundary: boolean;
  }[];
}

export interface ReverseGeocodeResponse {
  success: boolean;
  address: string;
  road_address?: string;
  region?: string;
}

export interface GeocodeResponse {
  success: boolean;
  address: string;
  lat: number;
  lon: number;
}

// ==================== SmartFarm Types ====================

export interface CroppingSeason {
  statusCode?: string;
  statusMessage?: string;
  fcltyId: string;
  crpsnSn: number;
  fcltyYear: string;
  fixplntngDe: string;      // 작기 시작일
  crpsnEndDe: string;        // 작기 종료일
  ctvtAr: number;            // 재배 면적
  itemCode: string;          // 품목 코드
  itemCodeNm: string;        // 품목명
  spciesCode?: string;       // 품종 코드
  spciesCodeNm?: string;     // 품종명
}

export interface CroppingPrediction {
  facility_id: string;
  crpsn_sn: number;
  current_date: string;
  predicted_harvest_date: string;
  days_to_harvest: number;
  current_growth_stage: string;
  growth_progress: number;   // 0-100%
  confidence: number;         // 0-1
  recommendations: string[];
  environmental_summary: {
    avg_temperature: number;
    avg_humidity: number;
    avg_co2: number;
    total_solar_radiation: number;
    days: number;
  };
  growth_summary: {
    plant_height: number;
    leaf_count: number;
    fruit_weight: number;
    sugar_content: number;
    weeks: number;
  };
}

export interface PredictionRequest {
  facility_id: string;
  crpsn_sn: number;
  start_date: string;
  item_code?: string;
}

// ==================== Sensor & Graph Types ====================

export interface SensorCurrentResponse {
  success: boolean;
  data: {
    temperature: { value: number; unit: string; status: 'normal' | 'low' | 'high' };
    humidity: { value: number; unit: string; status: 'normal' | 'low' | 'high' };
    soil_moisture: { value: number; unit: string; status: 'normal' | 'low' | 'high' };
    soil_temperature?: { value: number; unit: string; status: 'normal' | 'low' | 'high' };
  };
  recorded_at: string;
  is_model_farm?: boolean;
  farm_code?: string;
  model_farm_info?: {
    name: string;
    score: number;
    grade: string;
  };
  message?: string;
  register_hint?: string;
}

export interface SensorGraphResponse {
  success: boolean;
  period: 'day' | 'week' | 'month';
  labels: string[];

  my_farm?: {
    farm_code?: string;
    name: string;
    color: string;
    is_model: boolean;
  };

  model_farm: {
    farm_code: string;
    name: string;
    color: string;
  };

  temperature: {
    my_farm?: {
      avg: number[];
      min: number[];
      max: number[];
    };
    model_farm: {
      avg: number[];
      min: number[];
      max: number[];
    };
    unit: string;
  };

  humidity?: {
    my_farm?: {
      avg: number[];
    };
    model_farm: {
      avg: number[];
    };
    unit: string;
  };

  comparison?: {
    temperature_diff: number;
    humidity_diff: number;
    insights: {
      type: 'good' | 'warning';
      message: string;
    }[];
  };
}

export interface SensorStatsResponse {
  success: boolean;
  today: {
    temperature: { avg: number; min: number; max: number };
    humidity: number;
    soil_moisture: number;
  };
  yesterday: {
    temperature: number;
    humidity: number;
  };
  week_avg: {
    temperature: number;
    humidity: number;
  };
  changes: {
    temp_vs_yesterday: number;
    humid_vs_yesterday: number;
  };
}

export interface SensorSettingsResponse {
  settings: {
    display_sensors: string[];
    alert_enabled: boolean;
    alert_thresholds: {
      temperature: { min: number; max: number };
      humidity: { min: number; max: number };
      soil_moisture: { min: number; max: number };
    };
    graph_default_period: 'day' | 'week' | 'month';
    refresh_interval: number;
  };
}
