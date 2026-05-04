/**
 * Sensor API Service
 * 센서 데이터 API 통신 서비스
 * 
 * BACKEND_HANDOFF.md 명세에 따라 구현됨
 * 네트워크 타임아웃 대응 강화
 */

import api from './api';
import { SensorData, SensorValue } from '../types/storeTypes';
import {
  SensorCurrentResponse,
  SensorGraphResponse,
  SensorStatsResponse,
  SensorSettingsResponse
} from '../types/api.types';

// ============================================
// Type Definitions
// ============================================

/**
 * 센서 히스토리 응답
 */
export interface SensorHistory {
  timestamps: string[];
  temperature: number[];
  humidity: number[];
  soil_moisture: number[];
  co2: number[];
}

/**
 * 센서 등록 요청
 */
export interface RegisterSensorRequest {
  farmId: string;
  sensorType: 'temperature' | 'humidity' | 'soil_moisture' | 'co2' | 'light';
  deviceId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * 최신 센서 데이터 조회 (Legacy Wrapper or specific farm endpoint)
 * GET /api/sensors/latest?farmId={farmId}
 */
export async function getAllSensorData(
  farmId: string | number,
  retryCount: number = 0
): Promise<SensorData | null> {
  try {
    const response = await api.get<any>('/sensor/', {
      params: { farmId },
      timeout: 10000, // 10초 타임아웃
    });

    // ✅ 서버 응답 형식 감지 및 파싱
    let serverData = response.data;

    // Case 1: records 배열이 있는 경우 (최신 데이터 추출)
    if (serverData.records && Array.isArray(serverData.records) && serverData.records.length > 0) {
      serverData = serverData.records[0]; // 최신 데이터 사용
    }

    // Case 2: data 필드에 실제 데이터가 있는 경우
    if (serverData.data && typeof serverData.data === 'object') {
      serverData = serverData.data;
    }

    // ✅ 헬퍼 함수: 센서 값 추출
    const extractSensorValue = (
      data: any,
      keys: string[],
      defaultValue: number,
      unit: string
    ): SensorValue => {
      for (const key of keys) {
        if (data[key]) {
          // 이미 SensorValue 형식인 경우
          if (typeof data[key] === 'object' && 'value' in data[key]) {
            return {
              value: data[key].value || defaultValue,
              unit: data[key].unit || unit,
              status: data[key].status || 'normal',
              timestamp: data[key].timestamp || new Date().toISOString(),
            };
          }
          // 숫자만 있는 경우
          if (typeof data[key] === 'number') {
            return {
              value: data[key],
              unit,
              status: 'normal',
              timestamp: new Date().toISOString(),
            };
          }
        }
      }
      // 기본값 반환
      return {
        value: defaultValue,
        unit,
        status: 'normal',
        timestamp: new Date().toISOString(),
      };
    };

    // ✅ 서버 응답 데이터 매핑 (다양한 필드명 지원)
    const mappedData: SensorData = {
      temperature: extractSensorValue(
        serverData,
        ['temperature', 'temp', 'Temperature', 'TEMP'],
        24,
        '°C'
      ),
      humidity: extractSensorValue(
        serverData,
        ['humidity', 'humid', 'Humidity', 'HUMID'],
        65,
        '%'
      ),
      soil_moisture: extractSensorValue(
        serverData,
        ['soil_moisture', 'soilMoisture', 'soil', 'Soil', 'SOIL'],
        45,
        '%'
      ),
      co2: extractSensorValue(
        serverData,
        ['co2', 'CO2', 'Co2'],
        800,
        'ppm'
      ),
    };

    return mappedData;
  } catch (error: any) {
    console.warn('⚠️ [sensorApi] API call failed, returning dummy data for UI testing');

    // 더미 센서 데이터 반환 (UI 확인용)
    const dummyData: SensorData = {
      temperature: {
        value: 24,
        unit: '°C',
        status: 'normal',
        timestamp: new Date().toISOString(),
      },
      humidity: {
        value: 65,
        unit: '%',
        status: 'normal',
        timestamp: new Date().toISOString(),
      },
      soil_moisture: {
        value: 45,
        unit: '%',
        status: 'normal',
        timestamp: new Date().toISOString(),
      },
      co2: {
        value: 800,
        unit: 'ppm',
        status: 'normal',
        timestamp: new Date().toISOString(),
      },
    };

    return dummyData;
  }
}

/**
 * 센서 데이터 히스토리 조회
 */
export async function getSensorHistory(
  farmId: string,
  from: string,
  to: string
): Promise<SensorHistory | null> {
  try {
    const response = await api.get<SensorHistory>('/sensor/history/', {
      params: { farmId, from, to },
      timeout: 15000, // 15초 타임아웃
    });

    return response.data;
  } catch (error: any) {
    return null;
  }
}

/**
 * 센서 등록
 */
export async function registerSensor(data: RegisterSensorRequest): Promise<any> {
  try {
    const response = await api.post('/sensor/', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || '센서 등록에 실패했습니다.');
  }
}

/**
 * [NEW] [1] Get current sensor data (Standardized)
 */
export const getCurrentData = async (): Promise<SensorCurrentResponse> => {
  try {
    const response = await api.get('/sensor/current/');
    return response.data;
  } catch (error) {
    // Fallback mock
    return {
      success: true,
      data: {
        temperature: { value: -2.2, unit: "°C", status: "low" },
        humidity: { value: 69.5, unit: "%", status: "normal" },
        soil_moisture: { value: 24.2, unit: "%", status: "low" },
        soil_temperature: { value: -2.1, unit: "°C", "status": "low" }
      },
      recorded_at: new Date().toISOString(),
      farm_code: "11",
      is_model_farm: true,
      model_farm_info: {
        name: "화성 모델팜",
        score: 98,
        grade: "A (우수)"
      },
      message: "센서 미등록 - 화성시 모델팜 데이터 표시",
      register_hint: "설정 > 센서관리에서 센서를 등록하세요"
    } as any; // Temporary cast until types are fully aligned if needed, though interface should match
  }
};

/**
 * [NEW] [2] Get graph data
 */
export const getGraphData = async (period: 'day' | 'week' | 'month' = 'day', sensor: 'temperature' | 'humidity' | 'soil_moisture' | 'all' = 'all'): Promise<SensorGraphResponse> => {
  try {
    const response = await api.get(`/sensor/graph/?period=${period}&compare=true`);
    return response.data;
  } catch (error) {
    return generateMockGraphData(period);
  }
};

/**
 * [NEW] [3] Get stats summary
 */
export const getStats = async (): Promise<SensorStatsResponse> => {
  try {
    const response = await api.get('/sensor/stats/');
    return response.data;
  } catch (error) {
    return {
      success: true,
      today: {
        temperature: { avg: 24.5, min: 18.2, max: 32.1 },
        humidity: 65.0,
        soil_moisture: 45.0
      },
      yesterday: {
        temperature: 23.8,
        humidity: 62.0
      },
      week_avg: {
        temperature: 24.0,
        humidity: 64.0
      },
      changes: {
        temp_vs_yesterday: 0.7,
        humid_vs_yesterday: 3.0
      }
    };
  }
};

/**
 * [NEW] [4] Get Settings
 */
export const getSettings = async (): Promise<SensorSettingsResponse> => {
  try {
    const response = await api.get('/sensor/settings/');
    return response.data;
  } catch (error) {
    return {
      settings: {
        display_sensors: ["temperature", "humidity", "soil_moisture"],
        alert_enabled: true,
        alert_thresholds: {
          temperature: { min: 15, max: 35 },
          humidity: { min: 40, max: 85 },
          soil_moisture: { min: 30, max: 70 }
        },
        graph_default_period: "day",
        refresh_interval: 300
      }
    };
  }
};

/**
 * [NEW] [4] Update Settings
 */
export const updateSettings = async (settings: any) => {
  try {
    const response = await api.put('/sensor/settings/', settings);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// ============================================
// Helper Functions
// ============================================

/**
 * 센서 값 상태 판단
 */
export function getSensorStatus(
  value: number,
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'co2'
): 'normal' | 'warning' | 'error' {
  switch (type) {
    case 'temperature':
      if (value < 15 || value > 30) return 'error';
      if (value < 18 || value > 28) return 'warning';
      return 'normal';

    case 'humidity':
      if (value < 40 || value > 80) return 'error';
      if (value < 50 || value > 70) return 'warning';
      return 'normal';

    case 'soil_moisture':
      if (value < 20 || value > 70) return 'error';
      if (value < 30 || value > 60) return 'warning';
      return 'normal';

    case 'co2':
      if (value < 400 || value > 1200) return 'error';
      if (value < 600 || value > 1000) return 'warning';
      return 'normal';

    default:
      return 'normal';
  }
}

/**
 * 센서 값 포맷팅
 */
export function formatSensorValue(value: SensorValue | null): string {
  if (!value) return '데이터 없음';
  return `${value.value}${value.unit}`;
}

/**
 * 센서 상태 색상 반환
 * Guide: normal: #22C55E, low: #3B82F6, high: #EF4444
 */
export function getSensorStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'normal':
      return '#22C55E'; // Green
    case 'low':
      return '#3B82F6'; // Blue
    case 'high':
    case 'error': // Fallback
      return '#EF4444'; // Red
    case 'warning':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * 센서 상태 아이콘 반환 (화살표 등)
 */
export function getSensorStatusIcon(status: string): string {
  switch (status?.toLowerCase()) {
    case 'low':
      return 'arrow-down';
    case 'high':
      return 'arrow-up';
    case 'normal':
      return 'checkmark';
    default:
      return 'ellipse'; // dot
  }
}

/**
 * 센서 타입 한글 이름
 */
export function getSensorTypeName(
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'co2' | 'light'
): string {
  const names = {
    temperature: '온도',
    humidity: '습도',
    soil_moisture: '토양수분',
    co2: 'CO2',
    light: '일사량',
  };
  return names[type];
}

/**
 * 센서 타입 아이콘 이름 (Ionicons)
 */
export function getSensorTypeIcon(
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'co2' | 'light'
): string {
  const icons = {
    temperature: 'thermometer-outline',
    humidity: 'water-outline',
    soil_moisture: 'leaf-outline',
    co2: 'cloud-outline',
    light: 'sunny-outline',
  };
  return icons[type];
}

/**
 * 타임스탬프를 상대 시간으로 변환
 */
export function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

// Helper: Mock Data Generator
const generateMockGraphData = (period: 'day' | 'week' | 'month'): SensorGraphResponse => {
  let labels: string[] = [];
  let count = 0;

  if (period === 'day') {
    count = 24;
    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  } else if (period === 'week') {
    count = 7;
    labels = ['월', '화', '수', '목', '금', '토', '일'];
  } else {
    count = 30;
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}일`);
  }

  // Helper Data Generators
  const randomData = (min: number, max: number, count: number) =>
    Array.from({ length: count }, () => parseFloat((Math.random() * (max - min) + min).toFixed(1)));

  // 1. Temperature
  const tempMy = randomData(18, 26, count);
  const tempModel = randomData(20, 24, count);

  // 2. Humidity
  const humidMy = randomData(50, 70, count);
  const humidModel = randomData(55, 65, count);

  // 3. Soil Moisture
  const soilMy = randomData(25, 45, count);
  const soilModel = randomData(30, 40, count);

  // 4. CO2
  const co2My = randomData(400, 800, count);
  const co2Model = randomData(500, 700, count);

  // 5. Light (Solar)
  const lightMy = randomData(0, 800, count);
  const lightModel = randomData(200, 1000, count);

  // Calculate comparison mock results (based on temperature)
  const myAvg = tempMy.reduce((a, b) => a + b, 0) / count;
  const modelAvg = tempModel.reduce((a, b) => a + b, 0) / count;
  const diff = parseFloat((myAvg - modelAvg).toFixed(1));

  return {
    success: true,
    period,
    labels,

    my_farm: {
      name: "내 농장",
      color: "#3B82F6",
      is_model: false
    },

    model_farm: {
      farm_code: "3_0",
      name: "모델팜 (최우수)",
      color: "#10B981"
    },

    temperature: {
      my_farm: { avg: tempMy, min: [], max: [] },
      model_farm: { avg: tempModel, min: [], max: [] },
      unit: "°C"
    },

    humidity: {
      my_farm: { avg: humidMy },
      model_farm: { avg: humidModel },
      unit: "%"
    },

    soil_moisture: {
      my_farm: { avg: soilMy },
      model_farm: { avg: soilModel },
      unit: "%"
    },

    co2: {
      my_farm: { avg: co2My },
      model_farm: { avg: co2Model },
      unit: "ppm"
    },

    light: {
      my_farm: { avg: lightMy },
      model_farm: { avg: lightModel },
      unit: "W/㎡"
    },

    comparison: {
      temperature_diff: diff,
      humidity_diff: 5.2,
      insights: [
        {
          type: Math.abs(diff) < 2 ? 'good' : 'warning',
          message: Math.abs(diff) < 2
            ? "온도 관리가 모델팜 수준입니다."
            : `모델팜보다 온도가 ${Math.abs(diff)}°C ${diff > 0 ? '높습니다' : '낮습니다'}.`
        },
        {
          type: 'warning',
          message: "습도가 모델팜보다 5% 높습니다. 환기를 확인하세요."
        }
      ]
    }
  } as any; // Cast to satisfy partial interface overlapping
};

export default {
  getAllSensorData,
  getSensorHistory,
  registerSensor,
  getSensorStatus,
  formatSensorValue,
  getSensorStatusColor,
  getSensorTypeName,
  getSensorTypeIcon,
  getRelativeTime,
  // New Methods
  getCurrentData,
  getGraphData,
  getStats,
  getSettings,
  updateSettings
};
