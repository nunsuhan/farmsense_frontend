// farmmapApi.ts - 팜맵 API 서비스
import apiClient from './api';
import {
  NearbyFarmsRequest,
  NearbyFarmsResponse,
  Farm,
  SearchByLocationRequest,
  SearchByLocationResponse,
  SearchByPNURequest,
  SearchByPNUResponse,
  SearchRadiusRequest,
  SearchRadiusResponse,
  FieldInfoResponse,
  Field,
  // New Types
  SyncSectorGeoResponse,
  SyncFarmGeoRequest,
  SyncFarmGeoResponse,
  FarmMapDataResponse,
  ReverseGeocodeResponse,
  GeocodeResponse
} from '../types/api.types';

export const farmmapApi = {
  // ... existing methods ...

  /**
   * [1] 구역 설정 -> 농장 주소 자동 적용
   * POST /api/farms/sectors/{sector_id}/sync-geo/
   */
  syncSectorGeo: async (sectorId: string): Promise<SyncSectorGeoResponse> => {
    console.log(`📍 [FarmMap] Syncing Geo for Sector: ${sectorId}`);
    const response = await apiClient.post<SyncSectorGeoResponse>(`/farms/sectors/${sectorId}/sync-geo/`);
    console.log('✅ [FarmMap] Sync Geo Complete:', response.data);
    return response.data;
  },

  /**
   * [2] 농장 주소 입력 -> 지도에 표시
   * POST /api/farms/{farm_id}/sync-geo/
   */
  syncFarmGeo: async (farmId: number, address: string): Promise<SyncFarmGeoResponse> => {
    console.log(`📍 [FarmMap] Syncing Geo for Farm: ${farmId}, Address: ${address}`);
    const response = await apiClient.post<SyncFarmGeoResponse>(`/farms/${farmId}/sync-geo/`, { address });
    console.log('✅ [FarmMap] Farm Geo Synced:', response.data);
    return response.data;
  },

  /**
   * [3] 지도 표시 데이터 조회
   * GET /api/farms/{farm_id}/map-data/
   */
  getFarmMapData: async (farmId: number): Promise<FarmMapDataResponse> => {
    console.log(`🗺️ [FarmMap] Fetching Map Data for Farm: ${farmId}`);
    const response = await apiClient.get<FarmMapDataResponse>(`/farms/${farmId}/map-data/`);
    console.log('✅ [FarmMap] Map Data Loaded');
    return response.data;
  },

  /**
   * [4] 좌표 -> 주소 변환 (Reverse Geocode)
   * GET /api/farms/geo/reverse/
   */
  reverseGeocode: async (lat: number, lon: number): Promise<ReverseGeocodeResponse> => {
    const response = await apiClient.get<ReverseGeocodeResponse>('/farms/geo/reverse/', {
      params: { lat, lon }
    });
    return response.data;
  },

  /**
   * [4] 주소 -> 좌표 변환 (Geocode)
   * GET /api/farms/geo/geocode/
   */
  geocode: async (address: string): Promise<GeocodeResponse> => {
    const response = await apiClient.get<GeocodeResponse>('/farms/geo/geocode/', {
      params: { address }
    });
    return response.data;
  },
  /**
   * 주변 농장 검색
   */
  getNearbyFarms: async (params: NearbyFarmsRequest): Promise<NearbyFarmsResponse> => {
    console.log('📍 [FarmMap] 주변 농장 검색:', params);

    const response = await apiClient.get<NearbyFarmsResponse>('/farmmap/nearby/', {
      params: {
        lat: params.lat,
        lon: params.lon,
        radius: params.radius || 5000,
        crop: params.crop,
      },
    });

    console.log('✅ [FarmMap] 검색 완료:', response.data.count, '개 농장');
    return response.data;
  },

  /**
   * 농장 상세 정보
   */
  getFarmDetail: async (farmId: string): Promise<Farm> => {
    console.log('🏭 [FarmMap] 농장 상세 조회:', farmId);

    const response = await apiClient.get(`/farmmap/farms/${farmId}/`);

    console.log('✅ [FarmMap] 농장 정보 조회 완료');
    return response.data.farm;
  },

  /**
   * 작물별 농장 검색
   */
  searchFarmsByCrop: async (crop: string, limit: number = 50): Promise<Farm[]> => {
    console.log('🔍 [FarmMap] 작물별 검색:', crop);

    const response = await apiClient.get('/farmmap/search/', {
      params: {
        crop,
        limit,
      },
    });

    console.log('✅ [FarmMap] 검색 완료:', response.data.count, '개 농장');
    return response.data.farms;
  },

  // ==================== 고급 팜맵 API ====================

  /**
   * 좌표로 농지 검색
   */
  searchByLocation: async (params: SearchByLocationRequest): Promise<SearchByLocationResponse> => {
    console.log('📍 [FarmMap] 좌표 검색:', params);

    const response = await apiClient.post<SearchByLocationResponse>('/farmmap/search-by-location/', params);

    console.log('✅ [FarmMap] 농지 검색 완료:', response.data.count, '개 필지');
    return response.data;
  },

  /**
   * PNU로 농지 검색
   */
  searchByPNU: async (params: SearchByPNURequest): Promise<Field> => {
    console.log('🔍 [FarmMap] PNU 검색:', params.pnu);

    const response = await apiClient.post<SearchByPNUResponse>('/farmmap/search-by-pnu/', params);

    console.log('✅ [FarmMap] 필지 검색 완료');
    return response.data.field;
  },

  /**
   * 반경 내 농지 검색
   */
  /**
   * 반경 내 농지 검색 (Mock Fallback)
   */
  searchRadius: async (params: SearchRadiusRequest): Promise<SearchRadiusResponse> => {
    console.log('🔍 [FarmMap] 반경 검색:', params);

    try {
      const response = await apiClient.post<SearchRadiusResponse>('/farmmap/search-radius/', params);
      console.log('✅ [FarmMap] 반경 검색 완료:', response.data.count, '개 필지');
      return response.data;
    } catch (error) {
      console.warn('⚠️ [FarmMap] API 호출 실패, Mock 데이터 사용:', error);
      return mockSearchRadius(params);
    }
  },

  /**
   * 필지 상세 정보
   */
  getFieldInfo: async (pnu: string): Promise<Field> => {
    console.log('🏭 [FarmMap] 필지 상세 조회:', pnu);
    try {
      const response = await apiClient.get<FieldInfoResponse>(`/farmmap/field-info/${pnu}/`);
      console.log('✅ [FarmMap] 필지 정보 조회 완료');
      return response.data.field;
    } catch (error) {
      console.warn('⚠️ [FarmMap] 상세 조회 실패, Mock 데이터 리턴');
      return mockFieldDetail(pnu);
    }
  },
};

