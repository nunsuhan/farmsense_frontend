// src/screens/settings/NotificationScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const NotificationScreen: React.FC = () => {
    const navigation = useNavigation();

    // State
    const [pushEnabled, setPushEnabled] = useState(true);
    const [diseaseAlert, setDiseaseAlert] = useState(true);
    const [weatherAlert, setWeatherAlert] = useState(true);
    const [diagnosisResult, setDiagnosisResult] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);

    // Time Picker State (Simulation)
    const [alertTime, setAlertTime] = useState('07:00');
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Generate times for picker (06:00 ~ 10:00 for morning report)
    const times = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'];

    return (
        <ScreenWrapper title="알림 설정" showBack showMenu={false}>
            <View style={styles.container}>
                <ScrollView style={styles.content}>

                    {/* Master Switch */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View>
                                <Text style={[styles.rowTitle, { fontSize: 17, fontWeight: '600' }]}>푸시 알림 전체</Text>
                                <Text style={styles.rowSubtitle}>모든 앱 알림을 켜고 끕니다.</Text>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                            />
                        </View>
                    </View>

                    {/* Sub Switches */}
                    <View style={[styles.section, !pushEnabled && { opacity: 0.5 }]}>
                        <Text style={styles.sectionTitle}>알림 상세 설정</Text>

                        <View style={styles.row}>
                            <View>
                                <Text style={styles.rowTitle}>병해 위험 알림</Text>
                                <Text style={styles.rowSubtitle}>PMI 지수에 따른 위험 경고</Text>
                            </View>
                            <Switch
                                value={diseaseAlert}
                                onValueChange={setDiseaseAlert}
                                disabled={!pushEnabled}
                                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                            />
                        </View>

                        <View style={styles.row}>
                            <View>
                                <Text style={styles.rowTitle}>기상 특보</Text>
                                <Text style={styles.rowSubtitle}>폭염, 한파, 강풍 주의보 등</Text>
                            </View>
                            <Switch
                                value={weatherAlert}
                                onValueChange={setWeatherAlert}
                                disabled={!pushEnabled}
                                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                            />
                        </View>

                        <View style={styles.row}>
                            <View>
                                <Text style={styles.rowTitle}>진단 결과 알림</Text>
                                <Text style={styles.rowSubtitle}>AI 병해 진단 완료 즉시 알림</Text>
                            </View>
                            <Switch
                                value={diagnosisResult}
                                onValueChange={setDiagnosisResult}
                                disabled={!pushEnabled}
                                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                            />
                        </View>

                        <View style={styles.row}>
                            <View>
                                <Text style={styles.rowTitle}>일일 요약 (아침)</Text>
                                <Text style={styles.rowSubtitle}>매일 아침 농장 현황 브리핑</Text>
                            </View>
                            <Switch
                                value={dailySummary}
                                onValueChange={setDailySummary}
                                disabled={!pushEnabled}
                                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                            />
                        </View>

                        {/* Time Picker Trigger */}
                        {dailySummary && (
                            <TouchableOpacity
                                style={styles.timeRow}
                                disabled={!pushEnabled}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={styles.rowTitle}>알림 시간</Text>
                                <View style={styles.timeBadge}>
                                    <Text style={styles.timeText}>{alertTime}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#4B5563" style={{ marginLeft: 4 }} />
                                </View>
                            </TouchableOpacity>
                        )}

                    </View>
                </ScrollView>

                {/* Time Picker Modal */}
                <Modal visible={showTimePicker} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowTimePicker(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>알림 시간 선택</Text>
                            <FlatList
                                data={times}
                                keyExtractor={item => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setAlertTime(item);
                                            setShowTimePicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalItemText,
                                            alertTime === item && { color: '#10B981', fontWeight: 'bold' }
                                        ]}>{item}</Text>
                                        {alertTime === item && (
                                            <Ionicons name="checkmark" size={20} color="#10B981" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    // Header styles removed as ScreenWrapper handles it
    content: { flex: 1 },
    section: { backgroundColor: '#fff', marginTop: 16, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 14, color: '#6B7280', paddingVertical: 12 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowTitle: { fontSize: 16, color: '#374151', fontWeight: '500' },
    rowSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },

    // Time Row
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    timeText: { fontSize: 16, color: '#111827', fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', maxHeight: 400, backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { fontSize: 16, color: '#374151' },
});

export default NotificationScreen;
