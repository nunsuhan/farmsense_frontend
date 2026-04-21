/**
 * Trial Application API — 시범농가 신청
 *
 * 서버: POST /api/trial/apply/  (AllowAny)
 * Body: { name, phone, location, farm_type, area_pyeong }
 */
import apiClient from './api';

export type FarmType = 'rain_shelter' | 'greenhouse' | 'open_field';

export interface TrialApplyBody {
  name: string;
  phone: string;
  location: string;
  farm_type: FarmType;
  area_pyeong: number;
}

export interface TrialApplyResponse {
  id: number;
  status: string;
  status_display: string;
  message: string;
}

export interface TrialStatusResponse {
  applied: boolean;
  id?: number;
  status?: string;
  status_display?: string;
  name?: string;
  location?: string;
  created_at?: string;
}

export const applyTrial = async (body: TrialApplyBody): Promise<TrialApplyResponse> => {
  const res = await apiClient.post<TrialApplyResponse>('/trial/apply/', body);
  return res.data;
};

export const getMyTrialStatus = async (phone: string): Promise<TrialStatusResponse> => {
  const res = await apiClient.get<TrialStatusResponse>('/trial/my-status/', {
    params: { phone },
  });
  return res.data;
};

export default { applyTrial, getMyTrialStatus };
