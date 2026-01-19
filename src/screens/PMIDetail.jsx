import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PMIDetail = ({ onBack }) => {
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
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>PMI 병해 예측</Text>
            </View>

            <ScrollView style={{ padding: 20, flex: 1 }}>
                <Text style={{ marginBottom: 16, fontSize: 18, color: 'white' }}>오늘의 위험도</Text>

                {/* Risk Cards */}
                <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', color: 'white' }}>🔴 노균병</Text>
                        <Text style={{ fontWeight: 'bold', color: '#EF4444' }}>82점</Text>
                    </View>
                    <View style={{
                        height: 8,
                        backgroundColor: '#333',
                        borderRadius: 4,
                        marginBottom: 8,
                        overflow: 'hidden'
                    }}>
                        <View style={{ width: '82%', height: '100%', backgroundColor: '#EF4444' }}></View>
                    </View>
                    <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                        권장: 오늘 중 예방제 살포
                    </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', color: 'white' }}>🟡 흰가루병</Text>
                        <Text style={{ fontWeight: 'bold', color: '#FBBF24' }}>45점</Text>
                    </View>
                    <View style={{
                        height: 8,
                        backgroundColor: '#333',
                        borderRadius: 4,
                        marginBottom: 8,
                        overflow: 'hidden'
                    }}>
                        <View style={{ width: '45%', height: '100%', backgroundColor: '#FBBF24' }}></View>
                    </View>
                    <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                        주의 관찰
                    </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', color: 'white' }}>🟢 탄저병</Text>
                        <Text style={{ fontWeight: 'bold', color: '#4ADE80' }}>12점</Text>
                    </View>
                    <View style={{
                        height: 8,
                        backgroundColor: '#333',
                        borderRadius: 4,
                        marginBottom: 8,
                        overflow: 'hidden'
                    }}>
                        <View style={{ width: '12%', height: '100%', backgroundColor: '#4ADE80' }}></View>
                    </View>
                    <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                        안전
                    </Text>
                </View>

                <Text style={{ marginTop: 24, marginBottom: 16, fontSize: 18, color: 'white' }}>📊 7일 예측 그래프</Text>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, color: '#9CA3AF' }}>📈 노균병 위험도 추이</Text>
                    </View>

                    {/* Mock Chart Area (Replaced SVG) */}
                    <View style={{
                        height: 150,
                        borderLeftWidth: 1,
                        borderBottomWidth: 1,
                        borderLeftColor: '#444',
                        borderBottomColor: '#444',
                        marginLeft: 24,
                        marginBottom: 24,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {/* Y-axis labels */}
                        <Text style={{ position: 'absolute', left: -25, top: 0, fontSize: 10, color: '#666' }}>100</Text>
                        <Text style={{ position: 'absolute', left: -20, top: '50%', fontSize: 10, color: '#666' }}>50</Text>
                        <Text style={{ position: 'absolute', left: -20, top: '95%', fontSize: 10, color: '#666' }}>0</Text>

                        {/* Chart content placeholder */}
                        <Text style={{ color: '#666', fontSize: 12 }}>[Graph Placeholder]</Text>
                        <View style={{
                            position: 'absolute',
                            bottom: 20,
                            left: 0,
                            right: 0,
                            height: 100,
                            borderTopWidth: 2,
                            borderColor: '#EF4444',
                            borderStyle: 'dashed',
                            opacity: 0.5
                        }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24 }}>
                        {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                            <Text key={index} style={{ fontSize: 12, color: '#9CA3AF' }}>{day}</Text>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default PMIDetail;
