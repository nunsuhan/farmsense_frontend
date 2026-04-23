// QnAScreen - AI 상담소
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import ragApi, { fetchMyConversation, ensureConversationId } from '../services/ragApi';
import { useStore } from '../store/useStore';
import ScreenWrapper from '../components/common/ScreenWrapper';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QnAScreen: React.FC = () => {
  const route = useRoute<any>();
  const initialQuestion: string | undefined = route.params?.initialQuestion;
  const initialImage: string | undefined = route.params?.initialImage;
  const reportContext: any = route.params?.reportContext;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [partialText, setPartialText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const autoSentRef = useRef(false);

  const farmInfo = useStore(state => state.farmInfo);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      setPartialText('');
    };
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      setPartialText('');
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setInputText((prev) => (prev ? prev + ' ' : '') + text);
        setPartialText('');
      }
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setPartialText(e.value[0]);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setIsListening(false);
      setPartialText('');
      const errorCode = e.error?.code;
      const errorMessage = e.error?.message;
      if (errorCode === '7' || errorMessage?.includes('No match')) {
        // No match, do nothing
      } else if (errorCode === '11') {
        Alert.alert('알림', '음성을 인식하지 못했습니다. 다시 시도해주세요.');
      } else {
        console.error(e.error);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // 마운트 시 서버에서 내 대화 기록 복원 (앱 재설치 또는 첫 진입 시 AsyncStorage 없음 대비)
  useEffect(() => {
    (async () => {
      try {
        const conv = await fetchMyConversation();
        if (conv && Array.isArray(conv.recent_messages) && conv.recent_messages.length > 0) {
          const restored: Message[] = conv.recent_messages.map((m, i) => ({
            id: `${conv.conversation_id}-${i}`,
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: m.content || '',
          }));
          setMessages((prev) => (prev.length === 0 ? restored : prev));
        } else {
          // 없으면 캐시만 확보 (다음 질문 시 conversation_id 전달용)
          await ensureConversationId();
        }
      } catch (e) {
        console.log('[QnAScreen] conversation 복원 실패', e);
      }
    })();
  }, []);

  // 외부에서 전달된 질문/이미지를 초기 메시지로 자동 전송
  useEffect(() => {
    if (autoSentRef.current) return;
    if (!initialQuestion && !initialImage) return;
    autoSentRef.current = true;

    (async () => {
      const question = (initialQuestion || '').trim();
      // 이미지가 있을 때는 시스템 안내 메시지만 먼저 삽입 (RAG는 텍스트 전용)
      if (initialImage) {
        const noticeText = question
          ? `${question}\n\n[사진 첨부: 현재 AI는 텍스트 기반으로 응답합니다. 이미지 분석은 진단 탭을 이용해 주세요.]`
          : '[사진 첨부: 현재 AI는 텍스트 기반으로 응답합니다. 이미지 분석은 진단 탭을 이용해 주세요.]';
        const notice: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: noticeText,
        };
        setMessages((prev) => [...prev, notice]);
      }
      if (question) {
        // 보고서 컨텍스트가 있으면 질문 앞에 간단 요약 붙여 전송
        let payload = question;
        if (reportContext?.cards && Array.isArray(reportContext.cards)) {
          const summary = reportContext.cards
            .slice(0, 3)
            .map((c: any) => `- ${c.title}: ${c.body}`)
            .join('\n');
          if (summary) {
            payload = `[오늘의 보고서]\n${summary}\n\n[질문] ${question}`;
          }
        }
        setIsLoading(true);
        try {
          const response = await ragApi.chat(payload, farmInfo);
          const assistant: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.answer || '답변을 가져올 수 없습니다.',
          };
          setMessages((prev) => [...prev, assistant]);
        } catch {
          const err: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
          };
          setMessages((prev) => [...prev, err]);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [initialQuestion, initialImage, reportContext, farmInfo]);

  const toggleListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        Keyboard.dismiss();
        await Voice.destroy();
        setPartialText('');
        await Voice.start('ko-KR');
        setIsListening(true);
      }
    } catch (e) {
      console.error(e);
      setIsListening(false);
      Alert.alert('오류', '음성 인식을 시작할 수 없습니다. 권한을 확인해주세요.');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    Keyboard.dismiss();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await ragApi.chat(userMessage.content, farmInfo);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer || '답변을 가져올 수 없습니다.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.role === 'user' ? styles.userText : styles.assistantText
      ]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper title="AI 상담소" showBack showMenu={false}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>포도 재배에 대해 무엇이든 물어보세요!</Text>
            <Text style={styles.emptySubText}>예: 노균병 방제 방법, 샤인머스캣 당도 올리기</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={toggleListening}
          >
            <Ionicons
              name={isListening ? "radio-outline" : "mic-outline"}
              size={24}
              color={isListening ? "#fff" : "#6B7280"}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={isListening ? (inputText + (inputText && !inputText.endsWith(' ') ? ' ' : '') + partialText) : inputText}
            onChangeText={setInputText}
            placeholder={isListening ? "듣고 있어요..." : "질문을 입력하세요..."}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#374151',
  },
  micButton: {
    marginRight: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  micButtonActive: {
    backgroundColor: '#EF4444', // Active red color
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#10B981',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});

export default QnAScreen;
