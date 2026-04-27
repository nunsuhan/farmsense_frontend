// authApi.ts - 인증 관련 API
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_CONFIG } from '../constants/config';
import { setAuthTokens, getAuthTokens, clearAuthTokens } from '../utils/secureStorage';

// Storage 키 (User Info 등 기타 정보용)
// const TOKEN_KEY = '@farmsense_token'; // Deprecated in favor of Keychain
// const REFRESH_TOKEN_KEY = '@farmsense_refresh_token'; // Deprecated

// 인터페이스
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
  address?: string;
  facilityId?: string;
}

export interface UserProfileExtended {
  phone?: string;
  profile_image?: string;
  zip_code?: string;
  address?: string;
  address_detail?: string;
  sido?: string;
  sigungu?: string;
  farm_name?: string;
  crop_type?: string;
  variety?: string;
  cultivation_area?: number;
  cultivation_type?: string;
  vine_age?: number;
  latitude?: number;
  longitude?: number;
  pnu?: string;
  soil_ph?: number;
  soil_type?: string;
  organic_matter?: number;
  social_provider?: string;
  push_enabled?: boolean;
  sms_enabled?: boolean;
  is_profile_complete?: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  name?: string; // 소셜 로그인용
  profile_image?: string; // 프로필 이미지
  profile?: UserProfileExtended; // 확장 프로필
  // Backend ProfileUpdateView GET 응답 필드 (commit 0b47912 — Issue #4)
  onboarding_completed?: boolean;
  kakao_report_enabled?: boolean;
}

export interface SocialLoginRequest {
  provider: 'google' | 'kakao' | 'naver';
  access_token: string;
  id_token?: string; // 구글용
  user_info?: {
    email: string;
    name: string;
    picture?: string;
  };
}

// 토큰 저장 (Keychain 사용)
export const saveTokens = async (access: string, refresh: string) => {
  await setAuthTokens(access, refresh);
};

// 토큰 가져오기 (Keychain 사용)
export const getAccessToken = async (): Promise<string | null> => {
  const tokens = await getAuthTokens();
  return tokens?.access || null;
};

export const getRefreshToken = async (): Promise<string | null> => {
  const tokens = await getAuthTokens();
  return tokens?.refresh || null;
};

// 토큰 삭제 (Keychain 사용)
export const clearTokens = async () => {
  await clearAuthTokens();
};

