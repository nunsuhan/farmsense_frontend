/**
 * GAP 비료 의사결정 API 서비스
 * 백엔드 GAPFertilizerDecisionService 연동
 *
 * API:
 *   POST /api/v1/farms/{farmId}/dss/gap/fertilizer/recommendations/
 *   POST /api/v1/farms/{farmId}/dss/gap/fertilizer/records/
 *   GET  /api/v1/farms/{farmId}/dss/gap/fertilizer/audit/
 */
import apiClient from './api';
import { API_CONFIG } from '../constants/config';

const EP = API_CONFIG.ENDPOINTS;

// ── 타입 정의 ──

export interface FertilizerRecommendation {
  fertilizer_name: string;
  amount_kg_per_ha: number;
  target_nutrient: string;
  deficiency_level: string;           // 'severe' | 'moderate' | 'mild'
  gap_compliance_score: number;       // 0~100
  safety_level: string;               // 'LOW_RISK' | 'MODERATE_RISK'
  phi_days: number;                   // 수확전간격
  rei_hours: number;                  // 재진입간격
  ppe_required: string[];             // 보호장비
  cost_per_ha: number;                // 원/ha
  application_method: string;
  application_timing: string;
}

export interface FertilizerRecommendationResponse {
  recommendations: FertilizerRecommendation[];
  nutrient_balance: {
    N: { required: number; applied: number; deficit: number; level: string };
    P: { required: number; applied: number; deficit: number; level: string };
    K: { required: number; applied: number; deficit: number; level: string };
    [key: string]: { required: number; applied: number; deficit: number; level: string };
  };
  growth_stage: string;
  growth_stage_timing: { month_range: number[]; priority: string; focus: string };
  gap_compliance_summary: {
    overall_score: number;
    checks_passed: number;
    checks_total: number;
  };
  total_cost_per_ha: number;
}

export interface FertilizerAuditResponse {
  period: { start_date: string; end_date: string };
  total_records: number;
  compliance_rate: number;            // 0~100
  issues: string[];
  certification_status: string;       // 'ready' | 'needs_improvement' | 'not_ready'
  recommendations: string[];
  records_summary: {
    fertilizer_name: string;
    total_amount_kg: number;
    application_count: number;
    last_applied: string;
  }[];
}

// ── API 함수 ──

export const gapFertilizerApi = {
  /**
   * GAP 준수 비료 추천 생성
   */
  getRecommendations: async (
    farmId: string | number,
    context?: {
      variety?: string;
      growth_stage?: string;
      target_yield?: number;
      area_ha?: number;
      symptoms?: string[];
      previous_fertilizations?: { name: string; amount_kg: number; date: string }[];
    },
  ): Promise<FertilizerRecommendationResponse> => {
    const res = await apiClient.post(
      EP.DSS.GAP_FERTILIZER_RECOMMENDATIONS(farmId),
      context || {},
    );
    // 백엔드가 {success, data} 래퍼를 사용
    return res.data?.data ?? res.data;
  },

  /**
   * GAP 준수 비료 사용 기록 생성
   */
  createRecord: async (
    farmId: string | number,
    record: {
      fertilizer_name: string;
      amount_kg: number;
      application_date: string;
      application_method?: string;
      manufacturer?: string;
      lot_number?: string;
      expiry_date?: string;
    },
  ): Promise<any> => {
    const res = await apiClient.post(
      EP.DSS.GAP_FERTILIZER_RECORDS(farmId),
      record,
    );
    return res.data?.data ?? res.data;
  },

  /**
   * GAP 감사 보고서 조회
   */
  getAudit: async (
    farmId: string | number,
    startDate?: string,
    endDate?: string,
  ): Promise<FertilizerAuditResponse> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await apiClient.get(EP.DSS.GAP_FERTILIZER_AUDIT(farmId), { params });
    return res.data?.data ?? res.data;
  },
};

export default gapFertilizerApi;
