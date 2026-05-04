// FacilityInfoScreen - 시설 상세 정보 설정
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFarmId, useStore, useFarmInfo } from '../store/useStore';
import ScreenWrapper from '../components/common/ScreenWrapper';
import HelpModal from '../components/common/HelpModal';
import { useHelpModal } from '../hooks/useHelpModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 대목 종류 옵션
const ROOTSTOCK_OPTIONS = [
  { value: '5BB', label: '5BB (Teleki 5BB)', desc: '석회질 토양에 강함' },
  { value: '5C', label: '5C (Teleki 5C)', desc: '습해에 강함' },
  { value: '3309C', label: '3309C (Couderc)', desc: '필록세라 저항성' },
  { value: 'R99', label: 'R 99 (Richter)', desc: '건조/염류 저항성' },
  { value: 'SO4', label: 'SO4', desc: '샤인머스캣 재배 다수' },
  { value: 'own', label: '자근 (Own-rooted)', desc: '대목 없음' },
];

// 시설 유형 옵션
const FACILITY_TYPES = [
  { value: 'single-vinyl', label: '단동 비닐하우스' },
  { value: 'multi-vinyl', label: '연동 비닐하우스' },
  { value: 'single-glass', label: '단동 유리온실' },
  { value: 'multi-glass', label: '연동 유리온실' },
  { value: 'rain-shelter', label: '비가림 시설' },
  { value: 'open', label: '노지 재배' },
];

// 재배 형태 옵션
const CULTIVATION_TYPES = [
  { value: '1', label: '토경 재배' },
  { value: '2', label: '수경 재배' },
];

// 품종 옵션
const VARIETY_OPTIONS = [
  '샤인머스캣',
  '거봉',
  '캠벨얼리',
  '청수',
  '흑보석',
  'MBA',
  '블랙사파이어',
  '기타',
];

