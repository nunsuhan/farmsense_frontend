import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useStore } from '../../store/useStore';
import { GRAPE_VARIETIES } from '../../constants/grapeContext';
import HelpModal from '../../components/common/HelpModal';
import { useHelpModal } from '../../hooks/useHelpModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { farmmapApi } from '../../services/farmmapApi';
import { authApi } from '../../services/authApi';

type FarmBasicInfoRouteParams = {
  FarmBasicInfo: { isInitialSetup?: boolean };
};

const FarmBasicInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<FarmBasicInfoRouteParams, 'FarmBasicInfo'>>();
  const isInitialSetup = !!route.params?.isInitialSetup;
  const { farmInfo, setFarmInfo, setUser, user } = useStore();
  const currentFarmId = useStore((s) => s.currentFarmId);
  const loadFarms = useStore((s) => s.loadFarms);
  const { isVisible: showHelp, showHelp: openHelp, closeHelp } = useHelpModal('HELP_FARM_BASIC');

  // 기본 정보
  const [farmName, setFarmName] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [variety, setVariety] = useState('SHINE_MUSCAT');
  const [cultivationType, setCultivationType] = useState('RAIN_SHELTER');
  const [plantingYear, setPlantingYear] = useState('2020');
  const [region, setRegion] = useState('');

  // 생육 정보 (FacilityInfo에서 이동)
  const [budBreakDate, setBudBreakDate] = useState('');
  const [harvestTargetDate, setHarvestTargetDate] = useState('');
  const [hasDrainage, setHasDrainage] = useState(false);

  // 초기 로드
  useEffect(() => {
    if (farmInfo) {
      setFarmName(farmInfo.name || '');
      setFacilityId(''); // facilityId는 사용자 입력 별도 필드. farm.id(정수 PK)를 표시하지 않음.
      setVariety(farmInfo.variety || 'SHINE_MUSCAT');
      setCultivationType(farmInfo.cultivationType || 'RAIN_SHELTER');
      setPlantingYear(farmInfo.plantingYear || '2020');
      setRegion(farmInfo.address || farmInfo.region || '');
      setBudBreakDate((farmInfo as any).budBreakDate || '');
      setHarvestTargetDate((farmInfo as any).harvestTargetDate || '');
      setHasDrainage((farmInfo as any).hasDrainage || false);
    }
  }, [farmInfo]);

  // 첫 진입 필수 설정 모드: 하드웨어 뒤로가기 차단
  useFocusEffect(
    useCallback(() => {
      if (!isInitialSetup) return;
      const onBackPress = () => {
        Alert.alert('알림', '농장 설정을 완료해야 앱을 사용할 수 있습니다.');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [isInitialSetup])
  );

  const requiredFilled = isInitialSetup
    ? !!(farmName.trim() && region.trim() && cultivationType && budBreakDate.trim())
    : !!farmName.trim();

  const handleSave = async () => {
    if (isInitialSetup) {
      const missing: string[] = [];
      if (!farmName.trim()) missing.push('농장명');
      if (!region.trim()) missing.push('농장 주소');
      if (!cultivationType) missing.push('재배 환경');
      if (!budBreakDate.trim()) missing.push('맹아일');
      if (missing.length > 0) {
        Alert.alert('필수 입력', `다음 항목을 입력해주세요.\n\n• ${missing.join('\n• ')}`);
        return;
      }
    } else if (!farmName) {
      Alert.alert('알림', '농장 이름을 입력해주세요.');
      return;
    }

    if (!farmInfo) {
      Alert.alert('오류', '초기 농장 정보가 없습니다.');
      return;
    }

    const info = {
      ...farmInfo,
      id: farmInfo.id, // 정수 PK 보존. facilityId는 사용자 입력 별도 필드, PK 덮어쓰기 금지.
      name: farmName,
      variety,
      cultivationType,
      plantingYear,
      address: region,
      region: region,
      budBreakDate,
      harvestTargetDate,
      hasDrainage,
    };

    try {
      await farmmapApi.syncFarmGeo(farmInfo.id, region);
    } catch (e) {
      console.log('Geo Sync Failed silently');
    }

    await setFarmInfo(info);

    if (isInitialSetup) {
      try {
        await authApi.completeOnboarding();
        // 로컬 user 상태에도 onboarding_completed 반영 → RootNavigator가 MainTab으로 자동 전환
        if (user) {
          await setUser({ ...user, onboarding_completed: true });
        }
        // 새 농장이 등록됐을 가능성 — 서버에서 농장 목록 다시 가져옴
        try {
          await loadFarms();
        } catch (e) {
          console.warn('[FarmBasicInfo] loadFarms 실패 (non-blocking):', e);
        }
        // 안전장치: flowMode 전환 타이밍 race 대비
        try {
          (navigation as any).reset({ index: 0, routes: [{ name: 'MainTab' }] });
        } catch {}
      } catch (e) {
        console.warn('[FarmBasicInfo] completeOnboarding 실패:', e);
        Alert.alert('오류', '초기 설정 완료 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
    } else {
      Alert.alert('저장 완료', '농장 정보가 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
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
      title={isInitialSetup ? '농장 정보를 입력해주세요' : '농장 기본정보'}
      showMenu={false}
      showBack={!isInitialSetup}
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
        {isInitialSetup && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>💡</Text>
            <Text style={styles.infoBannerText}>
              자세히 입력하실수록 AI 보고서 품질이 높아집니다.{'\n'}
              농장명·주소·재배환경·맹아일은 필수 항목입니다.
            </Text>
          </View>
        )}
        {/* 기본 정보 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>기본 정보</Text>
          </View>

          {renderInput('농장 이름', farmName, setFarmName, '예: 행복한 포도농장')}
          {renderInput('시설 ID (농장 ID)', facilityId, setFacilityId, '예: FARM001')}

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
                  if (!currentFarmId) {
                    Alert.alert('알림', '농장을 먼저 등록해주세요.');
                    return;
                  }
                  try {
                    const result = await farmmapApi.syncFarmGeo(currentFarmId, region);
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

        {/* 재배 환경 */}
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

        {/* 생육 일정 & 시설 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>생육 일정 및 시설</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>맹아일 (작기 시작일)</Text>
            <Text style={styles.hint}>포도나무 눈이 트기 시작하는 날짜</Text>
            <TextInput
              style={styles.input}
              value={budBreakDate}
              onChangeText={setBudBreakDate}
              placeholder="예: 2025-03-15"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>수확 목표일</Text>
            <Text style={styles.hint}>농약 PHI 확인 및 품질 관리 목표 시점</Text>
            <TextInput
              style={styles.input}
              value={harvestTargetDate}
              onChangeText={setHarvestTargetDate}
              placeholder="예: 2025-09-15"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>배수 시설 여부</Text>
              <Text style={styles.hint}>농장 내 배수 시설 설치 여부</Text>
            </View>
            <Switch
              value={hasDrainage}
              onValueChange={setHasDrainage}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 토양정보 바로가기 (초기 설정 중에는 숨김) */}
        {!isInitialSetup && (
          <>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3B82F6', marginBottom: 12 }]}
              onPress={() => navigation.navigate('SoilEnvironment' as never)}
            >
              <Text style={[styles.saveButtonText, { color: '#3B82F6' }]}>토양 정보 조회하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#10B981', marginBottom: 12 }]}
              onPress={() => navigation.navigate('FarmDetail' as never)}
            >
              <Text style={[styles.saveButtonText, { color: '#10B981' }]}>농장 상세 정보 입력하기</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.saveButton, !requiredFilled && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!requiredFilled}
        >
          <Text style={styles.saveButtonText}>
            {isInitialSetup ? '저장하고 시작하기' : '저장하기'}
          </Text>
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
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 19,
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
