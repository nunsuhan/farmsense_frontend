import apiClient from './api';

// PNU 기반 토양 정보 조회
export const getMyFarmSoilInfo = async () => {
    // GET /api/soil/my-farm/
    // 실제로는 PNU가 없을 경우 404가 올 수 있음
    const response = await apiClient.get('/soil/my-farm/');
    return response.data;
};

// PNU 등록 Update
export const registerMyFarmPNU = async (pnuCode: string) => {
    const response = await apiClient.post('/soil/my-farm/', { pnu_code: pnuCode });
    return response.data;
};

// 포도 재배 적합성 평가 조회
export const getGrapeSuitability = async (pnuCode: string) => {
    const response = await apiClient.get(`/soil/grape-evaluation/${pnuCode}/`);
    return response.data;
};

// 비료 처방 조회
export const getFertilizerPrescription = async (pnuCode: string, treeAge: string) => {
    // treeAge example: "5-10년생"
    const response = await apiClient.get(`/soil/grape-fertilizer/${pnuCode}/`, {
        params: { tree_age: treeAge }
    });
    return response.data;
};

// 주소 -> PNU 변환 (외부 API 또는 백엔드 프록시)
// 백엔드에서 처리한다고 가정: GET /api/soil/address-to-pnu/?address=...
export const getPNUFromAddress = async (address: string) => {
    const response = await apiClient.get('/soil/address-to-pnu/', {
        params: { address }
    });
    return response.data; // Expected: { pnu: "..." }
};
