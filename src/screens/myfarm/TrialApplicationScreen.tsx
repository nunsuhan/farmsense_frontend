/**
 * TrialApplicationScreen - 시범농가 무료 신청
 * POST /api/trial/apply/  (비로그인 가능)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { applyTrial, FarmType } from '../../services/trialApi';

const FARM_TYPES: Array<{ key: FarmType; label: string }> = [
  { key: 'rain_shelter', label: '비가림' },
  { key: 'greenhouse', label: '하우스' },
  { key: 'open_field', label: '노지' },
];

const TrialApplicationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [farmType, setFarmType] = useState<FarmType>('rain_shelter');
  const [areaPyeong, setAreaPyeong] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !location.trim() || !areaPyeong.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }
    const area = parseInt(areaPyeong.replace(/[^0-9]/g, ''), 10);
    if (isNaN(area) || area <= 0) {
      Alert.alert('알림', '면적(평)을 숫자로 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await applyTrial({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        farm_type: farmType,
        area_pyeong: area,
      });
      Alert.alert(
        '신청 완료',
        res.message || '접수가 완료되었습니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || '신청에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시범농가 신청</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.banner}>
            <Ionicons name="leaf" size={24} color="#16A34A" />
            <Text style={styles.bannerText}>
              10농가 모집 중 · 센서 50% 할인 + 설치비 무료{'\n'}
              선정되시면 전화로 안내드립니다.
            </Text>
          </View>

          <Field label="이름" required>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="홍길동"
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="연락처" required>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="010-1234-5678"
              placeholderTextColor="#D1D5DB"
              keyboardType="phone-pad"
            />
          </Field>

          <Field label="포도밭 위치" required>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="예: 대구광역시 달성군"
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="재배 방식" required>
            <View style={styles.typeRow}>
              {FARM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, farmType === t.key && styles.typeBtnActive]}
                  onPress={() => setFarmType(t.key)}
                >
                  <Text style={[styles.typeBtnText, farmType === t.key && styles.typeBtnTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="면적(평)" required>
            <TextInput
              style={styles.input}
              value={areaPyeong}
              onChangeText={setAreaPyeong}
              placeholder="예: 500"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
            />
          </Field>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>신청하기</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            * 제출한 정보는 시범농가 선정 용도로만 사용되며,{'\n'}운영자가 직접 연락드립니다.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
    </Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: 20 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  bannerText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  typeBtnText: { fontSize: 14, color: colors.textSub, fontWeight: '600' },
  typeBtnTextActive: { color: '#16A34A' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: '#A7F3D0' },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  note: {
    fontSize: 12,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});

export default TrialApplicationScreen;
