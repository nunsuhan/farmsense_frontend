import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { dssApi } from '../../services/dssApi';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

const HarvestPredictionScreen = () => {
    const farmId = useStore((state) => state.farmInfo?.id) || 'farm-123';
    const farmInfo = useStore((state) => state.farmInfo);

    const [clusterCount, setClusterCount] = useState('');
    const [avgWeight, setAvgWeight] = useState('700'); // Default 700g
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        if (!clusterCount || parseInt(clusterCount) <= 0) {
            Alert.alert('입력 오류', '착과 송이수를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const result = await dssApi.getYieldPrediction(farmId, {
                variety: farmInfo?.variety || 'shine_muscat',
                cluster_count: parseInt(clusterCount),
                avg_cluster_weight: parseFloat(avgWeight) / 1000, // g -> kg
                area_pyeong: farmInfo?.area || 1000
            });

            if (result && result.data) {
                setPrediction(result.data);
            } else {
                Alert.alert('알림', '예측 결과가 없습니다.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '예측에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper title="수확 예측" showBack={true}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Input Card */}
                <View style={styles.inputCard}>
                    <Text style={styles.cardTitle}>📝 데이터 입력</Text>

                    <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>착과 송이수 (송이)</Text>
                            <TextInput
                                style={styles.input}
                                value={clusterCount}
                                onChangeText={setClusterCount}
                                keyboardType="numeric"
                                placeholder="예: 3000"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>평균 송이 무게 (g)</Text>
                            <TextInput
                                style={styles.input}
                                value={avgWeight}
                                onChangeText={setAvgWeight}
                                keyboardType="numeric"
                                placeholder="예: 700"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.predictBtn} onPress={handlePredict} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.predictBtnText}>🔄 수확량 예측하기</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Prediction Result */}
                {prediction && (
                    <View>
                        {/* Main Result */}
                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>예상 총 수확량</Text>
                            <Text style={styles.resultValue}>{prediction.predicted_yield_kg?.toLocaleString()} kg</Text>
                            <Text style={styles.resultSub}>(약 {prediction.predicted_yield_boxes} 박스 / 5kg 기준)</Text>

                            <View style={styles.divider} />

                            <View style={styles.comparisonRow}>
                                <View style={styles.compItem}>
                                    <Text style={styles.compLabel}>작년 대비</Text>
                                    <Text style={[styles.compValue, { color: prediction.comparison?.change_percent >= 0 ? '#EF4444' : '#3B82F6' }]}>
                                        {prediction.comparison?.change_percent > 0 ? '+' : ''}{prediction.comparison?.change_percent}%
                                    </Text>
                                </View>
                                <View style={styles.compItem}>
                                    <Text style={styles.compLabel}>지역 평균 대비</Text>
                                    <Text style={[styles.compValue, { color: prediction.comparison?.vs_region_percent >= 0 ? '#EF4444' : '#3B82F6' }]}>
                                        {prediction.comparison?.vs_region_percent > 0 ? '+' : ''}{prediction.comparison?.vs_region_percent}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Maturity & Harvest Window */}
                        <View style={styles.infoCard}>
                            <Text style={styles.cardTitle}>📅 예상 수확 시기</Text>

                            <View style={styles.progressContainer}>
                                <Text style={styles.progressLabel}>성숙도 (GDD 기준)</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${prediction.maturity?.progress_percent || 0}%` }]} />
                                </View>
                                <Text style={styles.progressValue}>{prediction.maturity?.progress_percent}% 진행</Text>
                            </View>

                            {prediction.harvest_window && (
                                <View style={styles.dateRow}>
                                    <View style={styles.dateItem}>
                                        <Text style={styles.dateLabel}>수확 시작</Text>
                                        <Text style={styles.dateValue}>{prediction.harvest_window.expected_start}</Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                                    <View style={styles.dateItem}>
                                        <Text style={styles.dateLabel}>최적 시기 ⭐</Text>
                                        <Text style={[styles.dateValue, { color: '#B45309', fontWeight: 'bold' }]}>{prediction.harvest_window.expected_peak}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Grade Distribution */}
                        {prediction.grade_distribution && (
                            <View style={styles.infoCard}>
                                <Text style={styles.cardTitle}>📊 예상 등급 분포</Text>
                                {Object.entries(prediction.grade_distribution).map(([grade, pct]: [string, any]) => (
                                    <View key={grade} style={styles.gradeRow}>
                                        <Text style={styles.gradeLabel}>{grade}</Text>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: grade === '특등' ? '#8B5CF6' : '#A78BFA' }]} />
                                        </View>
                                        <Text style={styles.gradeValue}>{pct}%</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    inputCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#374151' },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    inputGroup: { flex: 1 },
    label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
    predictBtn: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 8, alignItems: 'center' },
    predictBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    resultCard: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 24, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#DDD6FE' },
    resultLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
    resultValue: { fontSize: 36, fontWeight: 'bold', color: '#7C3AED' },
    resultSub: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
    divider: { width: '100%', height: 1, backgroundColor: '#E5E7EB', marginBottom: 20 },
    comparisonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
    compItem: { alignItems: 'center' },
    compLabel: { fontSize: 12, color: '#6B7280' },
    compValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },

    infoCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1 },
    progressContainer: { marginBottom: 20 },
    progressLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
    progressBarBg: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginHorizontal: 8 },
    progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
    progressValue: { textAlign: 'right', fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 'bold' },

    dateRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 },
    dateItem: { alignItems: 'center' },
    dateLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
    dateValue: { fontSize: 15, fontWeight: '600', color: '#111827' },

    gradeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    gradeLabel: { width: 40, fontSize: 13, color: '#374151' },
    gradeValue: { width: 40, fontSize: 13, fontWeight: 'bold', textAlign: 'right', color: '#6B7280' },
});

export default HarvestPredictionScreen;
