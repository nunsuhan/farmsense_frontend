// qnaApi.ts - Q&A / RAG API 서비스
import apiClient from './api';
import { QnARequest, QnAResponse } from '../types/api.types';

export const qnaApi = {
  /**
   * 포도 재배 관련 질문 전송
   * @param question 사용자 질문
   * @param conversationHistory 대화 히스토리 (선택)
   */
  askQuestion: async (data: QnARequest): Promise<QnAResponse> => {
    console.log('📡 [QnA] 질문 전송:', data.question);
    
    try {
      const response = await apiClient.post<QnAResponse>('/rag/query/', {
        question: data.question,
        conversation_history: data.conversation_history || [],
      });
      
      console.log('✅ [QnA] 답변 수신:', {
        answer_length: response.data.answer.length,
        sources_count: response.data.sources?.length || 0,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [QnA] 질문 전송 실패:', error);
      
      // 오프라인이거나 백엔드 에러 시 기본 응답
      if (!error.status || error.status >= 500) {
        return {
          answer: '죄송합니다. 현재 서버와 연결할 수 없습니다.\n네트워크 연결을 확인하고 다시 시도해주세요.',
          sources: [],
        };
      }
      
      throw error;
    }
  },

  /**
   * 채팅 기록 저장 (선택 기능)
   */
  saveChatHistory: async (messages: Array<{ role: string; content: string }>) => {
    try {
      await apiClient.post('/rag/save-history/', { messages });
      console.log('✅ [QnA] 채팅 기록 저장 완료');
    } catch (error) {
      console.error('❌ [QnA] 채팅 기록 저장 실패:', error);
      // 에러는 무시 (선택 기능)
    }
  },

  /**
   * 채팅 기록 불러오기 (선택 기능)
   */
  loadChatHistory: async () => {
    try {
      const response = await apiClient.get('/rag/load-history/');
      console.log('✅ [QnA] 채팅 기록 불러오기 완료');
      return response.data.messages || [];
    } catch (error) {
      console.error('❌ [QnA] 채팅 기록 불러오기 실패:', error);
      return [];
    }
  },
};

export default qnaApi;










