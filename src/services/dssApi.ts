import apiClient from './api';

// Base URL pattern for DSS endpoints (adjust if needed based on real backend structure)
// The guide says: https://farmsense.kr/api/v1/dss/farms/{farm_id}/
const DSS_BASE = '/v1/dss/farms';

export const dssApi = {
    // 5. 대시보드
    getDashboard: async (farmId: string) => {
        try {
            const response = await apiClient.get(`${DSS_BASE}/${farmId}/dashboard/`);
            return response.data;
        } catch (error) {
            console.warn('DSS Dashboard fetch failed', error);
            return null;
        }
    },

    // 3. 생육단계
    getGrowthStage: async (farmId: string, variety: string = 'shine_muscat') => {
        try {
            const response = await apiClient.get(`${DSS_BASE}/${farmId}/growth-stage/?variety=${variety}`);
            return response.data;
        } catch (error) {
            console.warn('DSS GrowthStage fetch failed', error);
            return null;
        }
    },

    // 1. 관수 권장량
    getIrrigation: async (farmId: string, data: any) => {
        const response = await apiClient.post(`${DSS_BASE}/${farmId}/irrigation/`, data);
        return response.data;
    },

    // 1. 연간 관수 계획
    getIrrigationPlan: async (farmId: string, areaPyeong: number) => {
        const response = await apiClient.get(`${DSS_BASE}/${farmId}/irrigation/plan/?area_pyeong=${areaPyeong}`);
        return response.data;
    },

    // 2. 비료 권장량
    getFertilizer: async (farmId: string, data: any) => {
        const response = await apiClient.post(`${DSS_BASE}/${farmId}/fertilizer/`, data);
        return response.data;
    },

    // 2. 증상 진단
    diagnoseSymptom: async (farmId: string, data: any) => {
        const response = await apiClient.post(`${DSS_BASE}/${farmId}/fertilizer/diagnose/`, data);
        return response.data;
    },

    // 4. 살포량 계산
    getSprayVolume: async (farmId: string, data: any) => {
        const response = await apiClient.post(`${DSS_BASE}/${farmId}/spray-volume/`, data);
        return response.data;
    },

    // ===== 신규 추가 (Jan 2026) =====

    // 환경관리 (대시보드 활용)
    getEnvironment: async (farmId: string) => {
        const response = await apiClient.get(`${DSS_BASE}/${farmId}/dashboard/`);
        return response.data;
    },

    // 수확예측 (수동 입력)
    getYieldPrediction: async (farmId: string, data: {
        variety: string;
        cluster_count: number;
        avg_cluster_weight?: number;
        area_pyeong: number;
    }) => {
        const response = await apiClient.post(
            `${DSS_BASE}/${farmId}/yield-prediction/`,
            data
        );
        return response.data;
    },

    // 캐노피 분석 기반 수확예측
    analyzeCanopyForYield: async (farmId: number, base64Image: string) => {
        // Note: This endpoint is general hybrid diagnosis, handled specific logic backend
        const response = await apiClient.post('/diagnosis/hybrid/', {
            image: base64Image,
            farm_id: farmId,
            upload_type: 'canopy'
        });
        return response.data;
    },
};

export default dssApi;
