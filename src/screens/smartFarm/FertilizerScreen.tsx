import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { dssApi } from '../../services/dssApi';
import { useStore } from '../../store/useStore';

const FertilizerScreen = () => {
    const farmId = useStore((state) => state.farmInfo?.id) || 'farm-123';
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const fetchRecommendation = async () => {
        setLoading(true);
        try {
            // Mocking input data
            const payload = {
                variety: '샤인머스켓',
                growth_stage: '과실비대기',
                target_yield_ton: 2.0,
                area_10a: 1.0,
                soil_texture: '양토'
            };

            const res = await dssApi.getFertilizer(farmId, payload);
            if (res && res.data) {
                setData(res.data);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('오류', '데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendation();
    }, [farmId]);

    return (
        <ScreenWrapper title="비료 관리 (시비처방)" showBack={true}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerCard}>
                    <Text style={styles.headerTitle}>🧪 표준 시비량 추천</Text>
                    <Text style={styles.headerDesc}>생육 단계와 목표 수확량에 따른 처방입니다.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
                ) : data ? (
                    <View>
                        {/* Recommendation Card */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>필요 성분량 (kg)</Text>
                            <View style={styles.nutrientsRow}>
                                <View style={styles.nutrientItem}>
                                    <Text style={[styles.nutrientVal, { color: '#3B82F6' }]}>{data.nitrogen_kg}</Text>
                                    <Text style={styles.nutrientLabel}>질소(N)</Text>
                                </View>
                                <View style={styles.nutrientItem}>
                                    <Text style={[styles.nutrientVal, { color: '#F59E0B' }]}>{data.phosphorus_kg}</Text>
                                    <Text style={styles.nutrientLabel}>인산(P)</Text>
                                </View>
                                <View style={styles.nutrientItem}>
                                    <Text style={[styles.nutrientVal, { color: '#10B981' }]}>{data.potassium_kg}</Text>
                                    <Text style={styles.nutrientLabel}>칼리(K)</Text>
                                </View>
                            </View>
                            <Text style={styles.message}>💡 {data.message}</Text>
                        </View>

                        {/* Detail List */}
                        <Text style={styles.sectionTitle}>추천 비료 및 시기</Text>
                        {data.recommended_fertilizer && data.recommended_fertilizer.map((item: any, idx: number) => (
                            <View key={idx} style={styles.recItem}>
                                <View>
                                    <Text style={styles.recName}>{item.name}</Text>
                                    <Text style={styles.recTiming}>{item.timing}</Text>
                                </View>
                                <Text style={styles.recAmount}>{item.amount_kg} kg</Text>
                            </View>
                        ))}

                    </View>
                ) : (
                    <Text style={styles.emptyText}>데이터가 없습니다.</Text>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    headerCard: { marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
    headerDesc: { fontSize: 14, color: '#6B7280' },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 1, marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#374151' },
    nutrientsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    nutrientItem: { alignItems: 'center' },
    nutrientVal: { fontSize: 24, fontWeight: 'bold' },
    nutrientLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    message: { fontSize: 14, color: '#4B5563', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
    recItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
    recName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    recTiming: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    recAmount: { fontSize: 16, fontWeight: 'bold', color: '#8B5CF6' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});

export default FertilizerScreen;
