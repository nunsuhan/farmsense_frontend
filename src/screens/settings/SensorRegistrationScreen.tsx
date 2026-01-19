import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import HelpModal from '../../components/common/HelpModal';
import { useHelpModal } from '../../hooks/useHelpModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Sensor {
  id: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  sensorId: string;
  refreshInterval: number; // 분 단위
  category: string; // 'essential' | 'soil' | 'disease' | 'other'
}

const SensorRegistrationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: '1',
      type: '온도 센서',
      status: 'active',
      sensorId: 'TEMP_001',
      refreshInterval: 10,
      category: 'essential',
    },
    {
      id: '2',
      type: '토양 수분 센서',
      status: 'active',
      sensorId: 'SOIL_001',
      refreshInterval: 30,
      category: 'soil',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSensor, setNewSensor] = useState({
    type: '',
    sensorId: '',
    refreshInterval: '10',
    category: 'other',
  });

  // New state to manage manual vs list selection
  const [selectionStep, setSelectionStep] = useState<'list' | 'input'>('list');

  const { isVisible: showHelp, showHelp: openHelp, closeHelp } = useHelpModal('HELP_SENSOR');

  const predefinedSensors = [
    {
      category: 'essential',
      title: '필수 환경 센서 (기본 생장 관리)',
      items: [
        { name: '온도 센서', desc: '하우스 내부 온도 (고온/저온 피해 방지)' },
        { name: '습도 센서', desc: '공기 중 수분 함량 (병해 발생 예측)' },
        { name: 'CO2 센서', desc: '탄산가스 농도 (광합성 효율 관리)' },
        { name: '일사량 센서', desc: '빛의 세기 (차광 및 관수 조절)' },
      ]
    },
    {
      category: 'soil',
      title: '토양 및 양액 센서 (뿌리 근권 관리)',
      items: [
        { name: '토양 수분 센서', desc: '토양 젖음 정도 (관수 자동화 기준)' },
        { name: '토양 EC(전기전도도)', desc: '토양 내 양분 농도 측정' },
        { name: '토양 pH 센서', desc: '산도 측정 (양분 흡수 효율)' },
        { name: '토양 온도 센서', desc: '지온 측정 (뿌리 활력 체크)' },
      ]
    },
    {
      category: 'disease',
      title: '병해 예방 특화 센서 (중요)',
      items: [
        { name: '엽면 수분 센서 (Leaf Wetness)', desc: '잎 표면 결로 시간 (병해 예측)' },
        { name: '외부 기상대 (AWS)', desc: '풍향, 풍속, 강우 등 외부 환경' },
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#6B7280';
      case 'error':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '정상';
      case 'inactive':
        return '비활성';
      case 'error':
        return '오류';
      default:
        return '알 수 없음';
    }
  };

  const handleSelectSensorType = (name: string, category: string) => {
    setNewSensor({ ...newSensor, type: name, category });
    setSelectionStep('input');
  };

  const handleAddSensor = () => {
    if (!newSensor.type || !newSensor.sensorId) {
      Alert.alert('입력 오류', '센서 종류와 센서 ID를 입력해주세요.');
      return;
    }

    const sensor: Sensor = {
      id: Date.now().toString(),
      type: newSensor.type,
      status: 'inactive',
      sensorId: newSensor.sensorId,
      refreshInterval: parseInt(newSensor.refreshInterval) || 10,
      category: newSensor.category,
    };

    setSensors([...sensors, sensor]);
    resetModal();
    Alert.alert('등록 완료', '센서가 등록되었습니다.');
  };

  const resetModal = () => {
    setNewSensor({ type: '', sensorId: '', refreshInterval: '10', category: 'other' });
    setSelectionStep('list');
    setIsModalVisible(false);
  };

  const handleDeleteSensor = (id: string) => {
    Alert.alert(
      '센서 삭제',
      '정말 이 센서를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setSensors(sensors.filter((s) => s.id !== id));
          },
        },
      ]
    );
  };

  const handleToggleSensor = (id: string) => {
    setSensors(
      sensors.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  };

  return (
    <ScreenWrapper
      title="센서 등록"
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
        title="센서 등록 가이드"
        subtitle="농장에 필요한 센서를 선택하여 등록하세요."
        points={[
          {
            title: '필수 환경 센서',
            description: '온도, 습도, CO2 등 하우스 내부의 기본 환경을 모니터링합니다.'
          },
          {
            title: '토양/양액 센서',
            description: '뿌리 근권 환경(수분, EC, pH)을 측정하여 관수/시비를 최적화합니다.'
          },
          {
            title: '병해 예방 센서',
            description: '엽면 수분, AWS 등을 통해 병해 발생 위험을 예측하고 방제 시기를 판단합니다.'
          }
        ]}
      />
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.floatingAddButton}>
          <Ionicons name="add-circle" size={28} color="#FFFFFF" />
          <Text style={styles.floatingAddText}>센서 추가</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 메시지 */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            센서를 등록하면 데이터가 대시보드에 자동 연동됩니다.
          </Text>
        </View>

        {/* 센서 목록 */}
        {sensors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wifi-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>등록된 센서가 없습니다</Text>
            <Text style={styles.emptySubtext}>우측 상단의 + 버튼을 눌러 센서를 추가하세요</Text>
          </View>
        ) : (
          sensors.map((sensor) => (
            <View key={sensor.id} style={styles.sensorCard}>
              <View style={styles.sensorHeader}>
                <View style={styles.sensorTypeContainer}>
                  <View style={[styles.categoryIcon,
                  sensor.category === 'essential' ? { backgroundColor: '#DBEAFE' } :
                    sensor.category === 'soil' ? { backgroundColor: '#FEF3C7' } :
                      sensor.category === 'disease' ? { backgroundColor: '#FEE2E2' } : { backgroundColor: '#F3F4F6' }
                  ]}>
                    <Ionicons
                      name={
                        sensor.category === 'essential' ? 'thermometer' :
                          sensor.category === 'soil' ? 'leaf' :
                            sensor.category === 'disease' ? 'rainy' : 'hardware-chip'
                      }
                      size={16}
                      color={
                        sensor.category === 'essential' ? '#2563EB' :
                          sensor.category === 'soil' ? '#D97706' :
                            sensor.category === 'disease' ? '#DC2626' : '#4B5563'
                      }
                    />
                  </View>
                  <Text style={styles.sensorType}>{sensor.type}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(sensor.status)}15` }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(sensor.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(sensor.status) }]}>
                    {getStatusText(sensor.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.sensorInfo}>
                <View style={styles.sensorInfoRow}>
                  <Text style={styles.sensorInfoLabel}>센서 ID</Text>
                  <Text style={styles.sensorInfoValue}>{sensor.sensorId}</Text>
                </View>
                <View style={styles.sensorInfoRow}>
                  <Text style={styles.sensorInfoLabel}>갱신 주기</Text>
                  <Text style={styles.sensorInfoValue}>{sensor.refreshInterval}분</Text>
                </View>
              </View>

              <View style={styles.sensorActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    sensor.status === 'active' ? styles.actionButtonDeactivate : styles.actionButtonActivate,
                  ]}
                  onPress={() => handleToggleSensor(sensor.id)}
                >
                  <Ionicons
                    name={sensor.status === 'active' ? 'pause' : 'play'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionButtonText}>
                    {sensor.status === 'active' ? '비활성화' : '활성화'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDelete]}
                  onPress={() => handleDeleteSensor(sensor.id)}
                >
                  <Ionicons name="trash" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 센서 추가 모달 */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, selectionStep === 'list' ? { height: '80%' } : {}]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectionStep === 'input' && (
                  <TouchableOpacity onPress={() => setSelectionStep('list')} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                )}
                <Text style={styles.modalTitle}>
                  {selectionStep === 'list' ? '센서 종류 선택' : `${newSensor.type} 등록`}
                </Text>
              </View>
              <TouchableOpacity onPress={resetModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectionStep === 'list' ? (
              <ScrollView contentContainerStyle={styles.listContent}>
                {predefinedSensors.map((cat, idx) => (
                  <View key={idx} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                    {cat.items.map((item, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.sensorOption}
                        onPress={() => handleSelectSensorType(item.name, cat.category)}
                      >
                        <View>
                          <Text style={styles.optionTitle}>{item.name}</Text>
                          <Text style={styles.optionDesc}>{item.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.sensorOption, { marginTop: 10, borderBottomWidth: 0 }]}
                  onPress={() => handleSelectSensorType('기타 센서', 'other')}
                >
                  <Text style={styles.optionTitle}>직접 입력 / 기타</Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>센서 종류</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: '#F3F4F6' }]}
                    value={newSensor.type}
                    onChangeText={(text) => setNewSensor({ ...newSensor, type: text })}
                    editable={true}
                  // Allow editing even if pre-selected, just in case
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>센서 ID (S/N) *</Text>
                  <TextInput
                    style={styles.input}
                    value={newSensor.sensorId}
                    onChangeText={(text) => setNewSensor({ ...newSensor, sensorId: text })}
                    placeholder="예: SENSOR_ABC_001"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>데이터 갱신 주기 (분)</Text>
                  <TextInput
                    style={styles.input}
                    value={newSensor.refreshInterval}
                    onChangeText={(text) => setNewSensor({ ...newSensor, refreshInterval: text })}
                    placeholder="10"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity style={styles.modalButton} onPress={handleAddSensor}>
                  <Text style={styles.modalButtonText}>등록하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  addButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  floatingAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  sensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sensorTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  sensorType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensorInfo: {
    marginBottom: 12,
  },
  sensorInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sensorInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  sensorInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  sensorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
  },
  actionButtonActivate: {
    backgroundColor: '#10B981',
  },
  actionButtonDeactivate: {
    backgroundColor: '#6B7280',
  },
  actionButtonDelete: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  listContent: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 12,
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sensorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SensorRegistrationScreen;
