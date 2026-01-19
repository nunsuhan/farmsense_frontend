/**
 * RAG API Service - 포도 재배 질의응답 + 농사로 API 통합
 */
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

// RAG 전용 클라이언트 (8001 포트)
const ragClient = axios.create({
  baseURL: API_CONFIG.RAG_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RAGResponse {
  answer: string;
  sources: string[];
  confidence: number;
  query_type?: string;
  query_rewritten?: string;
  conversation_id?: number;
  has_api_data?: boolean;
}

// 단순 RAG
export const askRAG = async (question: string): Promise<RAGResponse> => {
  const response = await ragClient.post(API_CONFIG.ENDPOINTS.RAG.ASK, { question });
  return response.data;
};

// 스마트 RAG (컨텍스트 + 농사로 API)
export const askSmartRAG = async (
  question: string,
  options?: { farm_id?: string; conversation_id?: number; use_nongsaro?: boolean }
): Promise<RAGResponse> => {
  const response = await ragClient.post(API_CONFIG.ENDPOINTS.RAG.SMART, {
    question,
    farm_id: options?.farm_id,
    conversation_id: options?.conversation_id,
    use_nongsaro: options?.use_nongsaro ?? true,
  });
  return response.data;
};

// 농사로 강화 RAG
export const askEnhancedRAG = async (question: string): Promise<RAGResponse> => {
  const response = await ragClient.post(API_CONFIG.ENDPOINTS.RAG.ENHANCED, { question });
  return response.data;
};

// 기존 호환
export const chat = async (message: string, farmContext?: any) => {
  const response = await askSmartRAG(message, { farm_id: farmContext?.farm_id });
  return { answer: response.answer, sources: response.sources };
};

export default { askRAG, askSmartRAG, askEnhancedRAG, chat };