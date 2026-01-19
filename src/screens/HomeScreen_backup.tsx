// HomeScreen - QnA 스타일 홈 화면
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const questionInputRef = useRef<TextInput>(null);
  const [question, setQuestion] = useState('');
  const [hotQuestions, setHotQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 추천 질문 로드
  useEffect(() => {
    loadHotQuestions();
  }, []);

  const loadHotQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/qna/hot-questions/`);
      if (response.data && response.data.questions) {
        setHotQuestions(response.data.questions);
      }
    } catch (error) {
      // 조용히 실패 - 기본 질문 사용
      setHotQuestions([
        '포도 재배 시 주의할 점은 무엇인가요?',
        '병해충 예방은 어떻게 하나요?',
        '적정 온도와 습도는 얼마인가요?',
      ]);
    }
  };

  // 질문 제출 (QnA 화면으로 이동)
  const handleSubmitQuestion = () => {
    if (question.trim()) {
      navigation.navigate('QnA', { initialQuestion: question });
      setQuestion('');
    }
  };

  // 추천 질문 클릭
  const handleHotQuestionPress = (selectedQuestion: string) => {
    navigation.navigate('QnA', { initialQuestion: selectedQuestion });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 환영 메시지 - 간결하게 */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeIcon}>🍇</Text>
            <Text style={styles.welcomeTitle}>안녕하세요, 포도박사입니다</Text>
            <Text style={styles.welcomeDescription}>
              구체적으로 질문하시면 더 좋은 답변을 받아볼 수 있습니다
            </Text>
          </View>

          {/* 질문 입력 박스 - 강조 */}
          <View style={styles.questionSection}>
            <Text style={styles.sectionTitle}>💬 질문하기</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={questionInputRef}
                style={styles.input}
                placeholder="포도 재배에 대해 궁금한 점을 입력하세요..."
                placeholderTextColor="#9CA3AF"
                value={question}
                onChangeText={setQuestion}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onFocus={() => {
                  // 질문 입력 박스가 상단에 보이도록 스크롤
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }, 100);
                }}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !question.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitQuestion}
                disabled={!question.trim() || isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>질문하기</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* 추천 질문 */}
          <View style={styles.recommendSection}>
            <Text style={styles.sectionTitle}>🔥 이달의 추천 질문</Text>
            <Text style={styles.sectionSubtitle}>
              많은 분들이 궁금해하시는 질문입니다
            </Text>
            {hotQuestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recommendCard}
                onPress={() => handleHotQuestionPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.recommendIconContainer}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#10B981" />
                </View>
                <Text style={styles.recommendText}>{item}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* 질문 예제 */}
          <View style={styles.exampleSection}>
            <Text style={styles.sectionTitle}>💡 질문 예제</Text>
            <Text style={styles.sectionSubtitle}>
              이런 질문들을 해보세요!
            </Text>

            <View style={styles.exampleCategory}>
              <Text style={styles.categoryTitle}>🌱 재배 관리</Text>
              {[
                '포도 전정은 언제 하나요?',
                '적심 작업은 어떻게 하나요?',
                '봉지 씌우기 시기는?',
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleHotQuestionPress(example)}
                >
                  <Text style={styles.exampleText}>• {example}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.exampleCategory}>
              <Text style={styles.categoryTitle}>🐛 병해충 관리</Text>
              {[
                '노균병 예방법은?',
                '잿빛곰팡이병 증상은?',
                '친환경 방제법 알려주세요',
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleHotQuestionPress(example)}
                >
                  <Text style={styles.exampleText}>• {example}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.exampleCategory}>
              <Text style={styles.categoryTitle}>🌡️ 환경 관리</Text>
              {[
                '적정 온도는 몇 도인가요?',
                '습도 관리는 어떻게?',
                '환기는 언제 하나요?',
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleHotQuestionPress(example)}
                >
                  <Text style={styles.exampleText}>• {example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 하단 녹색 바 높이만큼 여백 확보 */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // 하단 녹색 바 공간 확보
  },
  // 환영 섹션 - 간결하게
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  // 섹션 공통
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  // 질문 입력 섹션
  questionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 0,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // 추천 질문 섹션
  recommendSection: {
    marginBottom: 24,
  },
  recommendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  // 질문 예제 섹션
  exampleSection: {
    marginBottom: 24,
  },
  exampleCategory: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  exampleItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default HomeScreen;
