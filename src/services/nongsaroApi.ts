/**
 * 농사로 OpenAPI Service - 품종, 일정, 재해예방
 */
import apiClient from './api';
import { API_CONFIG } from '../constants/config';

export interface VarietyInfo {
  content_no: string;
  name: string;
  crop_name: string;
  breeding_year: string;
  main_characteristics: string;
  image_url?: string;
}

export interface WorkSchedule {
  operation_name: string;
  begin_month: string;
  begin_era: string;
  end_month: string;
  end_era: string;
}

// 포도 품종 조회
export const getGrapeVarieties = async (keyword?: string) => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.NONGSARO.VARIETIES_GRAPE, {
    params: keyword ? { keyword } : {},
  });
  return response.data;
};

// 포도 농작업 일정
export const getGrapeSchedules = async () => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.NONGSARO.SCHEDULES_GRAPE);
  return response.data;
};

// 현재 월 농작업
export const getCurrentMonthTasks = async (): Promise<WorkSchedule[]> => {
  const { schedules } = await getGrapeSchedules();
  const month = new Date().getMonth() + 1;
  return schedules.filter((s: WorkSchedule) => {
    const begin = parseInt(s.begin_month);
    const end = parseInt(s.end_month);
    return begin <= end ? (month >= begin && month <= end) : (month >= begin || month <= end);
  });
};

// 재해예방 정보
export const getGrapeDisasters = async (keyword?: string) => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.NONGSARO.DISASTERS_GRAPE, {
    params: keyword ? { keyword } : {},
  });
  return response.data;
};

// 통합 검색
export const searchNongsaro = async (query: string) => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.NONGSARO.SEARCH, {
    params: { q: query },
  });
  return response.data;
};

export default { getGrapeVarieties, getGrapeSchedules, getCurrentMonthTasks, getGrapeDisasters, searchNongsaro };
