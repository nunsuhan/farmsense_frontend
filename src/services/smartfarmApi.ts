// smartfarmApi.ts - 스마트팜 빅데이터 API 서비스
import apiClient from './api';
import { CroppingSeason, CroppingPrediction, PredictionRequest } from '../types/api.types';

export const smartfarmApi = {
  /**
   * 작기 정보 조회
   */
  getCroppingSeasons: async (facilityId: string): Promise<CroppingSeason[]> => {
    console.log('📅 [SmartFarm] 작기 정보 조회:', facilityId);
    
    const response = await apiClient.get<{ seasons: CroppingSeason[] }>(
      '/smartfarm/cropping-seasons/',
      { params: { facility_id: facilityId } }
    );
    
    console.log('✅ [SmartFarm] 작기 정보 조회 완료:', response.data.seasons.length, '개');
    return response.data.seasons;
  },

  /**
   * 작기 예측
   */
  predictCroppingSeason: async (params: PredictionRequest): Promise<CroppingPrediction> => {
    console.log('🔮 [SmartFarm] 작기 예측 요청:', params);
    
    const response = await apiClient.post<CroppingPrediction>(
      '/smartfarm/predict/',
      params
    );
    
    console.log('✅ [SmartFarm] 작기 예측 완료:', response.data.predicted_harvest_date);
    return response.data;
  },
};

export default smartfarmApi;










