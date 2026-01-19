/**
 * 농약 기록 화면 (Pesticide Record Screen)
 * Week 7 Day 2
 * 
 * 핵심 기능:
 * - 농약 검색 (공공 API 연동)
 * - 살포 일자 선택
 * - PHI 자동 계산
 * - 기록 저장
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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/common/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { FarmSenseColors, softShadow } from '../theme/colors';
import { pesticideApi } from '../services/pesticideApi';
import { useFarmId } from '../store/useStore';

interface PesticideSearchResult {
  pesti_code: string;
  pesticide_name: string;
  brand_name: string;
  crop_name: string;
  target_disease: string;
  phi_days: number;
  company_name: string;
  usage: string;
}

const PesticideRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const farmId = useFarmId() || 'TEST';

  // 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PesticideSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPesticide, setSelectedPesticide] = useState<PesticideSearchResult | null>(null);
  const [applicationDate, setApplicationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // 농약 검색
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('입력 오류', '농약명 또는 병해명을 입력해주세요.');
      return;
    }

    try {
      setSearching(true);
      // TODO: 실제 공공 API 연동 (Phase 7 통합)
      // const results = await pesticideApi.searchPesticides('포도', searchQuery);

      // Mock 데이터
      const mockResults: PesticideSearchResult[] = [
        {
          pesti_code: 'PEST001',
          pesticide_name: '탄저병약',
          brand_name: 'Anthracnose Killer A',
          crop_name: '포도',
          target_disease: '탄저병',
          phi_days: 7,
          company_name: '농약회사A',
          usage: '1000배 희석 살포',
        },
        {
          pesti_code: 'PEST002',
          pesticide_name: '노균병약',
          brand_name: 'Downy Mildew Fighter',
          crop_name: '포도',
          target_disease: '노균병',
          phi_days: 10,
          company_name: '농약회사B',
          usage: '500배 희석 살포',
        },
        {
          pesti_code: 'PEST003',
          pesticide_name: '흰가루병약',
          brand_name: 'Powdery Mildew Blocker',
          crop_name: '포도',
          target_disease: '흰가루병',
          phi_days: 14,
          company_name: '농약회사C',
          usage: '2000배 희석 살포',
        },
      ];

      setSearchResults(mockResults);
    } catch (error) {
      console.error('농약 검색 실패:', error);
      Alert.alert('오류', '농약 정보를 불러오는데 실패했습니다.');
    } finally {
      setSearching(false);
    }
  };

  // 농약 선택
  const handleSelectPesticide = (pesticide: PesticideSearchResult) => {
    setSelectedPesticide(pesticide);
    setSearchResults([]);
    setSearchQuery('');
  };

  // 날짜 선택 (간단한 날짜 버튼 방식)
  const handleDateSelect = (daysAgo: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysAgo);
    setApplicationDate(newDate);
    setShowDatePicker(false);
  };

  // 안전 수확일 계산
  const getSafeHarvestDate = (): Date => {
    if (!selectedPesticide) return new Date();
    const safeDate = new Date(applicationDate);
    safeDate.setDate(safeDate.getDate() + selectedPesticide.phi_days);
    return safeDate;
  };

  // 기록 저장
  const handleSave = async () => {
    if (!selectedPesticide) {
      Alert.alert('선택 오류', '농약을 선택해주세요.');
      return;
    }

    try {
      setSaving(true);

      const recordData = {
        facility_id: farmId,
        pesticide_code: selectedPesticide.pesti_code,
        pesticide_name: selectedPesticide.pesticide_name,
        brand_name: selectedPesticide.brand_name,
        target_disease: selectedPesticide.target_disease,
        application_date: applicationDate.toISOString().split('T')[0],
        phi_days: selectedPesticide.phi_days,
        notes: notes.trim(),
      };

      await pesticideApi.createRecord(recordData);

      Alert.alert(
        '저장 완료',
        `농약 살포 기록이 저장되었습니다.\n안전 수확일: ${getSafeHarvestDate().toLocaleDateString('ko-KR')}`,
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('기록 저장 실패:', error);
      Alert.alert('오류', '기록을 저장하는데 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setSelectedPesticide(null);
    setApplicationDate(new Date());
    setNotes('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <ScreenWrapper title="농약 기록">
      {/* 초기화 버튼 */}
      <View style={styles.topActions}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>🔄 초기화</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* 1. 농약 검색 */}
          <View style={[styles.card, softShadow]}>
            <Text style={styles.cardTitle}>🔍 농약 검색</Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="농약명 또는 병해명 입력 (예: 탄저병)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.searchButtonText}>검색</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 검색 결과 */}
            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.pesti_code}
                    style={styles.resultItem}
                    onPress={() => handleSelectPesticide(item)}
                  >
                    <Text style={styles.resultName}>{item.brand_name}</Text>
                    <Text style={styles.resultDetail}>
                      {item.pesticide_name} | {item.target_disease}
                    </Text>
                    <Text style={styles.resultPHI}>PHI: {item.phi_days}일</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 2. 선택된 농약 정보 */}
          {selectedPesticide && (
            <View style={[styles.card, softShadow, styles.selectedCard]}>
              <Text style={styles.cardTitle}>✅ 선택된 농약</Text>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedPesticide.brand_name}</Text>
                <Text style={styles.selectedDetail}>
                  {selectedPesticide.pesticide_name} | {selectedPesticide.target_disease}
                </Text>
                <View style={styles.phiBadge}>
                  <Text style={styles.phiBadgeText}>
                    PHI: {selectedPesticide.phi_days}일
                  </Text>
                </View>
                <Text style={styles.selectedUsage}>
                  사용법: {selectedPesticide.usage}
                </Text>
              </View>
            </View>
          )}

          {/* 3. 살포 일자 선택 */}
          {selectedPesticide && (
            <View style={[styles.card, softShadow]}>
              <Text style={styles.cardTitle}>📅 살포 일자</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {applicationDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </Text>
              </TouchableOpacity>

              {/* 안전 수확일 표시 */}
              <View style={styles.safeHarvestInfo}>
                <Text style={styles.safeHarvestLabel}>안전 수확일:</Text>
                <Text style={styles.safeHarvestDate}>
                  {getSafeHarvestDate().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* 4. 메모 */}
          {selectedPesticide && (
            <View style={[styles.card, softShadow]}>
              <Text style={styles.cardTitle}>📝 메모 (선택사항)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="살포 방법, 기상 조건 등 추가 정보를 입력하세요."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* 5. 저장 버튼 */}
          {selectedPesticide && (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>💾 기록 저장</Text>
              )}
            </TouchableOpacity>
          )}

          {/* 안내 문구 */}
          {!selectedPesticide && searchResults.length === 0 && (
            <View style={styles.guideContainer}>
              <Text style={styles.guideEmoji}>🌿</Text>
              <Text style={styles.guideTitle}>농약 살포 기록하기</Text>
              <Text style={styles.guideText}>
                1. 농약명 또는 대상 병해를 검색하세요.{'\n'}
                2. 목록에서 사용한 농약을 선택하세요.{'\n'}
                3. 살포 일자를 선택하고 저장하세요.{'\n'}
                4. PHI가 자동으로 계산되어 안전 수확일을 알려드립니다.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 간단한 날짜 선택 모달 (Expo Go 호환) */}
      {showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerButton}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>살포 일자 선택</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* 날짜 선택 버튼들 */}
              <View style={styles.dateOptions}>
                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => handleDateSelect(0)}
                >
                  <Text style={styles.dateOptionText}>오늘</Text>
                  <Text style={styles.dateOptionDetail}>
                    {new Date().toLocaleDateString('ko-KR')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => handleDateSelect(1)}
                >
                  <Text style={styles.dateOptionText}>어제</Text>
                  <Text style={styles.dateOptionDetail}>
                    {new Date(Date.now() - 86400000).toLocaleDateString('ko-KR')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => handleDateSelect(2)}
                >
                  <Text style={styles.dateOptionText}>2일 전</Text>
                  <Text style={styles.dateOptionDetail}>
                    {new Date(Date.now() - 172800000).toLocaleDateString('ko-KR')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => handleDateSelect(3)}
                >
                  <Text style={styles.dateOptionText}>3일 전</Text>
                  <Text style={styles.dateOptionDetail}>
                    {new Date(Date.now() - 259200000).toLocaleDateString('ko-KR')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => handleDateSelect(7)}
                >
                  <Text style={styles.dateOptionText}>1주일 전</Text>
                  <Text style={styles.dateOptionDetail}>
                    {new Date(Date.now() - 604800000).toLocaleDateString('ko-KR')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FarmSenseColors.background,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  resetButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: FarmSenseColors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: FarmSenseColors.text.primary,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
  },
  searchButton: {
    backgroundColor: FarmSenseColors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: FarmSenseColors.card.border,
    paddingTop: 12,
  },
  resultItem: {
    padding: 12,
    backgroundColor: FarmSenseColors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: FarmSenseColors.primary,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
    marginBottom: 4,
  },
  resultDetail: {
    fontSize: 13,
    color: FarmSenseColors.text.secondary,
    marginBottom: 4,
  },
  resultPHI: {
    fontSize: 12,
    color: FarmSenseColors.primary,
    fontWeight: '600',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: FarmSenseColors.primary,
  },
  selectedInfo: {
    gap: 8,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: FarmSenseColors.text.primary,
  },
  selectedDetail: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
  },
  phiBadge: {
    backgroundColor: FarmSenseColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  phiBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedUsage: {
    fontSize: 13,
    color: FarmSenseColors.text.secondary,
    backgroundColor: FarmSenseColors.background,
    padding: 10,
    borderRadius: 8,
  },
  dateButton: {
    backgroundColor: FarmSenseColors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: FarmSenseColors.text.primary,
    textAlign: 'center',
  },
  safeHarvestInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: FarmSenseColors.warning,
  },
  safeHarvestLabel: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 4,
  },
  safeHarvestDate: {
    fontSize: 18,
    color: '#92400E',
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: FarmSenseColors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: FarmSenseColors.text.primary,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: FarmSenseColors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guideContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  guideEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
    marginBottom: 12,
  },
  guideText: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: FarmSenseColors.card.border,
  },
  datePickerButton: {
    fontSize: 16,
    color: FarmSenseColors.text.secondary,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
  },
  dateOptions: {
    padding: 16,
  },
  dateOption: {
    backgroundColor: FarmSenseColors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: FarmSenseColors.card.border,
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
    marginBottom: 4,
  },
  dateOptionDetail: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
  },
});

export default PesticideRecordScreen;

