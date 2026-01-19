// src/services/reverseAnalysisApi.ts

import apiClient from './api';
import { API_CONFIG } from '../constants/config';

export interface TargetAnalysisRequest {
  fclty_id: string;
  crpsn_sn: string;
  target_production: number;
  fixplntng_de?: string;
  crpsn_end_de?: string;
}

export interface OptimalCondition {
  min: number;
  max: number;
  optimal: number;
  current: number;
  gap: number;
}

export interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  action: string;
  method: string;
}

export interface AnalysisResult {
  success: boolean;
  target_production: number;
  current_analysis: {
    total_output: number;
    premium_ratio: number;
    income_per_kg: number;
    quality_score: number;
  };
  optimal_conditions: {
    temperature: OptimalCondition;
    humidity: OptimalCondition;
    co2: OptimalCondition;
    soil_moisture: OptimalCondition;
    lai_target: {
      peak_lai: number;
      current_lai: number;
      gap: number;
    };
  };
  recommendations: Recommendation[];
  benchmark: {
    similar_farms_avg: number;
    top_10_percent_avg: number;
    your_percentile: number;
  };
  // Optional for fallback compatibility
  notes?: string[];
  estimated_yield?: number;
  confidence?: number;
  recommended_conditions?: any;
}

export const reverseAnalysisApi = {
  // 데이터 준비
  prepareData: async (farmId: string, crpsnSn: string, dateRange?: { start: string, end: string }) => {
    const params: any = { fclty_id: farmId, crpsn_sn: crpsnSn };
    if (dateRange) {
      params.fixplntng_de = dateRange.start;
      params.crpsn_end_de = dateRange.end;
    }
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.REVERSE_ANALYSIS.PREPARE_DATA, {
      params
    });
    return response.data;
  },

  // 역분석 실행
  analyze: async (request: TargetAnalysisRequest): Promise<AnalysisResult> => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.REVERSE_ANALYSIS.ANALYZE, request);
    return response.data;
  },

  // 결과 저장 (향후 구현)
  saveResult: async (resultId: string, notes: string) => {
    // const response = await apiClient.post('/reverse-analysis/save/', {
    //   result_id: resultId,
    //   notes
    // });
    // return response.data;
    console.log('Save not implemented yet');
    return { success: true };
  }
};

export default reverseAnalysisApi;