const FacilityInfoScreen: React.FC = ({ navigation }: any) => {
  // ✅ Standardized Store Access
  const currentFarmId = useFarmId();
  const farmInfo = useFarmInfo();
  const setFarmInfo = useStore((state) => state.setFarmInfo);
  const { isVisible: showHelp, showHelp: openHelp, closeHelp } = useHelpModal('HELP_FACILITY');

  // 기본 정보
  const [farmName, setFarmName] = useState(farmInfo?.name || '');
  const [localFarmId, setLocalFarmId] = useState(currentFarmId || '');
  const [crpsnSn, setCrpsnSn] = useState('001');
  const [variety, setVariety] = useState(farmInfo?.crop || '샤인머스캣');

  // 시설 정보
  const [cultivationType, setCultivationType] = useState('1');
  const [facilityType, setFacilityType] = useState('rain-shelter');
  const [cultivationArea, setCultivationArea] = useState('');

  // 작물 정보
  const [treeAge, setTreeAge] = useState('');
  const [rootstock, setRootstock] = useState('SO4');
  const [seasonStartDate, setSeasonStartDate] = useState('2025-03-01');
  const [harvestDate, setHarvestDate] = useState('2025-09-15');

  // 재식거리 (이랑거리)
  const [rowSpacing, setRowSpacing] = useState('3.0'); // 행간 거리 (이랑거리)
  const [plantSpacing, setPlantSpacing] = useState('1.8'); // 주간 거리

  // 선택 모달 상태
  const [showVarietyPicker, setShowVarietyPicker] = useState(false);
  const [showRootstockPicker, setShowRootstockPicker] = useState(false);

  // Sync state with store updates
  useEffect(() => {
    if (farmInfo?.name) setFarmName(farmInfo.name);
    if (currentFarmId) setLocalFarmId(currentFarmId);
    if (farmInfo?.crop) setVariety(farmInfo.crop);
  }, [farmInfo, currentFarmId]);

  const saveSettings = async () => {
    if (!farmName.trim()) {
      Alert.alert('입력 오류', '농장 이름을 입력해주세요.');
      return;
    }
    if (!localFarmId.trim()) {
      Alert.alert('입력 오류', '시설 ID를 입력해주세요.');
      return;
    }

    // 시설 ID 및 정보 저장 — id(정수 PK) 보존, localFarmId(사용자 입력)는 별도
    const numericId = farmInfo?.id ?? (typeof localFarmId === 'number' ? localFarmId : Number(localFarmId)) ?? 0;
    const updatedInfo = farmInfo
      ? { ...farmInfo, name: farmName, crop: variety }
      : {
        id: numericId,
        name: farmName,
        crop: variety,
        userId: 'guest',
        region: 'unknown'
      };

    await setFarmInfo(updatedInfo); // Sync to store

    Alert.alert('저장 완료', '시설 정보가 저장되었습니다.', [
      { text: '확인', onPress: () => navigation?.goBack?.() }
    ]);
  };

  return (
    <ScreenWrapper
      title="시설 정보"
      headerRight={
        <TouchableOpacity onPress={openHelp} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      }
    >
      <HelpModal
        visible={showHelp}
        onClose={closeHelp}
        title="재배환경 설정"
        subtitle="우리 농장만의 생육 골든타임을 설정하세요."
        points={[
          {
            title: '정밀 제어 기준',
            description: '작물의 최적 생육 온도, 습도, 토양 수분 범위를 설정하여 센서 데이터가 이 범위를 벗어날 경우 즉시 대응할 수 있는 기준이 됩니다.'
          },
          {
            title: '수확량 극대화',
            description: '안티가 구현한 LAI(엽면적지수) 모델과 연동되어, 설정된 환경값에 따른 예상 수확량을 실시간으로 시뮬레이션합니다.'
          }
        ]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <ScrollView style={styles.content}>

          {/* 농장 기본 정보 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>⚙️</Text>
              <Text style={styles.sectionTitle}>농장 기본 정보</Text>
            </View>
            <Text style={styles.sectionDesc}>API 연동 및 계정 관리에 필요한 정보</Text>

            <Text style={styles.inputLabel}>농장 이름 *</Text>
            <TextInput
              style={styles.input}
              value={farmName}
              onChangeText={setFarmName}
              placeholder="예: 문수네 포도농장"
            />

            <Text style={styles.inputLabel}>시설 ID (농장 ID) *</Text>
            <Text style={styles.inputHint}>
              스마트팜 정보공유시스템에서 부여받은 고유 식별자
            </Text>
            <TextInput
              style={styles.input}
              value={localFarmId}
              onChangeText={setLocalFarmId}
              placeholder="예: FARM001"
            />

            <Text style={styles.inputLabel}>작기 일련번호 *</Text>
            <Text style={styles.inputHint}>
              현재 활성 상태인 작기를 식별하는 번호
            </Text>
            <TextInput
              style={styles.input}
              value={crpsnSn}
              onChangeText={setCrpsnSn}
              placeholder="예: 001"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>주요 작물 품종</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowVarietyPicker(!showVarietyPicker)}
            >
              <Text style={styles.selectButtonText}>{variety}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>

            {showVarietyPicker && (
              <View style={styles.optionsContainer}>
                {VARIETY_OPTIONS.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.optionItem,
                      variety === v && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setVariety(v);
                      setShowVarietyPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.optionItemText,
                      variety === v && styles.optionItemTextSelected
                    ]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 시설 환경 정보 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🗺️</Text>
              <Text style={styles.sectionTitle}>시설 환경 정보</Text>
            </View>
            <Text style={styles.sectionDesc}>시공간 데이터 융합의 기준점</Text>

            <Text style={styles.inputLabel}>재배 형태 *</Text>
            <View style={styles.radioGroup}>
              {CULTIVATION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.radioButton,
                    cultivationType === type.value && styles.radioButtonSelected
                  ]}
                  onPress={() => setCultivationType(type.value)}
                >
                  <Text style={[
                    styles.radioText,
                    cultivationType === type.value && styles.radioTextSelected
                  ]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>시설 유형</Text>
            <View style={styles.optionsGrid}>
              {FACILITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.gridOption,
                    facilityType === type.value && styles.gridOptionSelected
                  ]}
                  onPress={() => setFacilityType(type.value)}
                >
                  <Text style={[
                    styles.gridOptionText,
                    facilityType === type.value && styles.gridOptionTextSelected
                  ]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>재배 면적 (m² 또는 평)</Text>
            <TextInput
              style={styles.input}
              value={cultivationArea}
              onChangeText={setCultivationArea}
              placeholder="예: 3000 (m²) 또는 900 (평)"
              keyboardType="numeric"
            />

            {/* 농장 지도 바로가기 */}
            <TouchableOpacity
              style={styles.farmMapButton}
              onPress={() => navigation?.navigate?.('FarmMap')}
            >
              <View style={styles.farmMapButtonContent}>
                <Text style={styles.farmMapButtonIcon}>🗺️</Text>
                <View style={styles.farmMapButtonTextContainer}>
                  <Text style={styles.farmMapButtonTitle}>농장 지도</Text>
                  <Text style={styles.farmMapButtonSubtitle}>필지 정보 확인 및 내 농장 등록</Text>
                </View>
                <Text style={styles.farmMapButtonArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 작물 생육 정보 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📅</Text>
              <Text style={styles.sectionTitle}>작물 생육 정보</Text>
            </View>
            <Text style={styles.sectionDesc}>AI 진단 정확도를 높이는 포도 특화 정보</Text>

            <Text style={styles.inputLabel}>포도나무 수령 (년) *</Text>
            <Text style={styles.inputHint}>
              수령에 따라 영양분 요구량과 P-VAI 기준이 조정됩니다
            </Text>
            <TextInput
              style={styles.input}
              value={treeAge}
              onChangeText={setTreeAge}
              placeholder="예: 5"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>대목 종류</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowRootstockPicker(!showRootstockPicker)}
            >
              <Text style={styles.selectButtonText}>
                {ROOTSTOCK_OPTIONS.find(r => r.value === rootstock)?.label || rootstock}
              </Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>

            {showRootstockPicker && (
              <View style={styles.optionsContainer}>
                {ROOTSTOCK_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.optionItem,
                      rootstock === r.value && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setRootstock(r.value);
                      setShowRootstockPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.optionItemText,
                      rootstock === r.value && styles.optionItemTextSelected
                    ]}>{r.label}</Text>
                    <Text style={styles.optionItemDesc}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>재식수 *</Text>
            <Text style={styles.inputHint}>
              행간 거리와 주간 거리를 미터(m) 단위로 입력하세요
            </Text>
            <View style={styles.spacingRow}>
              <View style={styles.spacingInputContainer}>
                <Text style={styles.spacingLabel}>행간 (이랑)</Text>
                <TextInput
                  style={styles.spacingInput}
                  value={rowSpacing}
                  onChangeText={setRowSpacing}
                  placeholder="3.0"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.spacingUnit}>m</Text>
              </View>
              <Text style={styles.spacingX}>×</Text>
              <View style={styles.spacingInputContainer}>
                <Text style={styles.spacingLabel}>주간 (포기)</Text>
                <TextInput
                  style={styles.spacingInput}
                  value={plantSpacing}
                  onChangeText={setPlantSpacing}
                  placeholder="1.8"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.spacingUnit}>m</Text>
              </View>
            </View>
            <Text style={styles.spacingResult}>
              재식수: {rowSpacing}m × {plantSpacing}m
            </Text>

            <Text style={styles.inputLabel}>작기 시작일 (맹아일) *</Text>
            <Text style={styles.inputHint}>
              포도나무 눈이 트기 시작하는 날짜 (연간 분석 기점)
            </Text>
            <TextInput
              style={styles.input}
              value={seasonStartDate}
              onChangeText={setSeasonStartDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.inputLabel}>수확 목표일 *</Text>
            <Text style={styles.inputHint}>
              농약 PHI 확인 및 품질 관리 목표 시점
            </Text>
            <TextInput
              style={styles.input}
              value={harvestDate}
              onChangeText={setHarvestDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>시설 정보 저장</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 12,
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  selectArrow: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  optionsContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionItemSelected: {
    backgroundColor: '#D1FAE5',
  },
  optionItemText: {
    fontSize: 15,
    color: '#374151',
  },
  optionItemTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  optionItemDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#10B981',
  },
  radioText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: 'white',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  gridOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  gridOptionSelected: {
    backgroundColor: '#10B981',
  },
  gridOptionText: {
    fontSize: 13,
    color: '#6B7280',
  },
  gridOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
  // 농장 지도 버튼
  farmMapButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  farmMapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  farmMapButtonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  farmMapButtonTextContainer: {
    flex: 1,
  },
  farmMapButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  farmMapButtonSubtitle: {
    fontSize: 13,
    color: '#059669',
  },
  farmMapButtonArrow: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
  },
  // 재식거리 입력
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  spacingInputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  spacingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  spacingInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  spacingUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  spacingX: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  spacingResult: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default FacilityInfoScreen;
