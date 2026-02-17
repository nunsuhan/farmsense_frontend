// API Configuration
// 개발 환경에서는 로컬 서버(127.0.0.1:8080) 사용
// 운영 환경에서는 farmsense.kr 사용
const IS_DEV = process.env.NODE_ENV === 'development' || 
               process.env.EXPO_PUBLIC_DEV_MODE === 'true' ||
               typeof __DEV__ !== 'undefined' && __DEV__;

export const API_CONFIG = {
  // 메인 Django API (인증, 커뮤니티, 센서, 날씨 등)
  BASE_URL: IS_DEV ? 'http://127.0.0.1:8080/api' : 'https://farmsense.kr/api',
  // RAG 서버 (질의응답)
  RAG_URL: IS_DEV ? 'http://127.0.0.1:8080/api' : 'https://farmsense.kr/api',
  // 병해 진단 서버 (이미지 분석)
  DIAGNOSIS_URL: IS_DEV ? 'http://127.0.0.1:8080/api' : 'https://farmsense.kr/api',
  TIMEOUT: 30000,
  ENDPOINTS: {
    DIAGNOSIS: {
      CREATE: '/diagnosis/diagnoses/',
      LIST: '/diagnosis/diagnoses/',
      DETAIL: (id: string | number) => '/diagnosis/diagnoses/' + id + '/',
      BATCH_DIAGNOSE: '/diagnosis/diagnoses/batch_diagnose/',
      INTEGRATED: '/diagnosis/hybrid/',
      HYBRID: '/diagnosis/hybrid/',
      CANOPY: '/diagnosis/canopy/',
      HEALTH: '/diagnosis/health/',
      QUEUE_STATUS: '/diagnosis/queue-status/',
    },
    DSS: {
      IRRIGATION: (farmId: string | number) => `/v1/dss/farms/${farmId}/irrigation/`,
      FERTILIZER: (farmId: string | number) => `/v1/dss/farms/${farmId}/fertilizer/`,
      GROWTH_STAGE: (farmId: string | number) => `/v1/dss/farms/${farmId}/growth-stage/`,
      GAP_FERTILIZER_RECOMMENDATIONS: (farmId: string | number) => `/disease/farms/${farmId}/dss/gap/fertilizer/recommendations/`,
      GAP_FERTILIZER_RECORDS: (farmId: string | number) => `/disease/farms/${farmId}/dss/gap/fertilizer/records/`,
      GAP_FERTILIZER_AUDIT: (farmId: string | number) => `/disease/farms/${farmId}/dss/gap/fertilizer/audit/`,
    },
    RAG: {
      ASK: '/rag/ask/',
      SMART: '/rag/smart/',
      ENHANCED: '/rag/enhanced/',
    },
    NONGSARO: {
      VARIETIES_GRAPE: '/nongsaro/varieties/grape/',
      SCHEDULES_GRAPE: '/nongsaro/schedules/grape/',
      DISASTERS_GRAPE: '/nongsaro/disasters/grape/',
      SEARCH: '/nongsaro/search/',
    },
    SPRAY: {
      HISTORY: (farmId: number) => `/pesticide/spray/history/${farmId}/`,
      QUICK: '/pesticide/spray/quick/',
      START: '/pesticide/spray/start/',
      DATA: '/pesticide/spray/data/',
      END: '/pesticide/spray/end/',
      INVENTORY: (farmId: number) => `/pesticide/inventory/${farmId}/`,
      BARCODE_SCAN: '/pesticide/barcode/scan/',
    },
    DISEASE_PREDICTION: {
      REALTIME: (farmId: number) => `/disease/farms/${farmId}/disease/realtime/`,
      AUTO: (farmId: number) => `/disease/farms/${farmId}/disease/auto/`,
      QUICK: (farmId: number) => `/disease/farms/${farmId}/disease/quick/`,
      FULL: (farmId: number) => `/disease/farms/${farmId}/disease/full/`,
      SEASON: (farmId: number) => `/disease/farms/${farmId}/disease/season/`,
    },
    TODAY: {
      VIEW: (farmId: string) => `/v2/today/${farmId}/`,
    },
    MQTT: {
      LATEST: (farmId: string) => `/mqtt/latest/${farmId}/`,
    },
    COMMUNITY: {
      CATEGORIES: '/community/categories/',
      POSTS: '/community/posts/',
      POST_DETAIL: (id: string | number) => '/community/posts/' + id + '/',
      COMMENTS: (postId: string | number) => '/community/posts/' + postId + '/comments/',
      COMMENT_DETAIL: (postId: string | number, commentId: string | number) => '/community/posts/' + postId + '/comments/' + commentId + '/',
    },
    REVERSE_ANALYSIS: {
      BASE: '/reverse-analysis/',
      PREPARE_DATA: '/reverse-analysis/prepare_data/',
      ANALYZE: '/reverse-analysis/analyze/',
    },
    GAP: {
      SOIL_TESTS: '/trace/gap/soil-tests/',
      SOIL_TESTS_FARM: (farmId: number) => `/trace/gap/soil-tests/${farmId}/`,
      WATER_TESTS: '/trace/gap/water-tests/',
      WATER_TESTS_FARM: (farmId: number) => `/trace/gap/water-tests/${farmId}/`,
      FERTILIZER_RECORDS: '/trace/gap/fertilizer-records/',
      FERTILIZER_RECORDS_FARM: (farmId: number) => `/trace/gap/fertilizer-records/${farmId}/`,
      HARVEST_RECORDS: (farmId: number) => `/trace/gap/harvest-records/${farmId}/`,
      DAILY_LOGS: (farmId: number) => `/trace/gap/daily-logs/${farmId}/`,
      TRAINING_RECORDS: (farmId: number) => `/trace/gap/training-records/${farmId}/`,
      SEAL: '/trace/gap/seal/',
      SEAL_VERIFY: (hash: string) => `/trace/gap/seal/${hash}/`,
      EXPORT_PREP: (farmId: number) => `/trace/gap/export-prep/${farmId}/`,
    },
    TRACE: {
      RECORD: '/trace/record/',
      RECORD_DETAIL: (hash: string) => `/trace/record/${hash}/`,
      HISTORY: (farmId: number) => `/trace/history/${farmId}/`,
      HISTORY_LOT: (farmId: number, lotId: string) => `/trace/history/${farmId}/lot/${lotId}/`,
      QR_VERIFY: (qrCode: string) => `/trace/verify/${qrCode}/`,
      SEAL: '/trace/seal/',
      SEAL_DETAIL: (hash: string) => `/trace/seal/${hash}/`,
      SEAL_REPORT: (hash: string) => `/trace/seal/${hash}/report/`,
      PERIOD_REPORT: '/trace/report/period/',
    },
  },
};
export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  QUALITY: 0.8,
};
export const APP_CONFIG = {
  APP_NAME: 'FarmSense',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@farmsense.com',
};