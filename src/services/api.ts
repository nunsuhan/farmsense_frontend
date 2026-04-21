// Axios API Client Configuration
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants/config';
import { ApiError } from '../types/api.types';
import { getAuthTokens, setAuthTokens, clearAuthTokens } from '../utils/secureStorage';

// 토큰 관리 함수 (SecureStorage 사용)
const getAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = await getAuthTokens();
    return tokens?.access || null;
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    const tokens = await getAuthTokens();
    return tokens?.refresh || null;
  } catch (error) {
    console.error('리프레시 토큰 가져오기 실패:', error);
    return null;
  }
};

const saveTokens = async (access: string, refresh: string) => {
  try {
    await setAuthTokens(access, refresh);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
};

const clearTokens = async () => {
  try {
    await clearAuthTokens();
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
  }
};

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('[API] ===== 요청 시작 =====');
    console.log('[API] Method:', config.method?.toUpperCase());
    console.log('[API] URL:', (config.baseURL || '') + (config.url || ''));

    // 로그인, 회원가입, 토큰갱신은 토큰 제외
    const publicEndpoints = ['/auth/login/', '/auth/register/', '/auth/refresh/', '/v1/auth/phone/send/', '/v1/auth/phone/verify/'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] 토큰 추가됨');
      } else {
        console.log('[API] 토큰 없음');
      }
    } else {
      console.log('[API] 공개 엔드포인트 - 토큰 제외');
    }

    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - 토큰 갱신 처리
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('[API]', response.config.url, response.status);
    }

    // HTML 응답 감지 (서버 주소 오류)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('❌ [API] HTML 응답 감지 - 서버 주소 오류!');
      throw new Error('서버 주소 오류: API 서버가 HTML을 반환했습니다.');
    }

    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.log('[API] 에러:', error.config?.url, error.response?.status || 'network');
    }

    const originalRequest: any = error.config;

    // 401 에러 && 토큰 갱신 시도 가능한 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 로그인 요청 자체의 401은 토큰 갱신하지 않음
      if (originalRequest.url?.includes('/auth/login/')) {
        // 로그인 실패는 그냥 통과
      } else {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          await saveTokens(newAccessToken, refreshToken);

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          await clearTokens();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // 일반 에러 처리
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status,
      details: error.response?.data,
    };

    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.trim().startsWith('<!DOCTYPE')) {
      apiError.message = '서버 설정 오류: API 주소가 잘못되었거나 서버에서 HTML을 반환했습니다.';
    } else if (error.response) {
      const data = error.response.data as any;
      let customMessage = data?.message || data?.detail;

      if (!customMessage && typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstError = data[firstKey];
          if (Array.isArray(firstError)) {
            customMessage = `${firstKey}: ${firstError[0]}`;
          } else if (typeof firstError === 'string') {
            customMessage = `${firstKey}: ${firstError}`;
          }
        }
      }

      apiError.message = customMessage || `Server error: ${error.response.status}`;
      apiError.status = error.response.status;
      if (error.response.data) {
        apiError.details = error.response.data;
      }
    } else if (error.request) {
      apiError.message = '서버 응답이 없습니다. 네트워크 연결을 확인해주세요.';
    } else {
      apiError.message = error.message || '요청 중 오류가 발생했습니다.';
    }

    // HTML 응답 에러는 글로벌 에러바에 표시 안함
    const isHtmlError = error.response?.headers['content-type']?.includes('text/html') ||
      (typeof error.response?.data === 'string' && error.response.data.trim().startsWith('<!DOCTYPE'));

    const skipGlobalError = error.config?.headers?.['X-Skip-Global-Error'] || (error.config as any)?.skipGlobalError;

    if (!isHtmlError && !skipGlobalError) {
      try {
        const { useStore } = require('../store/useStore');
        useStore.getState().setError(apiError.message);
      } catch (e) {
        console.warn('Failed to set global error:', e);
      }
    }

    return Promise.reject(apiError);
  }
);

// Helper function to create FormData for file uploads
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  return formData;
};

// Helper function to handle file uploads
export const uploadFile = async (
  url: string,
  file: File | Blob,
  additionalData?: Record<string, any>
) => {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
  }

  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default apiClient;