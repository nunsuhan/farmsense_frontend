import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import HelpModal from '../../components/common/HelpModal';
import { useHelpModal } from '../../hooks/useHelpModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  // 푸시 알림 총괄 설정
  const [pushEnabled, setPushEnabled] = useState(true);
  const { isVisible: showHelp, showHelp: openHelp, closeHelp } = useHelpModal('HELP_NOTIFICATION');

  // 세부 알림 설정
  const [sensorAlert, setSensorAlert] = useState(true);
  const [pestAlert, setPestAlert] = useState(true);
  const [communityAlert, setCommunityAlert] = useState(true);
  const [weatherAlert, setWeatherAlert] = useState(true);
  const [farmWorkReminder, setFarmWorkReminder] = useState(true);

  // 센서 임계값
  const [tempMin, setTempMin] = useState('15');
  const [tempMax, setTempMax] = useState('35');
  const [humidityMin, setHumidityMin] = useState('50');
  const [humidityMax, setHumidityMax] = useState('85');
  const [soilMoistureMin, setSoilMoistureMin] = useState('30');

  const handleSave = () => {
    Alert.alert('저장 완료', '알림 설정이 저장되었습니다.');
  };

  const renderToggle = (
    label: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onToggle: () => void,
    iconColor: string = '#10B981'
  ) => (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.toggle, value && styles.toggleActive]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.toggleCircle, value && styles.toggleCircleActive]} />
      </TouchableOpacity>
    </View>
  );

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    unit: string = ''
  ) => (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
        {unit && <Text style={styles.inputUnit}>{unit}</Text>}
      </View>
    </View>
  );

  return (
    <ScreenWrapper
      title="알림설정"
      showMenu={false}
      headerRight={
        <TouchableOpacity onPress={openHelp} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      }
    >
      <HelpModal
        visible={showHelp}
        onClose={closeHelp}
        title="알림 설정"
        subtitle="위급 상황을 놓치지 마세요."
        points={[
          {
            title: '리스크 방어',
            description: '환경 급변 및 병해 위험에 대한 즉각적인 알림을 통해 골든타임을 놓치지 않고 대응할 수 있습니다.'
          }
        ]}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 푸시 알림 총괄 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>푸시 알림</Text>
          </View>
          {renderToggle(
            '모든 알림 활성화/비활성화',
            '모든 푸시 알림을 한 번에 제어',
            'notifications',
            pushEnabled,
            () => setPushEnabled(!pushEnabled),
            '#F59E0B'
          )}
        </View>

        {/* 알림 유형 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 알림 유형</Text>
          </View>

          {renderToggle(
            '센서 이상 알림',
            '온도, 습도, 토양수분 임계값 초과 시',
            'thermometer',
            sensorAlert,
            () => setSensorAlert(!sensorAlert),
            '#EF4444'
          )}

          {renderToggle(
            '병해충 경고',
            'AI 진단 결과 고위험 감지 시',
            'bug',
            pestAlert,
            () => setPestAlert(!pestAlert),
            '#DC2626'
          )}

          {renderToggle(
            '커뮤니티 알림',
            '댓글, 좋아요, 답변 채택 시',
            'chatbubbles',
            communityAlert,
            () => setCommunityAlert(!communityAlert),
            '#10B981'
          )}

          {renderToggle(
            '기상 특보 알림',
            '강수, 태풍, 한파 등 기상 특보',
            'partly-sunny',
            weatherAlert,
            () => setWeatherAlert(!weatherAlert),
            '#3B82F6'
          )}

          {renderToggle(
            '농작업 리마인더',
            '지베렐린 처리, 적과 등 작업 알림',
            'calendar',
            farmWorkReminder,
            () => setFarmWorkReminder(!farmWorkReminder),
            '#8B5CF6'
          )}
        </View>

        {/* 센서 임계값 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>📊 센서 임계값</Text>
          </View>

          <Text style={styles.subsectionTitle}>온도</Text>
          {renderInput('최소 온도', tempMin, setTempMin, '°C')}
          {renderInput('최대 온도', tempMax, setTempMax, '°C')}

          <View style={styles.divider} />

          <Text style={styles.subsectionTitle}>습도</Text>
          {renderInput('최소 습도', humidityMin, setHumidityMin, '%')}
          {renderInput('최대 습도', humidityMax, setHumidityMax, '%')}

          <View style={styles.divider} />

          <Text style={styles.subsectionTitle}>토양 수분</Text>
          {renderInput('최소 토양수분', soilMoistureMin, setSoilMoistureMin, '%')}
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F59E0B',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    fontSize: 15,
    color: '#1F2937',
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    width: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default NotificationSettingsScreen;
