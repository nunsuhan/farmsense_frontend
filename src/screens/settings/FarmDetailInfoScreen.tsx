import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useStore } from '../../store/useStore';

const FarmDetailInfoScreen = () => {
  const navigation = useNavigation();
  const { farmInfo, setFarmInfo } = useStore();

  // 로컬 상태
  const [soilType, setSoilType] = useState('LOAM');
  const [irrigationType, setIrrigationType] = useState('DRIP');
  const [pestHistory, setPestHistory] = useState('');

  // New Switch States with Defaults
  const [hasIrrigation, setHasIrrigation] = useState(true);
  const [hasDrainage, setHasDrainage] = useState(true);
  const [hasSubsoiling, setHasSubsoiling] = useState(false);
  const [hasUV, setHasUV] = useState(true);
  const [hasMat, setHasMat] = useState(false);

  // 초기 로드
  useEffect(() => {
    if (farmInfo) {
      setSoilType(farmInfo.soilType || 'LOAM');
      setIrrigationType(farmInfo.irrigationType || 'DRIP');
      setPestHistory(farmInfo.pestHistory || '');

      // Load boolean flags if present, otherwise default
      // Note: Store types need to support these, otherwise we treat them as local for now
      // Assuming we extend FarmInfo later or save them in 'detailedInfo' object
    }
  }, [farmInfo]);

  const handleSave = async () => {
    if (!farmInfo) {
      Alert.alert('알림', '먼저 기본 정보를 설정해주세요.');
      return;
    }

    const updatedInfo = {
      ...farmInfo,
      soilType,
      irrigationType,
      pestHistory,
      // Save flags
      hasIrrigation,
      hasDrainage,
      hasSubsoiling,
      hasUV,
      hasMat
    };

    await setFarmInfo(updatedInfo);
    Alert.alert('저장 완료', '상세 정보가 저장되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const renderSelect = (label: string, value: string, setter: (t: string) => void, options: { label: string, value: string }[]) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, value === opt.value && styles.chipActive]}
            onPress={() => setter(opt.value)}
          >
            <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenWrapper title="상세 재배 환경" showBack={true} showMenu={false}>
      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            상세 정보를 입력하면 AI가 더 정확한 진단을 내릴 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>토양 및 관수</Text>
          </View>

          {renderSelect('토양 종류', soilType, setSoilType, [
            { label: '사질토 (모래)', value: 'SANDY' },
            { label: '양토 (적당함)', value: 'LOAM' },
            { label: '식양토 (진흙)', value: 'CLAY' },
          ])}

          {/* New Switches Section */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>관수 시설 (유공관)</Text>
            <Switch
              value={hasIrrigation}
              onValueChange={setHasIrrigation}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            />
          </View>

          {hasIrrigation && renderSelect('관수 방식', irrigationType, setIrrigationType, [
            { label: '점적관수', value: 'DRIP' },
            { label: '스프링클러', value: 'SPRINKLER' },
            { label: '분수호스', value: 'HOSE' },
          ])}

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>배수 시설</Text>
            <Switch
              value={hasDrainage}
              onValueChange={setHasDrainage}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>추가 시설 옵션</Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>심토 파쇄</Text>
            <Switch value={hasSubsoiling} onValueChange={setHasSubsoiling} trackColor={{ false: '#D1D5DB', true: '#10B981' }} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>UV 차단 필름</Text>
            <Switch value={hasUV} onValueChange={setHasUV} trackColor={{ false: '#D1D5DB', true: '#10B981' }} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>바닥 매트</Text>
            <Switch value={hasMat} onValueChange={setHasMat} trackColor={{ false: '#D1D5DB', true: '#10B981' }} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bug" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>병해충 이력</Text>
          </View>

          <Text style={styles.label}>최근 3년 내 주요 병해충 (선택)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={pestHistory}
            onChangeText={setPestHistory}
            placeholder="예: 2023년 탄저병 발생, 2022년 갈색무늬병..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: '#1D4ED8',
    fontSize: 14,
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#4B5563',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#047857',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Switch Styles
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default FarmDetailInfoScreen;
