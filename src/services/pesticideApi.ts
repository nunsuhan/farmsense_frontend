// pesticideApi.ts - 농약 관련 API
import apiClient from './api';

// 인터페이스
export interface PesticideRecord {
  id: number;
  pesticide_name: string;
  brand_name: string;
  target_disease: string;
  application_date: string;
  phi_days: number;
  safe_harvest_date: string;
  days_until_safe: number;
  is_safe_to_harvest: boolean;
  notes: string;
  created_at: string;
}

export interface PHITimelineItem {
  pesticide_name: string;
  application_date: string;
  safe_harvest_date: string;
  phi_days: number;
  days_until_safe: number;
  is_safe: boolean;
  status: string;
}

export interface PHITimeline {
  can_harvest_now: boolean;
  earliest_safe_date: string | null;
  timeline: PHITimelineItem[];
  count: number;
}

export interface CreateRecordRequest {
  facility_id: string;
  pesticide_code: string;
  pesticide_name: string;
  brand_name: string;
  target_disease: string;
  application_date: string; // YYYY-MM-DD
  phi_days: number;
  application_area?: number;
  notes?: string;
}

// Pesticide API
export const pesticideApi = {
  // 농약 기록 생성
  createRecord: async (data: CreateRecordRequest) => {
    console.log('📡 [PesticideAPI] 농약 기록 생성:', data.pesticide_name);
    const response = await apiClient.post('/pesticide/record/', data);
    return response.data;
  },

  // 농약 기록 조회
  getRecords: async (facilityId: string, startDate?: string, endDate?: string) => {
    console.log('📡 [PesticideAPI] 농약 기록 조회:', facilityId);
    const params: any = { facility_id: facilityId };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get<{ count: number; records: PesticideRecord[] }>(
      '/pesticide/record/',
      { params }
    );
    return response.data;
  },

  // PHI 타임라인 조회
  getPHITimeline: async (facilityId: string): Promise<PHITimeline> => {
    console.log('📡 [PesticideAPI] PHI 타임라인 조회:', facilityId);
    try {
      const response = await apiClient.get<PHITimeline>(
        '/pesticide/timeline/',
        {
          params: { facility_id: facilityId },
          headers: { 'X-Skip-Global-Error': 'true' }
        }
      );
      return response.data;
    } catch (error) {
      console.warn('📡 [PesticideAPI] API unavailable, returning mock timeline.');
      return {
        can_harvest_now: true,
        earliest_safe_date: null,
        timeline: [],
        count: 0
      };
    }
  },

  // 농약 검색
  searchPesticides: async (cropName?: string, diseaseName?: string, brandName?: string) => {
    console.log('📡 [PesticideAPI] 농약 검색:', { cropName, diseaseName });
    const params: any = {};
    if (cropName) params.crop_name = cropName;
    if (diseaseName) params.disease_name = diseaseName;
    if (brandName) params.brand_name = brandName;

    const response = await apiClient.get('/pesticide/search/', { params });
    return response.data;
  },
};










