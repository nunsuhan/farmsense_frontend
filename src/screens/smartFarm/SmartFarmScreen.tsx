import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../../store/useStore';

const SmartFarmScreen = () => {
    const navigation = useNavigation<any>();
    const { sensorData } = useStore();

    // Model Farm Defaults (Fallback)
    const modelFarmData = {
        temperature: 24.5,
        humidity: 60.0,
        soil_moisture: 25.0
    };

    const isConnected = sensorData && sensorData.temperature !== undefined;

    // Helper to get value or model farm default
    const getValue = (key: 'temperature' | 'humidity' | 'soil_moisture') => {
        if (isConnected && sensorData?.[key]) return sensorData[key].value || sensorData[key];
        // Note: Check data structure. store sensorData usually flat or object. Assuming flat or { value: ... }
        // Based on HomeScreen, it is flat: sensorData.temperature (number or string)
        if (sensorData && (sensorData as any)[key]) return (sensorData as any)[key];
        return modelFarmData[key];
    };

    const GridItem = ({ title, icon, onPress, color }: any) => (
        <TouchableOpacity style={styles.gridItem} onPress={onPress}>
            <View style={[styles.iconCircle, { backgroundColor: color }]}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <Text style={styles.gridTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper title="의사결정 지원 시스템" showBack={true}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Dashboard Placeholder */}
                <View style={styles.dashboard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={styles.dashboardTitle}>오늘의 현황</Text>
                        {!isConnected && <Text style={{ fontSize: 12, color: '#9CA3AF' }}>(모델팜 데이터)</Text>}
                    </View>

                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusValue}>{getValue('temperature')}°C</Text>
                            <Text style={styles.statusLabel}>온도</Text>
                        </View>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusValue}>{getValue('humidity')}%</Text>
                            <Text style={styles.statusLabel}>습도</Text>
                        </View>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusValue}>{getValue('soil_moisture')}%</Text>
                            <Text style={styles.statusLabel}>토양수분</Text>
                        </View>
                    </View>
                </View>

                {/* Management Grid */}
                <Text style={styles.sectionTitle}>관리 메뉴</Text>
                <View style={styles.gridContainer}>
                    <GridItem
                        title="물관리"
                        icon="💧"
                        color="#E0F2FE"
                        onPress={() => navigation.navigate('Irrigation')}
                    />
                    <GridItem
                        title="비료관리"
                        icon="🧪"
                        color="#F3E8FF"
                        onPress={() => navigation.navigate('Fertilizer')}
                    />
                    <GridItem
                        title="방제관리"
                        icon="🛡️"
                        color="#DCFCE7"
                        onPress={() => navigation.navigate('PesticideManagement')}
                    />
                    <GridItem
                        title="환경관리"
                        icon="🌡️"
                        color="#FEF2F2"
                        onPress={() => navigation.navigate('Environment')}
                    />
                    <GridItem
                        title="수확예측"
                        icon="📈"
                        color="#FFF7ED"
                        onPress={() => navigation.navigate('HarvestPrediction')}
                    />
                    <GridItem
                        title="맞춤계획"
                        icon="🎯"
                        color="#FDF4FF"
                        onPress={() => navigation.navigate('ReverseAnalysis')}
                    />
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    dashboard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dashboardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statusItem: {
        alignItems: 'center',
    },
    statusValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10B981',
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // changed from gap to space-between for 2 columns
    },
    gridItem: {
        width: '48%', // Increased to fill 2 columns
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16, // bit more spacing vertically
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconText: {
        fontSize: 24,
    },
    gridTitle: {
        fontSize: 14, // slightly larger
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
});

export default SmartFarmScreen;
