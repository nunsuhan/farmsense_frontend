/**
 * SprayRecordScreen - 방제 기록 등록
 * 살포 정보 + 수출국 PLS 잔류농약 체크
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows } from '../../theme/colors';

const PLS_COUNTRIES = [
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'TW', name: '대만', flag: '🇹🇼' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
  { code: 'SG', name: '싱가포르', flag: '🇸🇬' },
  { code: 'HK', name: '홍콩', flag: '🇭🇰' },
];

const SPRAY_METHODS = ['경엽처리', '관주처리', '연무', '훈증'];
const WEATHER_OPTIONS = ['맑음', '흐림', '비', '바람'];

const SprayRecordScreen = () => {
  const navigation = useNavigation<any>();
  const [pesticideName, setPesticideName] = useState('');
  const [dilutionRatio, setDilutionRatio] = useState('');
  const [sprayAmount, setSprayAmount] = useState('');
  const [area, setArea] = useState('');
  const [safetyDays, setSafetyDays] = useState('');
  const [method, setMethod] = useState('경엽처리');
  const [weather, setWeather] = useState('맑음');
  const [memo, setMemo] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('JP');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [plsChecking, setPlsChecking] = useState(false);
  const [plsResult, setPlsResult] = useState<{ safe: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePlsCheck = async () => {
    if (!pesticideName.trim()) {
      Alert.alert('입력 필요', '농약명을 먼저 입력해주세요.');
      return;
    }
    setPlsChecking(true);
    setPlsResult(null);

    // TODO: 실제 API 연동
    setTimeout(() => {
      setPlsResult({
        safe: true,
        message: `${PLS_COUNTRIES.find((c) => c.code === selectedCountry)?.name} 기준 잔류허용량 이내입니다.`,
      });
      setPlsChecking(false);
    }, 1000);
  };

  const handleSave = () => {
    if (!pesticideName.trim()) {
      Alert.alert('입력 필요', '농약명을 입력해주세요.');
      return;
    }
    setSaving(true);
    // TODO: 실제 저장 API
    setTimeout(() => {
      setSaving(false);
      Alert.alert('저장 완료', '방제 기록이 영농일지에 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }, 800);
  };

  const selectedCountryData = PLS_COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>방제 기록 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 농약 정보 */}
        <Text style={styles.sectionTitle}>농약 정보</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>농약명</Text>
          <TextInput
            style={styles.textInput}
            value={pesticideName}
            onChangeText={setPesticideName}
            placeholder="농약명을 입력하세요"
            placeholderTextColor={colors.textDisabled}
          />
        </View>

        {/* 살포 정보 */}
        <Text style={styles.sectionTitle}>살포 정보</Text>
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>희석배율</Text>
              <TextInput
                style={styles.textInput}
                value={dilutionRatio}
                onChangeText={setDilutionRatio}
                placeholder="예: 1000배"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>살포량 (L)</Text>
              <TextInput
                style={styles.textInput}
                value={sprayAmount}
                onChangeText={setSprayAmount}
                placeholder="예: 200"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>면적 (평)</Text>
              <TextInput
                style={styles.textInput}
                value={area}
                onChangeText={setArea}
                placeholder="예: 300"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>안전사용기간 (일)</Text>
              <TextInput
                style={styles.textInput}
                value={safetyDays}
                onChangeText={setSafetyDays}
                placeholder="예: 14"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>살포 장비</Text>
          <View style={styles.chipRow}>
            {SPRAY_METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, method === m && styles.chipActive]}
                onPress={() => setMethod(m)}
              >
                <Text style={[styles.chipText, method === m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>기상 조건</Text>
          <View style={styles.chipRow}>
            {WEATHER_OPTIONS.map((w) => (
              <TouchableOpacity
                key={w}
                style={[styles.chip, weather === w && styles.chipActive]}
                onPress={() => setWeather(w)}
              >
                <Text style={[styles.chipText, weather === w && styles.chipTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>메모</Text>
          <TextInput
            style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
            value={memo}
            onChangeText={setMemo}
            placeholder="특이사항을 기록하세요"
            placeholderTextColor={colors.textDisabled}
            multiline
          />
        </View>

        {/* PLS 체크 */}
        <Text style={styles.sectionTitle}>🌍 수출국 PLS 잔류농약 체크</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>수출 대상국</Text>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <Text style={styles.countrySelectorText}>
              {selectedCountryData?.flag} {selectedCountryData?.name}
            </Text>
            <Ionicons
              name={showCountryPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSub}
            />
          </TouchableOpacity>

          {showCountryPicker && (
            <View style={styles.countryList}>
              {PLS_COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryItem,
                    selectedCountry === c.code && styles.countryItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCountry(c.code);
                    setShowCountryPicker(false);
                    setPlsResult(null);
                  }}
                >
                  <Text style={styles.countryItemText}>
                    {c.flag} {c.name}
                  </Text>
                  {selectedCountry === c.code && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.plsCheckButton}
            onPress={handlePlsCheck}
            disabled={plsChecking}
          >
            {plsChecking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
                <Text style={styles.plsCheckText}>PLS 기준 확인</Text>
              </>
            )}
          </TouchableOpacity>

          {plsResult && (
            <View
              style={[
                styles.plsResultCard,
                { backgroundColor: plsResult.safe ? '#ECFDF5' : '#FEF2F2' },
              ]}
            >
              <Ionicons
                name={plsResult.safe ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={plsResult.safe ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.plsResultText,
                  { color: plsResult.safe ? '#065F46' : '#991B1B' },
                ]}
              >
                {plsResult.message}
              </Text>
            </View>
          )}
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>영농일지에 저장</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10, marginTop: 8 },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    ...shadows.small,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSub, marginBottom: 6, marginTop: 10 },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.textSub },
  chipTextActive: { color: '#FFFFFF' },
  countrySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  countrySelectorText: { fontSize: 15, color: colors.text },
  countryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    overflow: 'hidden',
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryItemActive: { backgroundColor: '#ECFDF5' },
  countryItemText: { fontSize: 15, color: colors.text },
  plsCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    gap: 8,
  },
  plsCheckText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  plsResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  plsResultText: { flex: 1, fontSize: 14, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default SprayRecordScreen;
