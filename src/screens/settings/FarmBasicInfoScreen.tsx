import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useStore } from '../../store/useStore';
import { GRAPE_VARIETIES } from '../../constants/grapeContext'; // 품종 데이터 연동
import HelpModal from '../../components/common/HelpModal';
import { useHelpModal } from '../../hooks/useHelpModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { farmmapApi } from '../../services/farmmapApi';

const FarmBasicInfoScreen = () => {
  const navigation = useNavigation();
  const { farmInfo, setFarmInfo } = useStore(); // 전역 스토어
  const { isVisible: showHelp, showHelp: openHelp, closeHelp } = useHelpModal('HELP_FARM_BASIC');

  // 로컬 상태
  const [farmName, setFarmName] = useState('');
  const [variety, setVariety] = useState('SHINE_MUSCAT');
  const [cultivationType, setCultivationType] = useState('RAIN_SHELTER');
  const [plantingYear, setPlantingYear] = useState('2020');
  const [region, setRegion] = useState('경북 김천'); // This is now used as Address

  // 초기 로드
  useEffect(() => {
    if (farmInfo) {
      setFarmName(farmInfo.name || '');
      setVariety(farmInfo.variety || 'SHINE_MUSCAT');
      setCultivationType(farmInfo.cultivationType || 'RAIN_SHELTER');
      setPlantingYear(farmInfo.plantingYear || '2020');
      setRegion(farmInfo.address || farmInfo.region || '');
    }
  }, [farmInfo]);

  const handleSave = async () => {
    if (!farmName) {
      Alert.alert('알림', '농장 이름을 입력해주세요.');
      return;
    }

    if (farmInfo) {
      const info = {
        ...farmInfo,
        name: farmName,
        variety,
        cultivationType,
        plantingYear,
        address: region, // Save as address
        region: region,  // Keep region for compatibility
      };

      // Sync Geo automatically on save
      try {
        await farmmapApi.syncFarmGeo(farmInfo.id, region);
      } catch (e) {
        console.log('Geo Sync Failed silently');
      }

      await setFarmInfo(info);
      Alert.alert('저장 완료', '농장 정보가 저장되었습니다.\n이제 질문 작성 시 자동으로 입력됩니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('오류', '초기 농장 정보가 없습니다.');
    }
  };

  const renderInput = (label: string, value: string, setter: (t: string) => void, placeholder: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
      />
    </View>
  );

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
    <ScreenWrapper
      title="농장 기본정보"
      showMenu={true}
      headerRight={
        <TouchableOpacity onPress={openHelp} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      }
    >
      <HelpModal
        visible={showHelp}
        onClose={closeHelp}
        title="농장 기본정보"
        subtitle="정확한 데이터 분석의 시작입니다."
        points={[
          {
            title: '위치 기반 최적화',
            description: '농장 주소를 기반으로 기상청의 실시간 국지 예보와 연동하여 내 농장만을 위한 기상 정보를 제공합니다.'
          },
          {
            title: '재배 품종 맞춤형 가이드',
            description: '등록된 재배 작물(예: 포도)에 따라 AI가 최적의 생육 단계별 권장 환경값을 설정합니다.'
          }
        ]}
      />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>기본 정보</Text>
          </View>

          {renderInput('농장 이름', farmName, setFarmName, '예: 행복한 포도농장')}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>농장 주소 (위치 연동)</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={region}
                onChangeText={setRegion}
                placeholder="예: 경북 김천시 농소면 월곡리 123"
              />
              <TouchableOpacity
                style={styles.checkButton}
                onPress={async () => {
                  if (!region) return Alert.alert('알림', '주소를 입력해주세요.');
                  try {
                    const farmId = farmInfo?.id || 'farm-123';
                    const result = await farmmapApi.syncFarmGeo(farmId, region);
                    Alert.alert('위치 확인', `${result.message}\n(좌표: ${result.coordinates.lat}, ${result.coordinates.lon})`);
                  } catch (e) {
                    Alert.alert('오류', '주소를 찾을 수 없습니다.');
                  }
                }}
              >
                <Text style={styles.checkButtonText}>주소 확인</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Farm Map Registration Button (Restored) */}
          <TouchableOpacity
            style={styles.farmMapButton}
            onPress={() => navigation.navigate('FarmMap' as never)}
          >
            <View style={styles.farmMapButtonContent}>
              <Text style={styles.farmMapButtonIcon}>🗺️</Text>
              <View style={styles.farmMapButtonTextContainer}>
                <Text style={styles.farmMapButtonTitle}>농장 위치 등록 (지도)</Text>
                <Text style={styles.farmMapButtonSubtitle}>지도에서 내 농장 위치와 필지를 확인하세요</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>재배 환경</Text>
          </View>

          {renderSelect('품종', variety, setVariety,
            GRAPE_VARIETIES.map(v => ({ label: v.label, value: v.id }))
          )}

          {renderSelect('재배 형태', cultivationType, setCultivationType, [
            { label: '비가림', value: 'RAIN_SHELTER' },
            { label: '노지', value: 'OPEN_FIELD' },
            { label: '하우스', value: 'PLASTIC_HOUSE' },
            { label: '스마트팜', value: 'SMART_FARM' },
          ])}

          {renderInput('식재 연도 (정식)', plantingYear, setPlantingYear, '예: 2020')}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#10B981', marginBottom: 12 }]}
          onPress={() => navigation.navigate('FarmDetail' as never)}
        >
          <Text style={[styles.saveButtonText, { color: '#10B981' }]}>농장 상세 정보 입력하기</Text>
        </TouchableOpacity>

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
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  checkButton: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
  // Farm Map Button Styles
  farmMapButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  farmMapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  farmMapButtonIcon: {
    fontSize: 28,
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
});

export default FarmBasicInfoScreen;
