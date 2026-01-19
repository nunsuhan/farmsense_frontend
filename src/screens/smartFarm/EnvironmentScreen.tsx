import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { dssApi } from '../../services/dssApi';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

const EnvironmentScreen = () => {
    const farmId = useStore((state) => state.farmInfo?.id) || 'farm-123';
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await dssApi.getEnvironment(farmId);
            setData(res);
        } catch (e) {
            console.error(e);
            Alert.alert('오류', '환경 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [farmId]);

    const getStatusColor = (level: string) => {
        switch (level) {
            case 'warning': return '#F59E0B';
            case 'danger': return '#EF4444';
            case 'success': return '#10B981';
            default: return '#6B7280';
        }
    };

    return (
        <ScreenWrapper title="환경 관리" showBack={true}>
            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
                ) : data ? (
                    <>
                        {/* 1. Sensor Summary */}
                        <Text style={styles.sectionTitle}>📊 현재 환경</Text>
                        <View style={styles.sensorRow}>
                            <View style={styles.sensorCard}>
                                <Ionicons name="thermometer-outline" size={24} color="#EF4444" />
                                <Text style={styles.sensorValue}>{data.sensor_summary?.temperature || '--'}°C</Text>
                                <Text style={styles.sensorLabel}>기온</Text>
                            </View>
                            <View style={styles.sensorCard}>
                                <Ionicons name="water-outline" size={24} color="#3B82F6" />
                                <Text style={styles.sensorValue}>{data.sensor_summary?.humidity || '--'}%</Text>
                                <Text style={styles.sensorLabel}>습도</Text>
                            </View>
                            <View style={styles.sensorCard}>
                                <Ionicons name="leaf-outline" size={24} color="#10B981" />
                                <Text style={styles.sensorValue}>{data.sensor_summary?.soil_moisture || '--'}%</Text>
                                <Text style={styles.sensorLabel}>토양</Text>
                            </View>
                        </View>

                        {/* 2. Disease Risk */}
                        {data.disease_risk && (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>🦠 병해 위험도</Text>
                                {Object.entries(data.disease_risk).map(([key, val]: [string, any]) => (
                                    <View key={key} style={styles.riskRow}>
                                        <Text style={styles.riskLabel}>
                                            {key === 'downy_mildew' ? '노균병' : key === 'anthracnose' ? '탄저병' : key === 'powdery_mildew' ? '흰가루병' : key}
                                        </Text>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${(val.score || 0) * 100}%`, backgroundColor: val.level === 'high' ? '#EF4444' : val.level === 'medium' ? '#F59E0B' : '#10B981' }]} />
                                        </View>
                                        <Text style={styles.riskValue}>{Math.round((val.score || 0) * 100)}%</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* 3. Alerts */}
                        {data.alerts && data.alerts.length > 0 && (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>⚠️ 알림</Text>
                                {data.alerts.map((alert: any, idx: number) => (
                                    <View key={idx} style={styles.alertItem}>
                                        <Ionicons name="alert-circle" size={20} color={getStatusColor(alert.level)} />
                                        <Text style={styles.alertText}>{alert.message}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* 4. Tasks */}
                        {data.today_tasks && data.today_tasks.length > 0 && (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>📋 오늘의 할 일</Text>
                                {data.today_tasks.map((task: any, idx: number) => (
                                    <View key={idx} style={styles.taskItem}>
                                        <Ionicons name={task.status === 'completed' ? "checkbox" : "square-outline"} size={20} color="#6B7280" />
                                        <Text style={styles.taskText}>
                                            {task.task} ({task.status === 'completed' ? '완료' : '대기'})
                                        </Text>
                                        {task.recommended_time && <Text style={styles.taskTime}>{task.recommended_time}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                    </>
                ) : (
                    <Text style={styles.emptyText}>데이터가 없습니다.</Text>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
    sensorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    sensorCard: { width: '30%', backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 1 },
    sensorValue: { fontSize: 18, fontWeight: 'bold', marginTop: 8, color: '#111827' },
    sensorLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#374151' },
    riskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    riskLabel: { width: 70, fontSize: 13, color: '#374151' },
    progressBarBg: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginHorizontal: 8 },
    progressBarFill: { height: '100%', borderRadius: 4 },
    riskValue: { width: 40, fontSize: 13, fontWeight: 'bold', textAlign: 'right', color: '#6B7280' },
    alertItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    alertText: { marginLeft: 8, fontSize: 14, color: '#374151', flex: 1 },
    taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F3F4F6' },
    taskText: { marginLeft: 8, fontSize: 14, color: '#374151', flex: 1 },
    taskTime: { fontSize: 12, color: '#9CA3AF' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});

export default EnvironmentScreen;
