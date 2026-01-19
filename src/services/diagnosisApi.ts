// Diagnosis API Service
import axios from 'axios';
import apiClient from './api';
import { API_CONFIG } from '../constants/config';
import {
  DiagnosisRequest,
  DiagnosisResponse,
  BatchDiagnosisRequest,
  BatchDiagnosisResponse,
  PaginatedResponse,
  HybridDiagnosisRequest,
  HybridDiagnosisResponse,
  CanopyDiagnosisRequest,
  CanopyDiagnosisResponse,
} from '../types/api.types';

// 진단 전용 클라이언트 (8002 포트)
const diagnosisClient = axios.create({
  baseURL: API_CONFIG.DIAGNOSIS_URL,
  timeout: 60000, // 이미지 분석은 시간이 더 걸릴 수 있음
});

/**
 * Create a new diagnosis by uploading an image
 */
export const createDiagnosis = async (
  data: DiagnosisRequest
): Promise<DiagnosisResponse> => {
  const formData = new FormData();

  // Handle image upload
  if (data.image.startsWith('data:')) {
    formData.append('image', data.image);
  } else {
    const filename = data.image.split('/').pop() || 'image.jpg';
    formData.append('image', {
      uri: data.image,
      type: 'image/jpeg',
      name: filename,
    } as any);
  }

  if (data.fclty_id) formData.append('fclty_id', data.fclty_id);
  if (data.temp_indoor) formData.append('temp_indoor', data.temp_indoor.toString());
  if (data.humid_indoor) formData.append('humid_indoor', data.humid_indoor.toString());
  if (data.co2_indoor) formData.append('co2_indoor', data.co2_indoor.toString());
  if (data.lux_indoor) formData.append('lux_indoor', data.lux_indoor.toString());
  if (data.ec_soil) formData.append('ec_soil', data.ec_soil.toString());
  if (data.ph_soil) formData.append('ph_soil', data.ph_soil.toString());

  const response = await diagnosisClient.post<DiagnosisResponse>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.CREATE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Create a new INTEGRATED diagnosis
 */
export const createIntegratedDiagnosis = async (
  data: DiagnosisRequest
): Promise<DiagnosisResponse> => {
  const formData = new FormData();

  if (data.image.startsWith('data:')) {
    formData.append('image', data.image);
  } else {
    const filename = data.image.split('/').pop() || 'image.jpg';
    formData.append('image', {
      uri: data.image,
      type: 'image/jpeg',
      name: filename,
    } as any);
  }

  if (data.fclty_id) formData.append('fclty_id', data.fclty_id);
  if (data.temp_indoor) formData.append('temp_indoor', data.temp_indoor.toString());
  if (data.humid_indoor) formData.append('humid_indoor', data.humid_indoor.toString());

  const response = await diagnosisClient.post<DiagnosisResponse>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.INTEGRATED,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Create Hybrid Diagnosis (Vision + RAG)
 * Supports 'diagnosis' and 'growth_log' modes
 */
export const createHybridDiagnosis = async (
  data: HybridDiagnosisRequest & { upload_type?: 'diagnosis' | 'growth_log' }
): Promise<HybridDiagnosisResponse> => {
  const response = await diagnosisClient.post<HybridDiagnosisResponse>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.HYBRID,
    data
  );
  return response.data;
};

/**
 * [NEW] Create Canopy Diagnosis & Yield Prediction
 */
export const createCanopyDiagnosis = async (
  data: CanopyDiagnosisRequest
): Promise<CanopyDiagnosisResponse> => {
  const response = await diagnosisClient.post<CanopyDiagnosisResponse>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.CANOPY,
    data
  );
  return response.data;
};

/**
 * Get list of all diagnoses (메인 서버에서 조회)
 */
export const getDiagnoses = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<DiagnosisResponse>> => {
  const response = await apiClient.get<PaginatedResponse<DiagnosisResponse>>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.LIST,
    {
      params: { page, page_size: pageSize },
    }
  );
  return response.data;
};

/**
 * Get a single diagnosis by ID
 */
export const getDiagnosisById = async (
  id: number
): Promise<DiagnosisResponse> => {
  const response = await apiClient.get<DiagnosisResponse>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.DETAIL(id)
  );
  return response.data;
};

/**
 * Delete a diagnosis by ID
 */
export const deleteDiagnosis = async (id: number): Promise<void> => {
  await apiClient.delete(API_CONFIG.ENDPOINTS.DIAGNOSIS.DETAIL(id));
};

/**
 * Batch diagnose multiple images
 */
export const batchDiagnose = async (
  data: BatchDiagnosisRequest
): Promise<BatchDiagnosisResponse> => {
  const formData = new FormData();

  data.images.forEach((image, index) => {
    if (image.startsWith('data:')) {
      formData.append(`images`, image);
    } else {
      const filename = image.split('/').pop() || `image${index}.jpg`;
      formData.append(`images`, {
        uri: image,
        type: 'image/jpeg',
        name: filename,
      } as any);
    }
  });

  if (data.fclty_id) {
    formData.append('fclty_id', data.fclty_id);
  }

  const response = await diagnosisClient.post<BatchDiagnosisResponse>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.BATCH_DIAGNOSE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Get diagnoses by facility ID
 */
export const getDiagnosesByFacility = async (
  facilityId: string,
  page: number = 1
): Promise<PaginatedResponse<DiagnosisResponse>> => {
  const response = await apiClient.get<PaginatedResponse<DiagnosisResponse>>(
    API_CONFIG.ENDPOINTS.DIAGNOSIS.LIST,
    {
      params: { fclty_id: facilityId, page },
    }
  );
  return response.data;
};

/**
 * Get Environment Quick Risk
 */
export const getQuickRisk = async (farmCode?: string) => {
  const url = farmCode
    ? `/diagnosis/environment-risk/${farmCode}/`
    : '/diagnosis/quick-risk/';
  const response = await apiClient.get(url);
  return response.data;
};

export const diagnosisApi = {
  createDiagnosis,
  createIntegratedDiagnosis,
  createHybridDiagnosis,
  createCanopyDiagnosis,
  getDiagnoses,
  getDiagnosisById,
  deleteDiagnosis,
  batchDiagnose,
  getDiagnosesByFacility,
  getQuickRisk,
};

export default diagnosisApi;