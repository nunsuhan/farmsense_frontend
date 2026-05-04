/**
 * Sector API Service
 * 구역 관리 API 통신 서비스
 * 
 * BACKEND_HANDOFF.md 명세에 따라 구현됨
 */

import api from './api';
import type { FarmSector, LatLng } from '../types/storeTypes';

// ============================================
// Type Definitions
// ============================================

/**
 * 구역 생성 요청 데이터
 */
export interface CreateSectorRequest {
    farmId: string;
    name: string;
    coordinates: LatLng[];  // 다각형 좌표 배열
    area: number;           // 계산된 면적 (m²)
    crop: string;
    color?: string;
}

/**
 * 구역 수정 요청 데이터
 */
export interface UpdateSectorRequest {
    name?: string;
    coordinates?: LatLng[];
    area?: number;
    crop?: string;
    color?: string;
    farmId?: string;
}

/**
 * API 에러 응답
 */
interface ApiError {
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Shoelace Formula를 사용한 다각형 면적 계산
 * @param coordinates 다각형 좌표 배열
 * @returns 면적 (m²)
 */
export function calculateArea(coordinates: LatLng[]): number {
    if (coordinates.length < 3) {
        throw new Error('최소 3개의 좌표가 필요합니다.');
    }

    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i].latitude * coordinates[j].longitude;
        area -= coordinates[j].latitude * coordinates[i].longitude;
    }

    // 절대값의 절반
    area = Math.abs(area / 2);

    // 위도/경도를 미터로 변환 (대략적인 변환)
    // 1도 ≈ 111,320m (위도), 경도는 위도에 따라 다름
    const areaInSquareMeters = area * 111320 * 111320;

    return Math.round(areaInSquareMeters * 100) / 100; // 소수점 2자리
}

/**
 * API 에러 처리
 */
function handleApiError(error: any): never {
    if (error.response?.data?.error) {
        const apiError: ApiError = error.response.data;
        throw new Error(apiError.error.message || '서버 오류가 발생했습니다.');
    }
    throw new Error(error.message || '네트워크 오류가 발생했습니다.');
}

// ============================================
// API Functions
// ============================================

/**
 * 구역 목록 조회
 * GET /api/farms/{farmId}/sectors/
 */
export async function getSectors(farmId: string): Promise<FarmSector[]> {
    try {
        // 서버 경로: /api/farms/{farmId}/sectors/
        const response = await api.get<FarmSector[]>(`/farms/${farmId}/sectors/`);
        return response.data;
    } catch (error) {
        console.error('❌ [sectorApi] getSectors failed:', error);
        throw error;
    }
}

/**
 * 구역 생성
 * POST /api/sectors
 */
export async function createSector(data: CreateSectorRequest): Promise<FarmSector> {
    try {
        // 면적 검증
        if (data.area <= 0) {
            throw new Error('면적은 0보다 커야 합니다.');
        }

        // 좌표 검증
        if (data.coordinates.length < 3) {
            throw new Error('최소 3개의 좌표가 필요합니다.');
        }

        // 서버 경로: /api/farms/{farmId}/sectors/
        const response = await api.post<FarmSector>(`/farms/${data.farmId}/sectors/`, data);
        console.log('✅ [sectorApi] Sector created:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('❌ [sectorApi] createSector failed:', error);
        handleApiError(error);
    }
}

/**
 * 구역 수정
 * PUT /api/sectors/{sectorId}
 */
export async function updateSector(
    sectorId: string,
    data: UpdateSectorRequest
): Promise<FarmSector> {
    try {
        // 면적이 제공된 경우 검증
        if (data.area !== undefined && data.area <= 0) {
            throw new Error('면적은 0보다 커야 합니다.');
        }

        // 좌표가 제공된 경우 검증
        if (data.coordinates && data.coordinates.length < 3) {
            throw new Error('최소 3개의 좌표가 필요합니다.');
        }

        // farmId를 data에서 추출 (필수)
        const farmId = data.farmId;
        if (!farmId) {
            throw new Error('updateSector: farmId is required');
        }
        const response = await api.put<FarmSector>(`/farms/${farmId}/sectors/${sectorId}/`, data);
        console.log('✅ [sectorApi] Sector updated:', sectorId);
        return response.data;
    } catch (error) {
        console.error('❌ [sectorApi] updateSector failed:', error);
        handleApiError(error);
    }
}

/**
 * 구역 삭제
 * DELETE /api/farms/{farmId}/sectors/{sectorId}/
 */
export async function deleteSector(farmId: string | number, sectorId: string): Promise<void> {
    try {
        await api.delete(`/farms/${farmId}/sectors/${sectorId}/`);
        console.log('✅ [sectorApi] Sector deleted:', sectorId);
    } catch (error) {
        console.error('❌ [sectorApi] deleteSector failed:', error);
        handleApiError(error);
    }
}

/**
 * 구역 상세 조회
 * GET /api/farms/{farmId}/sectors/{sectorId}/
 */
export async function getSectorById(farmId: string | number, sectorId: string): Promise<FarmSector> {
    try {
        const response = await api.get<FarmSector>(`/farms/${farmId}/sectors/${sectorId}/`);
        return response.data;
    } catch (error) {
        console.error('❌ [sectorApi] getSectorById failed:', error);
        handleApiError(error);
    }
}

// ============================================
// Helper Functions
// ============================================

/**
 * 구역 색상 생성 (랜덤)
 */
export function generateSectorColor(): string {
    const colors = [
        '#10B981', // Green
        '#3B82F6', // Blue
        '#F59E0B', // Orange
        '#8B5CF6', // Purple
        '#EF4444', // Red
        '#06B6D4', // Cyan
        '#EC4899', // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 구역 중심점 계산
 */
export function calculateCenterPoint(coordinates: LatLng[]): LatLng {
    if (coordinates.length === 0) {
        throw new Error('좌표가 없습니다.');
    }

    const sum = coordinates.reduce(
        (acc, coord) => ({
            latitude: acc.latitude + coord.latitude,
            longitude: acc.longitude + coord.longitude,
        }),
        { latitude: 0, longitude: 0 }
    );

    return {
        latitude: sum.latitude / coordinates.length,
        longitude: sum.longitude / coordinates.length,
    };
}

/**
 * 면적을 사람이 읽기 쉬운 형식으로 변환
 */
export function formatArea(area: number): string {
    if (area < 10000) {
        return `${area.toFixed(1)}m²`;
    } else {
        const hectares = area / 10000;
        return `${hectares.toFixed(2)}ha`;
    }
}

export default {
    getSectors,
    createSector,
    updateSector,
    deleteSector,
    getSectorById,
    calculateArea,
    generateSectorColor,
    calculateCenterPoint,
    formatArea,
};
