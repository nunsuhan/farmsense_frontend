// API Configuration
export const API_CONFIG = {
  // 메인 Django API (인증, 커뮤니티, 센서, 날씨 등)
  BASE_URL: 'https://farmsense.kr/api',
  // RAG 서버 (질의응답)
  RAG_URL: 'https://farmsense.kr/api',
  // 병해 진단 서버 (이미지 분석)
  DIAGNOSIS_URL: 'https://farmsense.kr/api',
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