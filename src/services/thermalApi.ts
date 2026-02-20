/**
 * MLX90640 열화상 카메라 API 서비스
 * 백엔드 farmsense/api/mlx90640_views.py 연동
 *
 * API:
 *   POST /api/sensors/mlx90640/register/     - 센서 등록
 *   GET  /api/sensors/mlx90640/list/          - 센서 목록
 *   POST /api/sensors/mlx90640/frame/         - 프레임 처리
 *   POST /api/sensors/mlx90640/monitor/       - 연속 모니터링
 *   POST /api/sensors/mlx90640/compare/       - 센서 비교
 *   GET  /api/sensors/mlx90640/{id}/trend/    - 트렌드 분석
 *   GET  /api/sensors/mlx90640/{id}/history/  - 이력 조회
 */
import apiClient from './api';
import { API_CONFIG } from '../constants/config';

const EP = API_CONFIG.ENDPOINTS.THERMAL;

// ── 타입 정의 ──

export interface ThermalSensorConfig {
  sensor_id: string;
  model?: string;
  distance_m?: number;
  installation_height_m?: number;
  tilt_angle?: number;
  roi_top?: number;
  roi_bottom?: number;
  roi_left?: number;
  roi_right?: number;
  reference_surface?: string;
}

export interface ThermalSensorInfo {
  sensor_id: string;
  model: string;
  registered_at: string;
  latest_data?: ThermalMetrics;
  history_count: number;
}

export interface ThermalMetrics {
  canopy_mean: number;
  canopy_median: number;
  canopy_std: number;
  canopy_min: number;
  canopy_max: number;
  hotspot: number;
  coldspot: number;
  mtd: number;
  quality_score: number;
}

export interface CWSIResult {
  cwsi: number;
  stress_level: string;
  delta_t: number;
  confidence: number;
  recommendations: string[];
}

export interface FrameResult {
  thermal: ThermalMetrics;
  cwsi?: CWSIResult;
  trend?: TrendResult;
  timestamp: string;
}

export interface TrendResult {
  direction: string;
  slope_per_hour: number;
  daily_amplitude: number;
  anomalies: { time: string; value: number; type: string }[];
}

export interface MonitorResult extends FrameResult {
  control_triggers: {
    irrigation_needed: boolean;
    alert_level: string;
    actions: string[];
  };
}

// ── API 함수 ──

export const thermalApi = {
  /**
   * MLX90640 센서 등록
   */
  registerSensor: async (config: ThermalSensorConfig): Promise<any> => {
    const res = await apiClient.post(EP.REGISTER, config);
    return res.data;
  },

  /**
   * 등록된 센서 목록 조회
   */
  listSensors: async (): Promise<ThermalSensorInfo[]> => {
    const res = await apiClient.get(EP.LIST);
    return res.data?.sensors ?? res.data;
  },

  /**
   * 단일 프레임 처리 (32x24 = 768 온도값)
   */
  processFrame: async (
    sensorId: string,
    temperatures: number[],
    options?: {
      include_cwsi?: boolean;
      air_temp?: number;
      humidity?: number;
      wind_speed?: number;
    },
  ): Promise<FrameResult> => {
    const res = await apiClient.post(EP.FRAME, {
      sensor_id: sensorId,
      temperatures,
      ...options,
    });
    return res.data;
  },

  /**
   * 연속 모니터링 (프레임 + CWSI + 트렌드 + 제어 트리거)
   */
  monitor: async (
    sensorId: string,
    temperatures: number[],
    climate?: {
      air_temp?: number;
      humidity?: number;
      wind_speed?: number;
      solar_radiation?: number;
    },
  ): Promise<MonitorResult> => {
    const res = await apiClient.post(EP.MONITOR, {
      sensor_id: sensorId,
      temperatures,
      climate,
    });
    return res.data;
  },

  /**
   * 다수 센서 비교
   */
  compareSensors: async (sensorIds?: string[]): Promise<any> => {
    const res = await apiClient.post(EP.COMPARE, {
      sensor_ids: sensorIds,
    });
    return res.data;
  },

  /**
   * 특정 센서 트렌드 분석
   */
  getTrend: async (sensorId: string): Promise<TrendResult> => {
    const res = await apiClient.get(EP.TREND(sensorId));
    return res.data;
  },

  /**
   * 특정 센서 이력 조회
   */
  getHistory: async (
    sensorId: string,
    hours?: number,
  ): Promise<FrameResult[]> => {
    const params: Record<string, number> = {};
    if (hours) params.hours = hours;
    const res = await apiClient.get(EP.HISTORY(sensorId), { params });
    return res.data?.history ?? res.data;
  },
};

export default thermalApi;
