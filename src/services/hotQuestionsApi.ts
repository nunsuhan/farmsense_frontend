// hotQuestionsApi.ts - 핫 질문 추천 API
import apiClient from './api';

export interface HotQuestionsResponse {
  success: boolean;
  data: {
    current_month: number;
    current_month_name: string;
    seasonal_keywords: string[];  // 키워드 (JSON에서 로드)
    seasonal_questions: string[];  // 질문 형태로 변환된 것
    sensor_questions: string[];
    all_questions: string[];
    has_alerts: boolean;
    sensor_data?: {
      temperature?: number;
      humidity?: number;
      soil_moisture?: number;
    };
  };
}

/**
 * 현재 시기와 센서 상태에 따른 핫 질문 조회
 */
export const getHotQuestions = async (
  month?: number,
  includeSensor: boolean = true
): Promise<HotQuestionsResponse> => {
  try {
    console.log('🔥 [HotQuestions] 핫 질문 조회 시작');
    
    const params: any = {
      include_sensor: includeSensor.toString(),
    };
    
    if (month) {
      params.month = month.toString();
    }
    
    const response = await apiClient.get<HotQuestionsResponse>('/hot-questions/', {
      params,
    });
    
    console.log('✅ [HotQuestions] 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [HotQuestions] 조회 실패:', error);
    throw error;
  }
};

/**
 * 테스트용: 특정 센서 데이터로 핫 질문 조회
 */
export const testHotQuestions = async (
  month: number,
  sensorData: {
    temperature?: number;
    humidity?: number;
    soil_moisture?: number;
  }
): Promise<HotQuestionsResponse> => {
  try {
    console.log('🧪 [HotQuestions] 테스트 조회 시작:', { month, sensorData });
    
    const response = await apiClient.post<HotQuestionsResponse>('/hot-questions/test/', {
      month,
      sensor_data: sensorData,
    });
    
    console.log('✅ [HotQuestions] 테스트 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [HotQuestions] 테스트 조회 실패:', error);
    throw error;
  }
};

export default {
  getHotQuestions,
  testHotQuestions,
};

