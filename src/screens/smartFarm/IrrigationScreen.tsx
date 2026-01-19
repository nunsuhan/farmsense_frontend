import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { dssApi } from '../../services/dssApi';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

const IrrigationScreen = () => {
    const farmId = useStore((state) => state.farmInfo?.id);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const fetchRecommendation = async () => {
        if (!farmId) return;
        setLoading(true);
        try {
            // Mocking input data for now as we don't have full sensor context here yet
            // In real app, pass actual sensor values
            const payload = {
                soil_moisture: 45, // Example
                temperature: 28,
                humidity: 65,
                growth_stage: '과실비대기',
                area_pyeong: 1000
            };

            const res = await dssApi.getIrrigation(farmId, payload);
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
        <ScreenWrapper title="물 관리 (관수)" showBack={true}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerCard}>
                    <Text style={styles.headerTitle}>💧 오늘의 관수 추천</Text>
                    <Text style={styles.headerDesc}>현재 토양 수분과 기상 상태를 분석합니다.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
                ) : data ? (
                    <View style={styles.resultContainer}>
                        <View style={styles.mainValueBox}>
                            <Text style={styles.mainLabel}>총 권장 관수량</Text>
                            <Text style={styles.mainValue}>{data.recommended_amount_liter} L</Text>
                            <Text style={styles.subValue}>(나무당 약 {data.recommended_amount_per_tree} L)</Text>
                        </View>

                        <View style={[styles.statusBox, data.irrigation_needed ? styles.needed : styles.good]}>
                            <Ionicons name={data.irrigation_needed ? "alert-circle" : "checkmark-circle"} size={24} color="white" />
                            <Text style={styles.statusText}>
                                {data.message || (data.irrigation_needed ? "관수가 필요합니다." : "현재 수분 상태가 양호합니다.")}
                            </Text>
                        </View>

                        {data.next_irrigation && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>다음 관수 예정:</Text>
                                <Text style={styles.infoValue}>{new Date(data.next_irrigation).toLocaleString()}</Text>
                            </View>
                        )}
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
    resultContainer: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 2 },
    mainValueBox: { alignItems: 'center', marginBottom: 20 },
    mainLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
    mainValue: { fontSize: 32, fontWeight: 'bold', color: '#2563EB' },
    subValue: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
    statusBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 16, justifyContent: 'center' },
    needed: { backgroundColor: '#F59E0B' },
    good: { backgroundColor: '#10B981' },
    statusText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderColor: '#F3F4F6' },
    infoLabel: { fontSize: 14, color: '#4B5563' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});

export default IrrigationScreen;
