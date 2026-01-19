// SettingsScreen.tsx - 통합 설정 화면
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useFarmId,
  useUser,
} from '../store/useStore';

// 색상 시스템
const Colors = {
  primary: '#1B5E20',
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
};

// SettingSection 컴포넌트
interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>
      {children}
    </View>
  </View>
);

// SettingItem 컴포넌트
interface SettingItemProps {
  label: string;
  value?: string;
  type?: 'text' | 'switch' | 'button';
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  value,
  type = 'text',
  switchValue = false,
  onPress,
  onSwitchChange,
  danger = false,
  icon,
  isLast = false,
}) => {
  const renderRightElement = () => {
    if (type === 'switch') {
      return (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#D1D5DB', true: Colors.success }}
          thumbColor="#FFFFFF"
        />
      );
    }

    if (type === 'button' || onPress) {
      return (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={Colors.textSecondary}
        />
      );
    }

    return value ? <Text style={styles.itemValue}>{value}</Text> : null;
  };

  return (
    <TouchableOpacity
      style={[styles.settingItem, isLast && styles.settingItemLast]}
      onPress={onPress}
      disabled={!onPress && type !== 'switch'}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.itemLeft}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={danger ? Colors.danger : Colors.primary}
            style={styles.itemIcon}
          />
        )}
        <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>
          {label}
        </Text>
      </View>
      {renderRightElement()}
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const farmId = useFarmId() ?? '미등록';
  const user = useUser();

  // 상태 관리
  const [farmInfo, setFarmInfo] = useState({
    name: '영천포도농장',
    address: '경북 영천시',
    area: '3,000',
  });

  const [cropInfo, setCropInfo] = useState({
    variety: '샤인머스캣',
    rootstock: '5BB',
    rowSpacing: '3.0', // 행간 거리 (이랑거리)
    plantSpacing: '1.8', // 주간 거리
    age: '5년',
  });

  const [facilityInfo, setFacilityInfo] = useState({
    type: '비가림 시설',
    hasIrrigation: true,
    hasSubsoiling: false,
    hasDrainage: true,
    hasUV: true,
    hasMat: false,
  });

  const [sensorSettings, setSensorSettings] = useState({
    connected: true,
    updateInterval: '5분',
    tempMin: 5,
    tempMax: 35,
    humidityMin: 40,
    humidityMax: 80,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    disease: true,
    weather: true,
    sensor: true,
    reminder: false,
  });

  // 자동 업로드 설정 상태
  const [autoUploadSettings, setAutoUploadSettings] = useState({
    enabled: true,
    wifiOnly: true,
    morningNotification: true,
  });

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      // Dynamic import to avoid circular dependency if any (though utils usually fine)
      const { getAutoUploadSettings } = require('../utils/autoUploader');
      const settings = await getAutoUploadSettings();
      setAutoUploadSettings(settings);
    };
    loadSettings();
  }, []);

  const updateAutoUpload = async (key: string, value: boolean) => {
    const { saveAutoUploadSettings, getAutoUploadSettings } = require('../utils/autoUploader');
    const current = await getAutoUploadSettings();
    const updated = { ...current, [key]: value };

    setAutoUploadSettings(updated); // Optimistic update
    await saveAutoUploadSettings(updated);
  };

  // 네비게이션 핸들러
  const goToFarmInfo = () => {
    navigation.navigate('FacilityInfo');
  };

  const goToSensorSettings = () => {
    Alert.alert(
      '센서 설정',
      `현재 센서 상태:\n\n연결 상태: ${sensorSettings.connected ? '✅ 연결됨' : '❌ 연결 안됨'}\n갱신 주기: ${sensorSettings.updateInterval}\n\n농장 ID: ${farmId}`,
      [{ text: '확인' }]
    );
  };

  const goToNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  const goToFarmMap = () => {
    navigation.navigate('FarmMap');
  };

  // 재식거리 편집 (삭제됨 - 직접 FacilityInfo로 이동)
  // const editPlantingDistance = () => { ... };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            // 로그아웃 로직
            Alert.alert('로그아웃', '로그아웃되었습니다.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ 회원 탈퇴',
      '계정을 삭제하시겠습니까?\n\n삭제된 데이터:\n• 농장 정보\n• 센서 기록\n• 성장일지\n• 모든 설정\n\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('회원 탈퇴', '계정이 삭제되었습니다.');
            // TODO: 실제 계정 삭제 API 호출
          },
        },
      ]
    );
  };

  const showTerms = () => {
    navigation.navigate('Terms');
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      '개인정보 처리방침',
      '포도박사는 사용자의 개인정보를 소중히 다룹니다.\n\n수집 정보:\n• 이메일 주소\n• 농장 정보\n• 센서 데이터\n\n자세한 내용은 약관을 참고해주세요.',
      [{ text: '확인' }]
    );
  };

  const showAppInfo = () => {
    Alert.alert(
      '포도박사 v1.0.0',
      '🍇 포도 재배 농가를 위한\n스마트팜 의사결정 지원 시스템\n\n주요 기능:\n• AI 기반 병해 진단\n• 센서 데이터 모니터링\n• 성장일지 기록\n• 농업 지식 Q&A\n\n개발: FarmSense Team',
      [{ text: '확인' }]
    );
  };

  const showContact = () => {
    Alert.alert(
      '문의하기',
      '고객센터\n\n📧 이메일: support@farmsense.kr\n📞 전화: 1588-0000\n⏰ 운영시간: 평일 09:00-18:00\n\n문의사항을 남겨주시면\n빠르게 답변드리겠습니다.',
      [
        { text: '닫기', style: 'cancel' },
        { text: '이메일 보내기', onPress: () => Alert.alert('이메일 앱으로 이동') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 0. 자동 업로드 설정 (NEW) */}
        <SettingSection title="📷 자동 업로드 설정">
          <SettingItem
            label="자동 업로드 사용"
            type="switch"
            switchValue={autoUploadSettings.enabled}
            onSwitchChange={(val) => updateAutoUpload('enabled', val)}
            icon="cloud-upload"
          />
          {autoUploadSettings.enabled && (
            <>
              <SettingItem
                label="Wi-Fi만 사용"
                type="switch"
                switchValue={autoUploadSettings.wifiOnly}
                onSwitchChange={(val) => updateAutoUpload('wifiOnly', val)}
                icon="wifi"
              />
              <SettingItem
                label="업로드 시간"
                value="00:00 ~ 05:00"
                onPress={() => Alert.alert('알림', '기본값: 밤 12시 ~ 새벽 5시')}
                icon="clock-time-three-outline"
              />
              <SettingItem
                label="아침 결과 알림"
                type="switch"
                switchValue={autoUploadSettings.morningNotification}
                onSwitchChange={(val) => updateAutoUpload('morningNotification', val)}
                icon="bell-ring"
                isLast
              />
            </>
          )}
        </SettingSection>

        {/* 1. 농장 정보 */}
        <SettingSection title="🏡 농장 정보">
          <SettingItem
            label="농장명"
            value={farmInfo.name}
            onPress={goToFarmInfo}
            icon="home-outline"
          />
          <SettingItem
            label="주소"
            value={farmInfo.address}
            onPress={goToFarmInfo}
            icon="map-marker-outline"
          />
          <SettingItem
            label="재배 면적"
            value={`${farmInfo.area}㎡`}
            onPress={goToFarmInfo}
            icon="ruler-square"
          />
          <SettingItem
            label="팜맵 연동"
            type="button"
            onPress={goToFarmMap}
            icon="map"
            isLast
          />
        </SettingSection>

        {/* 2. 재배 정보 */}
        <SettingSection title="🍇 재배 정보">
          <SettingItem
            label="품종"
            value={cropInfo.variety}
            onPress={goToFarmInfo}
            icon="fruit-grapes"
          />
          <SettingItem
            label="대목 종류"
            value={cropInfo.rootstock}
            onPress={goToFarmInfo}
            icon="sprout"
          />
          <SettingItem
            label="재식수"
            value={`${cropInfo.rowSpacing}m × ${cropInfo.plantSpacing}m`}
            onPress={goToFarmInfo}
            icon="ruler"
          />
          <SettingItem
            label="수령"
            value={cropInfo.age}
            onPress={goToFarmInfo}
            icon="calendar-clock"
            isLast
          />
        </SettingSection>

        {/* 3. 시설 정보 */}
        <SettingSection title="🏠 시설 정보">
          <SettingItem
            label="시설 유형"
            value={facilityInfo.type}
            onPress={goToFarmInfo}
            icon="greenhouse"
          />
          <SettingItem
            label="유공관 설치"
            type="switch"
            switchValue={facilityInfo.hasIrrigation}
            onSwitchChange={(value) =>
              setFacilityInfo({ ...facilityInfo, hasIrrigation: value })
            }
            icon="water"
          />
          <SettingItem
            label="심토파쇄"
            type="switch"
            switchValue={facilityInfo.hasSubsoiling}
            onSwitchChange={(value) =>
              setFacilityInfo({ ...facilityInfo, hasSubsoiling: value })
            }
            icon="shovel"
          />
          <SettingItem
            label="배수 시설"
            type="switch"
            switchValue={facilityInfo.hasDrainage}
            onSwitchChange={(value) =>
              setFacilityInfo({ ...facilityInfo, hasDrainage: value })
            }
            icon="pipe"
          />
          <SettingItem
            label="UV 차단"
            type="switch"
            switchValue={facilityInfo.hasUV}
            onSwitchChange={(value) =>
              setFacilityInfo({ ...facilityInfo, hasUV: value })
            }
            icon="weather-sunny"
          />
          <SettingItem
            label="바닥 매트"
            type="switch"
            switchValue={facilityInfo.hasMat}
            onSwitchChange={(value) =>
              setFacilityInfo({ ...facilityInfo, hasMat: value })
            }
            icon="texture-box"
            isLast
          />
        </SettingSection>

        {/* 4. 센서 등록 */}
        <SettingSection title="📡 센서 등록">
          <SettingItem
            label="센서 상태"
            value={sensorSettings.connected ? "연결됨 ✅" : "연결 안됨 ❌"}
            onPress={goToSensorSettings}
            icon="access-point"
          />
          <SettingItem
            label="농장 ID"
            value={farmId}
            onPress={goToSensorSettings}
            icon="identifier"
          />
          <SettingItem
            label="센서 종류"
            value="온도, 습도, 토양수분, CO2"
            onPress={goToSensorSettings}
            icon="chip"
          />
          <SettingItem
            label="갱신 주기"
            value={sensorSettings.updateInterval}
            onPress={goToSensorSettings}
            icon="clock-outline"
            isLast
          />
        </SettingSection>

        {/* 5. 알림 설정 */}
        <SettingSection title="🔔 알림 설정">
          <SettingItem
            label="온도 알림"
            value={`${sensorSettings.tempMin}°C ~ ${sensorSettings.tempMax}°C`}
            onPress={goToNotificationSettings}
            icon="thermometer"
          />
          <SettingItem
            label="습도 알림"
            value={`${sensorSettings.humidityMin}% ~ ${sensorSettings.humidityMax}%`}
            onPress={goToNotificationSettings}
            icon="water-percent"
          />
          <SettingItem
            label="병해충 경고"
            type="switch"
            switchValue={notificationSettings.disease}
            onSwitchChange={(value) =>
              setNotificationSettings({ ...notificationSettings, disease: value })
            }
            icon="bug"
          />
          <SettingItem
            label="기상 알림"
            type="switch"
            switchValue={notificationSettings.weather}
            onSwitchChange={(value) =>
              setNotificationSettings({ ...notificationSettings, weather: value })
            }
            icon="weather-cloudy"
          />
          <SettingItem
            label="센서 이상 알림"
            type="switch"
            switchValue={notificationSettings.sensor}
            onSwitchChange={(value) =>
              setNotificationSettings({ ...notificationSettings, sensor: value })
            }
            icon="alert-circle"
          />
          <SettingItem
            label="농작업 리마인더"
            type="switch"
            switchValue={notificationSettings.reminder}
            onSwitchChange={(value) =>
              setNotificationSettings({ ...notificationSettings, reminder: value })
            }
            icon="calendar-check"
          />
          <SettingItem
            label="알림 상세 설정"
            type="button"
            onPress={goToNotificationSettings}
            icon="cog"
            isLast
          />
        </SettingSection>

        {/* 6. 계정 정보 */}
        <SettingSection title="👤 계정 정보">
          <SettingItem
            label="이메일"
            value={user?.email || '로그인 필요'}
            icon="email-outline"
          />
          <SettingItem
            label="대표자명"
            value={user?.name || '홍길동'}
            onPress={goToProfile}
            icon="account-outline"
          />
          <SettingItem
            label="휴대폰 번호"
            value="010-1234-5678"
            onPress={() => Alert.alert('휴대폰 번호', '휴대폰 번호 변경 화면으로 이동합니다.')}
            icon="phone-outline"
          />
          <SettingItem
            label="프로필 수정"
            onPress={goToProfile}
            icon="account-edit"
          />
          <SettingItem
            label="비밀번호 변경"
            onPress={() => Alert.alert('비밀번호 변경', '비밀번호 변경 화면으로 이동합니다.')}
            icon="lock-reset"
            isLast
          />
        </SettingSection>

        {/* 7. 앱 정보 */}
        <SettingSection title="ℹ️ 앱 정보">
          <SettingItem
            label="앱 버전"
            value="1.0.0"
            onPress={showAppInfo}
            icon="information-outline"
          />
          <SettingItem
            label="이용약관"
            onPress={showTerms}
            icon="file-document-outline"
          />
          <SettingItem
            label="개인정보 처리방침"
            onPress={showPrivacyPolicy}
            icon="shield-account-outline"
          />
          <SettingItem
            label="문의하기"
            onPress={showContact}
            icon="headset"
            isLast
          />
        </SettingSection>

        {/* 8. 위험 영역 */}
        <SettingSection title="⚠️ 계정 관리">
          <SettingItem
            label="로그아웃"
            onPress={handleLogout}
            danger
            icon="logout"
          />
          <SettingItem
            label="회원 탈퇴"
            onPress={handleDeleteAccount}
            danger
            icon="account-remove"
            isLast
          />
        </SettingSection>

        {/* 하단 여백 */}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  itemLabelDanger: {
    color: Colors.danger,
  },
  itemValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  appInfoSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default SettingsScreen;