// ==================== Mock Data Generator ====================

const mockSearchRadius = (params: SearchRadiusRequest): SearchRadiusResponse => {
  const { lat, lon, radius = 500, field_type } = params;
  const count = Math.floor(Math.random() * 5) + 3; // 3~7 fields
  const fields: Field[] = [];

  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 0.005;
    const lonOffset = (Math.random() - 0.5) * 0.005;
    const itemLat = lat + latOffset;
    const itemLon = lon + lonOffset;

    const type = field_type || (Math.random() > 0.6 ? '과수' : Math.random() > 0.3 ? '논' : '밭');

    fields.push({
      pnu: `MOCK-${Date.now()}-${i}`,
      fl_nm: type,
      fl_ar: Math.floor(Math.random() * 3000) + 1000,
      address: '구미시 옥계동 인근',
      center: { latitude: itemLat, longitude: itemLon },
      // Simple square mock coordinates
      coordinates: [
        [itemLat + 0.001, itemLon + 0.001],
        [itemLat + 0.001, itemLon - 0.001],
        [itemLat - 0.001, itemLon - 0.001],
        [itemLat - 0.001, itemLon + 0.001],
      ],
      crop: type === '과수' ? '포도' : type === '논' ? '벼' : '고구마',
      variety: type === '과수' ? '샤인머스캣' : undefined,
      suitability: {
        grape_score: 85,
        rating: '적합',
        strengths: ['배수 양호', '일조량 풍부'],
        limitations: ['경사도 약간 있음']
      },
      soil: {
        type: '사양토',
        ph: 6.5,
        organic_matter: 2.5,
        drainage: '양호'
      }
    });
  }

  return {
    count,
    center: { latitude: lat, longitude: lon },
    radius,
    fields,
  };
};

const mockFieldDetail = (pnu: string): Field => {
  return {
    pnu,
    fl_nm: '과수',
    fl_ar: 2500,
    address: '상세 주소 Mock',
    crop: '포도',
    variety: '거봉',
    suitability: {
      grape_score: 90,
      rating: '최적',
      strengths: ['토양 비옥', '평지'],
    },
    soil: {
      type: '식양토',
      ph: 6.8,
      organic_matter: 3.0,
      drainage: '매우 양호'
    }
  };
}

export default farmmapApi;

