/**
 * 통합 진단 API - 이미지 진단 + RAG 연동
 */
import apiClient from './api';
import { API_CONFIG } from '../constants/config';

export interface DiagnosisItem {
  category: string;
  name: string;
  name_ko: string;
  confidence: number;
}

export interface IntegratedDiagnosisResponse {
  status: string;
  farm_id: string;
  variety: DiagnosisItem[];
  disease: DiagnosisItem[];
  physiological: DiagnosisItem[];
  pesticide: DiagnosisItem[];
  risk_assessment: { level: string; score: number; recommendations: string[] };
  rag_response?: { answer: string; sources: string[]; confidence: number };
  processing_time_ms: number;
}

export interface HealthCheckResponse {
  status: string;
  services: { django: boolean; diagnosis: any; rag: boolean; cache: boolean };
  version: string;
  concurrency: { active_requests: number; is_busy: boolean; estimated_wait_seconds: number };
}

// 통합 진단
export const integratedDiagnosis = async (
  imageUri: string,
  options?: { farm_id?: string; user_query?: string }
): Promise<IntegratedDiagnosisResponse> => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'diagnosis.jpg';
  formData.append('image', { uri: imageUri, type: 'image/jpeg', name: filename } as any);
  if (options?.farm_id) formData.append('farm_id', options.farm_id);
  if (options?.user_query) formData.append('user_query', options.user_query);

  const response = await apiClient.post(API_CONFIG.ENDPOINTS.DIAGNOSIS.INTEGRATED, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

// 헬스체크
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.DIAGNOSIS.HEALTH);
  return response.data;
};

// 대기열 상태
export const getQueueStatus = async () => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.DIAGNOSIS.QUEUE_STATUS);
  return response.data;
};

export default { integratedDiagnosis, checkHealth, getQueueStatus };
