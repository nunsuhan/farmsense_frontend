// src/screens/settings/SupportScreen.tsx
// 간소화: 인적사항 입력 없이 바로 오류 신고 (로그인 사용자 정보는 서버가 JWT에서 자동 추출)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useStore } from '../../store/useStore';

const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useStore((s) => s.user) as any;

  const [category, setCategory] = useState('오류/버그 신고');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = [
    '오류/버그 신고',
    '사용법 문의',
    '기능 제안',
    '기타',
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('알림', '문의 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    const formData = {
      _subject: `[FarmSense] ${category}`,
      category,
      name: user?.first_name || user?.username || '(익명)',
      email: user?.email || '',
      phone: user?.phone_number || '',
      farm: user?.farm_name || '',
      message,
    };

    try {
      const response = await fetch('https://formspree.io/f/xvgelwkv', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        Alert.alert('오류', '전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (e) {
      console.error('Submission error:', e);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ScreenWrapper title="오류 신고" showBack showMenu={false}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.successTitle}>신고가 접수되었습니다</Text>
          <Text style={styles.successSubtitle}>1~2일 내에 답변드리겠습니다.</Text>
          <TouchableOpacity style={styles.submitButton} onPress={() => navigation.goBack()}>
            <Text style={styles.submitButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="오류 신고" showBack showMenu={false}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.description}>
          불편한 점이나 오류를 알려주세요. 로그인 정보는 자동으로 함께 전송됩니다.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>문의 유형</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.selectText}>{category}</Text>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            내용 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="어떤 문제가 있었는지 자세히 적어주세요."
            placeholderTextColor="#D1D5DB"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>신고하기</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>문의 유형 선택</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      category === item && { color: '#10B981', fontWeight: 'bold' },
                    ]}
                  >
                    {item}
                  </Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20 },
  description: { color: '#6B7280', marginBottom: 24, fontSize: 14, lineHeight: 22 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#EF4444' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { height: 160 },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: { fontSize: 15, color: '#111827' },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: '#A7F3D0' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: -60 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 8 },
  successSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: { fontSize: 16, color: '#374151' },
});

export default SupportScreen;
