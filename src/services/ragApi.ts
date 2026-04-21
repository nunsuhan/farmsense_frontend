/**
 * RAG API Service - 포도 재배 질의응답 + 농사로 API 통합
 *
 * 대화 기록 정책: 유저 한 명당 Conversation 1개 영원 유지
 *  - AsyncStorage(rag_conversation_id) 에 conversation_id 보관
 *  - 없으면 GET /api/rag/my-conversation/ (인증 필요)으로 서버에서 복원
 *  - 매 질문 시 conversation_id 를 body에 포함 → 서버가 Message 자동 누적
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { API_CONFIG } from '../constants/config';

// RAG 전용 클라이언트 (AllowAny 엔드포인트용)
const ragClient = axios.create({
  baseURL: API_CONFIG.RAG_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

export interface RAGResponse {
  answer: string;
  sources: any[];
  confidence: number;
  query_type?: string;
  query_rewritten?: string;
  conversation_id?: string | number;
  has_api_data?: boolean;
}

export interface MyConversationResponse {
  conversation_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  recent_messages: Array<{ role: string; content: string; created_at: string }>;
}

const CONV_KEY = 'rag_conversation_id';

// ───────────────────────── Conversation 관리

/** AsyncStorage에서 conversation_id 가져오기 */
export const getCachedConversationId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CONV_KEY);
  } catch {
    return null;
  }
};

/** AsyncStorage에 저장 (서버 응답 후) */
export const cacheConversationId = async (id: string | number | null | undefined) => {
  if (id === null || id === undefined) return;
  try {
    await AsyncStorage.setItem(CONV_KEY, String(id));
  } catch {
    /* noop */
  }
};

/** 초기화 (로그아웃 시) */
export const clearCachedConversationId = async () => {
  try {
    await AsyncStorage.removeItem(CONV_KEY);
  } catch {
    /* noop */
  }
};

/** 서버에서 내 conversation 복원 (로그인 필수) */
export const fetchMyConversation = async (): Promise<MyConversationResponse | null> => {
  try {
    const res = await apiClient.get<MyConversationResponse>('/rag/my-conversation/');
    if (res.data?.conversation_id) {
      await cacheConversationId(res.data.conversation_id);
    }
    return res.data;
  } catch (e) {
    console.log('[ragApi] fetchMyConversation failed', e);
    return null;
  }
};

/** 사용할 conversation_id 보장 (캐시 → 서버 복원 → 없으면 null) */
export const ensureConversationId = async (): Promise<string | null> => {
  const cached = await getCachedConversationId();
  if (cached) return cached;
  const fetched = await fetchMyConversation();
  return fetched?.conversation_id ?? null;
};

// ───────────────────────── 질의

export const askRAG = async (question: string): Promise<RAGResponse> => {
  const response = await ragClient.post(API_CONFIG.ENDPOINTS.RAG.ASK, { question });
  if (response.data?.conversation_id) {
    await cacheConversationId(response.data.conversation_id);
  }
  return response.data;
};

export const askSmartRAG = async (
  question: string,
  options?: { farm_id?: string | number; conversation_id?: string | number; use_nongsaro?: boolean }
): Promise<RAGResponse> => {
  const convId = options?.conversation_id ?? (await ensureConversationId());
  const response = await ragClient.post(API_CONFIG.ENDPOINTS.RAG.SMART, {
    question,
    farm_id: options?.farm_id,
    conversation_id: convId,
    use_nongsaro: options?.use_nongsaro ?? true,
  });
  if (response.data?.conversation_id) {
    await cacheConversationId(response.data.conversation_id);
  }
  return response.data;
};

export const askEnhancedRAG = async (question: string): Promise<RAGResponse> => {
  const response = await ragClient.post(API_CONFIG.ENDPOINTS.RAG.ENHANCED, { question });
  if (response.data?.conversation_id) {
    await cacheConversationId(response.data.conversation_id);
  }
  return response.data;
};

// 기존 호환
export const chat = async (message: string, farmContext?: any) => {
  const response = await askSmartRAG(message, { farm_id: farmContext?.farm_id });
  return { answer: response.answer, sources: response.sources };
};

export default {
  askRAG,
  askSmartRAG,
  askEnhancedRAG,
  chat,
  getCachedConversationId,
  cacheConversationId,
  clearCachedConversationId,
  fetchMyConversation,
  ensureConversationId,
};
