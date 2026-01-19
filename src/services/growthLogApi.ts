/**
 * 성장 일지 API 서비스
 */

import api from './api';

// 성장 단계 타입
export type GrowthStage =
  | 'PLANTING'     // 정식
  | 'SPROUTING'    // 발아
  | 'VEGETATIVE'   // 영양생장
  | 'FLOWERING'    // 개화
  | 'FRUIT_SET'    // 착과
  | 'FRUIT_GROWTH' // 과실비대
  | 'COLORING'     // 착색
  | 'HARVEST'      // 수확
  | 'PRUNING'      // 전정
  | 'OTHER';       // 기타

// 성장 일지 인터페이스
export interface GrowthLog {
  id: number;
  user: number;
  user_username: string;
  farm: number;
  farm_name: string;
  log_date: string; // YYYY-MM-DD
  title: string;
  content: string;
  photo: string | null;
  photo_url: string | null;
  growth_stage: GrowthStage;
  growth_stage_display: string;
  weather: string;
  temperature: number | null;
  created_at: string;
  updated_at: string;
}

// 성장 일지 목록 항목 (간단한 버전)
export interface GrowthLogListItem {
  id: number;
  log_date: string;
  title: string;
  photo_url: string | null;
  growth_stage: GrowthStage;
  growth_stage_display: string;
  created_at: string;
}

// 성장 일지 생성 요청
export interface CreateGrowthLogRequest {
  farm: number;
  log_date: string;
  title: string;
  content?: string;
  photo?: File | any; // React Native의 이미지 객체
  growth_stage?: GrowthStage;
  weather?: string;
  temperature?: number;
}

// 성장 일지 수정 요청
export interface UpdateGrowthLogRequest {
  log_date?: string;
  title?: string;
  content?: string;
  photo?: File | any;
  growth_stage?: GrowthStage;
  weather?: string;
  temperature?: number;
}

// API 응답 타입
export interface GrowthLogListResponse {
  success: boolean;
  count: number;
  data: GrowthLogListItem[];
}

export interface GrowthLogDetailResponse {
  success: boolean;
  data: GrowthLog;
}

export interface GrowthLogCreateResponse {
  success: boolean;
  message: string;
  data: GrowthLog;
}

export interface GrowthLogUpdateResponse {
  success: boolean;
  message: string;
  data: GrowthLog;
}

export interface GrowthLogDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * 성장 일지 목록 조회 (최신순)
 */
export const getGrowthLogs = async (): Promise<GrowthLogListResponse> => {
  console.log('📋 [GrowthLog] 성장 일지 목록 조회');
  try {
    const response = await api.get<GrowthLogListResponse>('/farms/logs/');
    console.log('✅ [GrowthLog] 목록 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 성장 일지 상세 조회
 */
export const getGrowthLogDetail = async (id: number): Promise<GrowthLogDetailResponse> => {
  console.log(`📋 [GrowthLog] 성장 일지 상세 조회: ${id}`);
  try {
    const response = await api.get<GrowthLogDetailResponse>(`/farms/logs/${id}/`);
    console.log('✅ [GrowthLog] 상세 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 성장 일지 생성 (사진 업로드 포함)
 */
export const createGrowthLog = async (data: CreateGrowthLogRequest): Promise<GrowthLogCreateResponse> => {
  console.log('📝 [GrowthLog] 성장 일지 생성:', data);

  try {
    // FormData 생성 (사진 업로드를 위해)
    const formData = new FormData();

    formData.append('farm', data.farm.toString());
    formData.append('log_date', data.log_date);
    formData.append('title', data.title);

    if (data.content) {
      formData.append('content', data.content);
    }

    if (data.growth_stage) {
      formData.append('growth_stage', data.growth_stage);
    }

    if (data.weather) {
      formData.append('weather', data.weather);
    }

    if (data.temperature !== undefined) {
      formData.append('temperature', data.temperature.toString());
    }

    // 사진 첨부
    if (data.photo) {
      const photo = data.photo as any;
      formData.append('photo', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || 'photo.jpg',
      } as any);
    }

    const response = await api.post<GrowthLogCreateResponse>('/farms/logs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ [GrowthLog] 생성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 생성 실패:', error);
    throw error;
  }
};

/**
 * 성장 일지 수정
 */
export const updateGrowthLog = async (
  id: number,
  data: UpdateGrowthLogRequest
): Promise<GrowthLogUpdateResponse> => {
  console.log(`📝 [GrowthLog] 성장 일지 수정: ${id}`, data);

  try {
    // FormData 생성
    const formData = new FormData();

    if (data.log_date) {
      formData.append('log_date', data.log_date);
    }

    if (data.title) {
      formData.append('title', data.title);
    }

    if (data.content) {
      formData.append('content', data.content);
    }

    if (data.growth_stage) {
      formData.append('growth_stage', data.growth_stage);
    }

    if (data.weather) {
      formData.append('weather', data.weather);
    }

    if (data.temperature !== undefined) {
      formData.append('temperature', data.temperature.toString());
    }

    // 사진 첨부
    if (data.photo) {
      const photo = data.photo as any;
      formData.append('photo', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || 'photo.jpg',
      } as any);
    }

    const response = await api.patch<GrowthLogUpdateResponse>(`/farms/logs/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ [GrowthLog] 수정 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 수정 실패:', error);
    throw error;
  }
};

/**
 * 성장 일지 삭제
 */
export const deleteGrowthLog = async (id: number): Promise<GrowthLogDeleteResponse> => {
  console.log(`🗑️ [GrowthLog] 성장 일지 삭제: ${id}`);

  try {
    const response = await api.delete<GrowthLogDeleteResponse>(`/farms/logs/${id}/`);
    console.log('✅ [GrowthLog] 삭제 성공');
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 삭제 실패:', error);
    throw error;
  }
};

/**
 * 특정 농장의 성장 일지 조회
 */
export const getGrowthLogsByFarm = async (farmId: number): Promise<GrowthLogListResponse> => {
  console.log(`📋 [GrowthLog] 농장별 성장 일지 조회: ${farmId}`);

  try {
    const response = await api.get<GrowthLogListResponse>(`/farms/logs/`, {
      params: { farm: farmId },
    });
    console.log('✅ [GrowthLog] 농장별 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 농장별 조회 실패:', error);
    throw error;
  }
};

/**
 * 날짜 범위로 성장 일지 조회
 */
export const getGrowthLogsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<GrowthLogListResponse> => {
  console.log(`📋 [GrowthLog] 날짜 범위 성장 일지 조회: ${startDate} ~ ${endDate}`);

  try {
    const response = await api.get<GrowthLogListResponse>(`/farms/logs/`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    console.log('✅ [GrowthLog] 날짜 범위 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 날짜 범위 조회 실패:', error);
    throw error;
  }
};

/**
 * 성장 단계별 성장 일지 조회
 */
export const getGrowthLogsByStage = async (stage: GrowthStage): Promise<GrowthLogListResponse> => {
  console.log(`📋 [GrowthLog] 성장 단계별 조회: ${stage}`);

  try {
    const response = await api.get<GrowthLogListResponse>(`/farms/logs/`, {
      params: { growth_stage: stage },
    });
    console.log('✅ [GrowthLog] 성장 단계별 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [GrowthLog] 성장 단계별 조회 실패:', error);
    throw error;
  }
};

export default {
  getGrowthLogs,
  getGrowthLogDetail,
  createGrowthLog,
  updateGrowthLog,
  deleteGrowthLog,
  getGrowthLogsByFarm,
  getGrowthLogsByDateRange,
  getGrowthLogsByStage,
};









