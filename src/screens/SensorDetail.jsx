import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const SensorDetail = ({ onBack }) => {
    return (
        <View style={{ height: '100%', flexDirection: 'column', backgroundColor: '#1E1E2E' }}>
            <View style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: 'center',
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.1)'
            }}>
                <TouchableOpacity
                    onPress={onBack}
                    style={{ padding: 0, marginRight: 16 }}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>센서 현황 (1동)</Text>
            </View>

            <ScrollView style={{ padding: 20, flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
                    실시간 데이터 (5분 전 업데이트)
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, justifyContent: 'space-between' }}>
                    {/* Temperature */}
                    <View style={{ marginBottom: 12, alignItems: 'center', padding: 20, backgroundColor: '#252542', borderRadius: 12, width: '47%' }}>
                        <Ionicons name="thermometer-outline" color="#F44336" size={24} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>24.5°C</Text>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>온도</Text>
                        <Text style={{ fontSize: 12, color: '#4ADE80', marginTop: 4 }}>적정 ✅</Text>
                    </View>

                    {/* Humidity */}
                    <View style={{ marginBottom: 12, alignItems: 'center', padding: 20, backgroundColor: '#252542', borderRadius: 12, width: '47%' }}>
                        <Ionicons name="water-outline" color="#2196F3" size={24} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>78%</Text>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>습도</Text>
                        <Text style={{ fontSize: 12, color: '#FBBF24', marginTop: 4 }}>약간높음</Text>
                    </View>

                    {/* CO2 */}
                    <View style={{ marginBottom: 12, alignItems: 'center', padding: 20, backgroundColor: '#252542', borderRadius: 12, width: '47%' }}>
                        <Feather name="wind" color="#9E9E9E" size={24} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>420ppm</Text>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>CO₂</Text>
                        <Text style={{ fontSize: 12, color: '#4ADE80', marginTop: 4 }}>적정 ✅</Text>
                    </View>

                    {/* Light */}
                    <View style={{ marginBottom: 12, alignItems: 'center', padding: 20, backgroundColor: '#252542', borderRadius: 12, width: '47%' }}>
                        <Feather name="sun" color="#FFD700" size={24} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>850lux</Text>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>일사량</Text>
                        <Text style={{ fontSize: 12, color: '#4ADE80', marginTop: 4 }}>적정 ✅</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 18, marginBottom: 16, color: 'white' }}>24시간 추이</Text>
                <View style={{ height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: '#252542', borderRadius: 12 }}>
                    <Text style={{ color: '#aaa' }}>[온도/습도 그래프 Placeholder]</Text>
                </View>

                <Text style={{ fontSize: 18, marginTop: 24, marginBottom: 16, color: 'white' }}>⚠️ 알림 설정</Text>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' }}>
                        <Text style={{ color: 'white' }}>온도 30°C 이상 알림</Text>
                        <Text style={{ color: '#FFD700', fontSize: 14 }}>[ON]</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' }}>
                        <Text style={{ color: 'white' }}>습도 90% 이상 알림</Text>
                        <Text style={{ color: '#FFD700', fontSize: 14 }}>[ON]</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
                        <Text style={{ color: 'white' }}>센서 이상 알림</Text>
                        <Text style={{ color: '#FFD700', fontSize: 14 }}>[ON]</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default SensorDetail;
