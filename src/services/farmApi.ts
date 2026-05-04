// farmApi.ts - 농장 목록/단일 조회 API
import apiClient from './api';

export interface Farm {
  id: number;
  name: string;
  address: string;
  total_area: number;
  latitude: number | null;
  longitude: number | null;
  is_export_farm: boolean;
  sectors: Array<any>;
  sector_count: number;
  created_at: string;
}

export const farmApi = {
  /**
   * GET /api/farms/
   * 본인 농장만 자동 필터됨 (백엔드: Farm.objects.filter(user=request.user))
   * 응답: JSON array. 미래 페이지네이션 활성화 대비 좁힘 함수 포함.
   */
  getMyFarms: async (): Promise<Farm[]> => {
    const response = await apiClient.get<Farm[] | { results: Farm[] }>('/farms/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).results)) return (data as any).results;
    return [];
  },

  getFarmById: async (id: number): Promise<Farm> => {
    const response = await apiClient.get<Farm>(`/farms/${id}/`);
    return response.data;
  },

  /**
   * POST /api/farms/
   * user는 백엔드 perform_create가 자동 주입.
   * 필수: name. 나머지(address/total_area/latitude/longitude/is_export_farm)는 optional.
   */
  createFarm: async (data: Partial<Farm>): Promise<Farm> => {
    const response = await apiClient.post<Farm>('/farms/', data);
    return response.data;
  },

  /**
   * PATCH /api/farms/{id}/
   */
  updateFarm: async (id: number, data: Partial<Farm>): Promise<Farm> => {
    const response = await apiClient.patch<Farm>(`/farms/${id}/`, data);
    return response.data;
  },
};

export default farmApi;
