/**
 * AskReportBar - 메인 보고서 하단 AI 질문 입력창
 * 텍스트 + 사진 첨부 → AI상담 탭으로 전달
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors, shadows } from '../../theme/colors';

interface Props {
  reportContext?: any;
}

const AskReportBar: React.FC<Props> = ({ reportContext }) => {
  const navigation = useNavigation<any>();
  const [question, setQuestion] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!r.canceled && r.assets[0]?.uri) {
      setImageUri(r.assets[0].uri);
    }
  };

  const submit = () => {
    const trimmed = question.trim();
    if (!trimmed && !imageUri) {
      Alert.alert('알림', '질문을 입력하거나 사진을 첨부해주세요.');
      return;
    }
    // AI상담 탭으로 이동하면서 질문/이미지/보고서 컨텍스트 전달
    navigation.navigate('ConsultTab', {
      initialQuestion: trimmed,
      initialImage: imageUri,
      reportContext,
    });
    setQuestion('');
    setImageUri(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>이 보고서에 대해 AI에게 물어보기</Text>
      </View>

      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.thumb} />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setImageUri(null)}
          >
            <Ionicons name="close-circle" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
          <Ionicons name="image-outline" size={22} color={colors.textSub} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="예: 오늘 환기 권고 이유 상세 설명"
          placeholderTextColor={colors.textDisabled}
          value={question}
          onChangeText={setQuestion}
          multiline
          maxLength={300}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={submit}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    ...shadows.small,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  imagePreview: { marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' },
  thumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F3F4F6' },
  removeBtn: { marginLeft: -10, marginTop: -6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachBtn: { padding: 6 },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 96,
    fontSize: 14,
    color: colors.text,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AskReportBar;
