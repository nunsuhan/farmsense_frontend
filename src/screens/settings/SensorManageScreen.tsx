// src/screens/settings/SensorManageScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { getSettings, updateSettings } from '../../services/sensorApi';
import { SensorSettingsResponse } from '../../types/api.types';

const SensorManageScreen: React.FC = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [displaySensors, setDisplaySensors] = useState<string[]>([]);
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [graphPeriod, setGraphPeriod] = useState<'day' | 'week' | 'month'>('day');

    // Thresholds
    const [tempMin, setTempMin] = useState('15');
    const [tempMax, setTempMax] = useState('35');
    const [humidMin, setHumidMin] = useState('40');
    const [humidMax, setHumidMax] = useState('85');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await getSettings();
            const { settings } = res;
            setDisplaySensors(settings.display_sensors);
            setAlertEnabled(settings.alert_enabled);
            setGraphPeriod(settings.graph_default_period);

            setTempMin(settings.alert_thresholds.temperature.min.toString());
            setTempMax(settings.alert_thresholds.temperature.max.toString());
            setHumidMin(settings.alert_thresholds.humidity.min.toString());
            setHumidMax(settings.alert_thresholds.humidity.max.toString());
        } catch (error) {
            Alert.alert('오류', '설정을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const settings = {
                display_sensors: displaySensors,
                alert_enabled: alertEnabled,
                alert_thresholds: {
                    temperature: { min: parseFloat(tempMin), max: parseFloat(tempMax) },
                    humidity: { min: parseFloat(humidMin), max: parseFloat(humidMax) },
                    soil_moisture: { min: 30, max: 70 } // Default for now
                },
                graph_default_period: graphPeriod,
                refresh_interval: 300
            };
            await updateSettings(settings); // Assume API takes this structure
            Alert.alert('성공', '설정이 저장되었습니다.');
        } catch (error) {
            Alert.alert('오류', '설정 저장 실패.');
        } finally {
            setSaving(false);
        }
    };

    const toggleSensor = (sensor: string) => {
        if (displaySensors.includes(sensor)) {
            setDisplaySensors(displaySensors.filter(s => s !== sensor));
        } else {
            setDisplaySensors([...displaySensors, sensor]);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper title="센서 관리" showBack>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper title="센서 관리" showBack>
            <ScrollView contentContainerStyle={styles.container}>

                {/* 0. Sensor Registration Link */}
                <TouchableOpacity
                    style={styles.linkCard}
                    onPress={() => navigation.navigate('SensorRegistration' as never)}
                >
                    <View style={styles.linkContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.linkTitle}>센서 등록/삭제 관리</Text>
                            <Text style={styles.linkSubtitle}>새로운 센서를 추가하거나 기존 센서를 제거합니다.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>

                {/* 1. Display Sensors */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>표시할 센서 선택</Text>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleSensor('temperature')}>
                        <Ionicons name={displaySensors.includes('temperature') ? "checkbox" : "square-outline"} size={24} color="#10B981" />
                        <Text style={styles.checkboxLabel}>온도</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleSensor('humidity')}>
                        <Ionicons name={displaySensors.includes('humidity') ? "checkbox" : "square-outline"} size={24} color="#10B981" />
                        <Text style={styles.checkboxLabel}>습도</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleSensor('soil_moisture')}>
                        <Ionicons name={displaySensors.includes('soil_moisture') ? "checkbox" : "square-outline"} size={24} color="#10B981" />
                        <Text style={styles.checkboxLabel}>토양수분</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleSensor('soil_temperature')}>
                        <Ionicons name={displaySensors.includes('soil_temperature') ? "checkbox" : "square-outline"} size={24} color="#10B981" />
                        <Text style={styles.checkboxLabel}>토양온도</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Alert Settings */}
                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>알림 설정</Text>
                        <View style={styles.row}>
                            <Text style={styles.switchLabel}>{alertEnabled ? 'ON' : 'OFF'}</Text>
                            <Switch
                                value={alertEnabled}
                                onValueChange={setAlertEnabled}
                                trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                                thumbColor={"white"}
                            />
                        </View>
                    </View>

                    {alertEnabled && (
                        <View style={styles.thresholdContainer}>
                            <Text style={styles.thresholdTitle}>온도 범위 (°C)</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.input}
                                    value={tempMin}
                                    onChangeText={setTempMin}
                                    keyboardType="numeric"
                                    placeholder="Min"
                                />
                                <Text style={styles.tilde}>~</Text>
                                <TextInput
                                    style={styles.input}
                                    value={tempMax}
                                    onChangeText={setTempMax}
                                    keyboardType="numeric"
                                    placeholder="Max"
                                />
                            </View>

                            <Text style={[styles.thresholdTitle, { marginTop: 16 }]}>습도 범위 (%)</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.input}
                                    value={humidMin}
                                    onChangeText={setHumidMin}
                                    keyboardType="numeric"
                                    placeholder="Min"
                                />
                                <Text style={styles.tilde}>~</Text>
                                <TextInput
                                    style={styles.input}
                                    value={humidMax}
                                    onChangeText={setHumidMax}
                                    keyboardType="numeric"
                                    placeholder="Max"
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* 3. Graph Default Period */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>기본 그래프 기간</Text>
                    <View style={styles.radioGroup}>
                        {['day', 'week', 'month'].map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={styles.radioRow}
                                onPress={() => setGraphPeriod(p as any)}
                            >
                                <Ionicons
                                    name={graphPeriod === p ? "radio-button-on" : "radio-button-off"}
                                    size={20}
                                    color="#10B981"
                                />
                                <Text style={styles.radioLabel}>
                                    {p === 'day' ? '일별' : p === 'week' ? '주별' : '월별'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveBtnText}>저장하기</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 15,
        color: '#374151',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchLabel: {
        marginRight: 8,
        fontSize: 14,
        color: '#6B7280',
    },
    thresholdContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    thresholdTitle: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#1F2937',
        textAlign: 'center',
    },
    tilde: {
        marginHorizontal: 12,
        color: '#6B7280',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioLabel: {
        marginLeft: 8,
        fontSize: 15,
        color: '#374151',
    },
    saveBtn: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    linkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    linkTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    linkSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
});

export default SensorManageScreen;
