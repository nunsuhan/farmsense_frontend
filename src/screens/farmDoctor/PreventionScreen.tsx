import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { dssApi } from '../../services/dssApi';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';
import NoFarmFallback from '../../components/NoFarmFallback';

const PreventionScreen = () => {
    const farmId = useStore((state) => state.currentFarmId);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const fetchRisk = async () => {
        if (!farmId) return;
        setLoading(true);
        try {
            // Reusing Dashboard API as it contains disease risk info
            const res = await dssApi.getDashboard(farmId);
            setData(res);
        } catch (e) {
            console.error(e);
            Alert.alert('오류', '데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRisk();
    }, [farmId]);

    if (!farmId) {
        return <NoFarmFallback />;
    }

    return (
        <ScreenWrapper title="예방 진단 (위험도)" showBack={true}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>🛡️ 실시간 병해충 예방</Text>
                    <Text style={styles.headerDesc}>환경 데이터를 분석하여 발병 가능성을 예측합니다.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#10B981" />
                ) : data && data.disease_risk ? (
                    <View>
                        {/* Risk Cards */}
                        {Object.entries(data.disease_risk).map(([key, val]: [string, any]) => (
                            <View key={key} style={[styles.riskCard, val.level === 'high' && styles.riskHigh, val.level === 'medium' && styles.riskMed]}>
                                <View style={styles.riskHeader}>
                                    <Text style={styles.riskName}>
                                        {key === 'downy_mildew' ? '노균병' : key === 'anthracnose' ? '탄저병' : key === 'powdery_mildew' ? '흰가루병' : key}
                                    </Text>
                                    <View style={[styles.badge, { backgroundColor: val.level === 'high' ? '#FECACA' : val.level === 'medium' ? '#FDE68A' : '#D1FAE5' }]}>
                                        <Text style={[styles.badgeText, { color: val.level === 'high' ? '#EF4444' : val.level === 'medium' ? '#B45309' : '#059669' }]}>
                                            {val.level === 'high' ? '위험' : val.level === 'medium' ? '주의' : '안전'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${(val.score || 0) * 100}%`, backgroundColor: val.level === 'high' ? '#EF4444' : '#F59E0B' }]} />
                                    </View>
                                    <Text style={styles.scoreText}>{Math.round((val.score || 0) * 100)}%</Text>
                                </View>

                                {val.level !== 'low' && (
                                    <View style={styles.actionBox}>
                                        <Ionicons name="shield-checkmark" size={16} color="#4B5563" />
                                        <Text style={styles.actionText}>
                                            {val.level === 'high' ? '즉시 방제 및 환경 관리 필요' : '환기 및 예찰 강화 권장'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}

                        {/* General Guide */}
                        <View style={styles.guideCard}>
                            <Text style={styles.guideTitle}>💡 오늘의 예방 팁</Text>
                            <Text style={styles.guideText}>
                                • 26~28℃ 온도 유지 시 탄저병 위험이 감소합니다.{'\n'}
                                • 습도가 80% 이상 지속되지 않도록 환기해주세요.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.emptyText}>현재 위험도 데이터가 없습니다.</Text>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    headerDesc: { fontSize: 14, color: '#6B7280', marginTop: 4 },

    riskCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
    riskHigh: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
    riskMed: { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' },

    riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    riskName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },

    progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    progressBarBg: { flex: 1, height: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, marginRight: 10 },
    progressBarFill: { height: '100%', borderRadius: 5 },
    scoreText: { fontSize: 14, fontWeight: 'bold', color: '#4B5563' },

    actionBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.6)', padding: 8, borderRadius: 8, alignItems: 'center' },
    actionText: { fontSize: 13, color: '#4B5563', marginLeft: 6 },

    guideCard: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 12 },
    guideTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
    guideText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});

export default PreventionScreen;