// Auth API
export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('🔐 [authApi] 로그인 요청:', data.email);
    const response = await apiClient.post<LoginResponse>('/auth/login/', {
      username: data.email, // Django는 username 필드 사용
      password: data.password,
    });

    console.log('📦 [authApi] 로그인 응답:', response.data);
    console.log('✅ [authApi] access 토큰:', response.data.access ? '있음' : '없음');
    console.log('✅ [authApi] refresh 토큰:', response.data.refresh ? '있음' : '없음');

    // 토큰 저장
    if (response.data.access && response.data.refresh) {
      await saveTokens(response.data.access, response.data.refresh);
      console.log('💾 [authApi] 토큰 저장 완료');
    } else {
      console.error('❌ [authApi] 토큰이 응답에 없습니다!');
      throw new Error('로그인 응답에 refresh 토큰이 없습니다. 서버를 확인해주세요.');
    }

    return response.data;
  },

  // 회원가입
  register: async (data: RegisterRequest) => {
    console.log('📡 [authApi] register() 호출됨');

    // Django User 모델 규격에 맞춰 데이터 전송
    const response = await apiClient.post('/auth/register/', {
      username: data.email, // 이메일을 username으로 사용
      first_name: data.name,
      email: data.email,
      password: data.password,
      password_confirm: data.passwordConfirm,
      profile: {
        phone: data.phone || '',
        address: data.address || ''
      }
    });

    console.log('✅ [authApi] 회원가입 응답:', response.data);

    // 회원가입 후 바로 토큰이 오는지, 아니면 로그인이 필요한지 확인 필요
    // 보통 회원가입 후 로그인을 별도로 하거나, 토큰을 바로 줄 수 있음
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.warn('⚠️ [authApi] 로그아웃 API 호출 실패 (무시하고 로컬 데이터 삭제 진행):', error);
    } finally {
      // 로컬 토큰 삭제 (API 실패 여부와 상관없이 실행)
      await clearTokens();
      console.log('✅ [authApi] 로컬 토큰 삭제 완료');
    }
  },

  // 토큰 갱신
  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await apiClient.post<{ access: string }>('/auth/refresh/', {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      // Refresh token usually stays the same unless rotated
      await setAuthTokens(newAccessToken, refreshToken);
      return newAccessToken;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      await clearTokens();
      return null;
    }
  },

  // 사용자 프로필 조회
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/profile/update/');
    return response.data;
  },

  // 사용자 프로필 수정
  updateProfile: async (data: any): Promise<any> => {
    console.log('📡 [authApi] 프로필 업데이트:', data);
    // REMARK: The backend now expects a flat structure
    const response = await apiClient.put('/users/profile/update/', data);
    return response.data;
  },

  // 확장 프로필 업데이트 (전화번호, 주소, 농장정보 등)
  // Legacy support or alias to updateProfile with mapping if needed
  updateExtendedProfile: async (data: Partial<UserProfileExtended>): Promise<UserProfile> => {
    console.log('📡 [authApi] 확장 프로필 업데이트 (Wrapper):', data);

    // Map keys if necessary. The existing UserProfileExtended uses 'phone', backend expects 'phone_number'.
    const payload: any = { ...data };
    if (data.phone) {
      payload.phone_number = data.phone;
      delete payload.phone;
    }
    // If address/region fields need mapping, add here. Assuming 'address' maps to 'address' or similar.

    const response = await apiClient.put('/users/profile/update/', payload);
    return response.data;
  },

  // 전체 프로필 정보 조회 (사용자 + 확장 프로필)
  getFullProfile: async (): Promise<UserProfile> => {
    console.log('📡 [authApi] 전체 프로필 조회');
    const response = await apiClient.get<UserProfile>('/users/profile/update/');
    console.log('✅ [authApi] 프로필 응답:', response.data);
    return response.data;
  },

  // 초기 설정 완료 (회원가입 후 필수 설정 플로우 끝 시점)
  completeOnboarding: async (): Promise<{ success: boolean; onboarding_completed: boolean }> => {
    const response = await apiClient.post('/users/onboarding/complete/');
    return response.data;
  },

  // 카카오톡 보고서 수신 토글 (ProfileUpdateView.PATCH 경유)
  setKakaoReportEnabled: async (enabled: boolean): Promise<any> => {
    const response = await apiClient.patch('/users/profile/update/', {
      kakao_report_enabled: enabled,
    });
    return response.data;
  },

  // 비밀번호 재설정 (이메일로 임시 비밀번호 발송 — Issue #1-3)
  // 백엔드: POST /api/users/reset-password/ → PasswordResetRequestView (SendGrid)
  resetPassword: async (email: string): Promise<{ success?: boolean; message: string }> => {
    const response = await apiClient.post('/users/reset-password/', { email });
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (currentPassword: string, newPassword: string, _confirmPassword?: string) => {
    // Note: Backend API doesn't require confirm password, validation should be done on client
    const response = await apiClient.post('/users/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // 소셜 로그인
  socialLogin: async (data: SocialLoginRequest): Promise<LoginResponse> => {
    console.log('📡 [authApi] socialLogin() 호출됨');
    console.log('📤 [authApi] 소셜 로그인 요청:', {
      provider: data.provider,
      user_info: data.user_info,
    });

    const response = await apiClient.post<LoginResponse>('/auth/social/', {
      provider: data.provider,
      access_token: data.access_token,
      id_token: data.id_token,
      user_info: data.user_info,
    });

    console.log('✅ [authApi] 소셜 로그인 응답:', response.data);

    // 토큰 저장
    if (response.data.access && response.data.refresh) {
      await saveTokens(response.data.access, response.data.refresh);
    }

    return response.data;
  },
};

export default authApi;

