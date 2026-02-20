import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal, FlatList } from 'react-native';
import { irrigationApi } from '../../services/irrigationApi';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../design-system/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useFarmInfo } from '../../store/useStore';

type ThermalMeasurementNavigationProp = NavigationProp<any>;

const ThermalMeasurementScreen = () => {
    const navigation = useNavigation<ThermalMeasurementNavigationProp>();
    const { colors: tc } = useTheme();
    const farmInfo = useFarmInfo();
    const [canopyTemp, setCanopyTemp] = useState('');
    const [growthStage, setGrowthStage] = useState('veraison');
    const [loading, setLoading] = useState(false);
    const [sensorData, setSensorData] = useState({ temperature: 25, humidity: 60 });
    const [modalVisible, setModalVisible] = useState(false);
    const [guideData, setGuideData] = useState<any>(null);

    useEffect(() => {
        irrigationApi.getMeasurementGuide()
            .then(setGuideData)
            .catch(() => { /* 가이드 로드 실패 시 하드코딩 폴백 사용 */ });
    }, []);

    const growthStages = [
        { value: 'dormant', label: '휴면기' },
        { value: 'bud_burst', label: '발아기' },
        { value: 'flowering', label: '개화기' },
        { value: 'fruit_set', label: '착과기' },
        { value: 'pea_size', label: '완두콩 크기' },
        { value: 'veraison', label: '변색기' },
        { value: 'ripening', label: '성숙기' },
        { value: 'harvest', label: '수확기' },
    ];

    const getGrowthStageLabel = (value: string) => {
        return growthStages.find(stage => stage.value === value)?.label || value;
    };

    const calculateCWSI = async () => {
        if (!canopyTemp || parseFloat(canopyTemp) < 0 || parseFloat(canopyTemp) > 50) {
            Alert.alert('오류', '올바른 수관 온도를 입력해주세요 (0-50°C)');
            return;
        }

        setLoading(true);
        try {
            const cwsiResponse = await irrigationApi.calculateCwsi({
                canopy_temperature: parseFloat(canopyTemp),
                air_temperature: sensorData.temperature,
                humidity: sensorData.humidity,
                growth_stage: growthStage
            });

            const vpdResponse = await irrigationApi.calculateVpd({
                air_temp: sensorData.temperature,
                humidity: sensorData.humidity
            });

            // 측정 기록을 백엔드에 저장
            const farmId = Number(farmInfo?.id);
            if (farmId && !isNaN(farmId)) {
                irrigationApi.uploadThermalLog(farmId, [{
                    timestamp: new Date().toISOString(),
                    canopy_temp: parseFloat(canopyTemp),
                    air_temp: sensorData.temperature,
                    humidity: sensorData.humidity,
                    cwsi: cwsiResponse.cwsi,
                    stress_level: cwsiResponse.stress_level || 'none',
                    recommendation: cwsiResponse.recommendation || '',
                    growth_stage: growthStage,
                    uploaded: false,
                }]).catch(() => { /* 저장 실패해도 화면 이동은 진행 */ });
            }

            (navigation as any).navigate('IrrigationDashboard', {
                cwsiResult: cwsiResponse,
                vpdResult: vpdResponse
            });
        } catch (error) {
            Alert.alert('오류', 'CWSI 계산에 실패했습니다.');
            console.error('CWSI calculation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 12 && hour <= 14) {
            return { suitable: true, message: '최적 측정 시간입니다!' };
        } else if (hour >= 11 && hour <= 15) {
            return { suitable: true, message: '측정 가능한 시간입니다' };
        } else {
            return { suitable: false, message: '정오 시간대(12-14시) 권장' };
        }
    };

    const timeStatus = getCurrentTime();

    return (
        <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
            {/* 측정 가이드 카드 */}
            <View style={[styles.guideCard, { backgroundColor: tc.info + '15', borderLeftColor: tc.info }]}>
                <Text style={[styles.guideTitle, { color: tc.info }]}>측정 가이드</Text>

                <View style={[styles.timeStatus, { backgroundColor: tc.surface }]}>
                    <Text style={[
                        styles.timeText,
                        { color: timeStatus.suitable ? tc.success : tc.error }
                    ]}>
                        {timeStatus.message}
                    </Text>
                </View>

                <View style={styles.guideList}>
                    {guideData?.steps?.length > 0
                        ? guideData.steps.map((step: string, i: number) => (
                            <Text key={i} style={[styles.guideText, { color: tc.text.primary }]}>• {step}</Text>
                          ))
                        : <>
                            <Text style={[styles.guideText, { color: tc.text.primary }]}>• 정오 시간대 (12:00-14:00) 최적</Text>
                            <Text style={[styles.guideText, { color: tc.text.primary }]}>• 그늘진 건강한 잎 온도 측정</Text>
                            <Text style={[styles.guideText, { color: tc.text.primary }]}>• 열화상카메라 또는 적외선 온도계 사용</Text>
                            <Text style={[styles.guideText, { color: tc.text.primary }]}>• 직사광선이 닿지 않는 잎 선택</Text>
                            <Text style={[styles.guideText, { color: tc.text.primary }]}>• 5-10개 잎 평균값 권장</Text>
                          </>
                    }
                </View>
            </View>

            {/* 현재 환경 상태 */}
            <View style={[styles.environmentCard, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>현재 환경</Text>
                <View style={styles.environmentData}>
                    <Text style={[styles.environmentText, { color: tc.text.secondary }]}>대기 온도: {sensorData.temperature}°C</Text>
                    <Text style={[styles.environmentText, { color: tc.text.secondary }]}>습도: {sensorData.humidity}%</Text>
                </View>
            </View>

            {/* 입력 폼 */}
            <View style={[styles.inputCard, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>측정값 입력</Text>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: tc.text.secondary }]}>수관(잎) 온도 (°C) *</Text>
                    <TextInput
                        style={[styles.temperatureInput, { borderColor: tc.border, backgroundColor: tc.surface, color: tc.text.primary }]}
                        value={canopyTemp}
                        onChangeText={setCanopyTemp}
                        placeholder="예: 28.5"
                        placeholderTextColor={tc.text.disabled}
                        keyboardType="decimal-pad"
                        maxLength={5}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: tc.text.secondary }]}>생육 단계 *</Text>
                    <TouchableOpacity
                        style={[styles.pickerSelector, { borderColor: tc.border, backgroundColor: tc.surface }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={[styles.pickerText, { color: tc.text.primary }]}>{getGrowthStageLabel(growthStage)}</Text>
                        <Ionicons name="chevron-down" size={20} color={tc.text.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 계산 버튼 */}
            <TouchableOpacity
                style={[
                    styles.calculateButton,
                    { backgroundColor: tc.info },
                    (!canopyTemp || loading) && styles.calculateButtonDisabled
                ]}
                onPress={calculateCWSI}
                disabled={!canopyTemp || loading}
            >
                <Text style={[styles.calculateButtonText, { color: tc.text.white }]}>
                    {loading ? '계산 중...' : 'CWSI 계산하기'}
                </Text>
            </TouchableOpacity>

            {/* 도움말 */}
            <View style={[styles.helpCard, { backgroundColor: tc.background }]}>
                <Text style={[styles.helpTitle, { color: tc.text.secondary }]}>측정 팁</Text>
                <Text style={[styles.helpText, { color: tc.text.disabled }]}>
                    열화상 카메라가 없다면 적외선 온도계(IR 온도계)를 사용하세요.
                    온라인에서 2-3만원에 구입할 수 있으며, 잎에서 10-15cm 떨어진 거리에서 측정하시면 됩니다.
                </Text>
            </View>

            {/* Growth Stage Picker Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: tc.surface }]}>
                        <Text style={[styles.modalTitle, { color: tc.text.primary }]}>생육 단계 선택</Text>
                        <FlatList
                            data={growthStages}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, { borderBottomColor: tc.border }]}
                                    onPress={() => {
                                        setGrowthStage(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        { color: tc.text.secondary },
                                        growthStage === item.value && { color: tc.info, fontWeight: 'bold' }
                                    ]}>{item.label}</Text>
                                    {growthStage === item.value && <Ionicons name="checkmark" size={20} color={tc.info} />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: tc.background }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.modalCloseText, { color: tc.text.secondary }]}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    guideCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    guideTitle: {
        fontSize: tokens.fontSize.md,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    timeStatus: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    timeText: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '600',
    },
    guideList: {
        paddingLeft: 8,
    },
    guideText: {
        fontSize: tokens.fontSize.xs,
        marginBottom: 6,
        lineHeight: 20,
    },
    environmentCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: tokens.fontSize.md,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    environmentData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    environmentText: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '500',
    },
    inputCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '600',
        marginBottom: 8,
    },
    temperatureInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: tokens.fontSize.md,
    },
    pickerSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    pickerText: {
        fontSize: tokens.fontSize.sm,
    },
    calculateButton: {
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    calculateButtonDisabled: {
        opacity: 0.5,
    },
    calculateButtonText: {
        fontSize: tokens.fontSize.md,
        fontWeight: 'bold',
    },
    helpCard: {
        borderRadius: 12,
        padding: 16,
    },
    helpTitle: {
        fontSize: tokens.fontSize.sm,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    helpText: {
        fontSize: tokens.fontSize.xs,
        lineHeight: 20,
    },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', borderRadius: 16, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: tokens.fontSize.md, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
    modalItemText: { fontSize: tokens.fontSize.sm },
    modalCloseButton: { marginTop: 16, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalCloseText: { fontWeight: '600' },
});

export default ThermalMeasurementScreen;
