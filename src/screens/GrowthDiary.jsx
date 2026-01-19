import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const GrowthDiary = ({ onAdd, onMenuClick }) => {
    // Generate simple calendar grid
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <ScrollView style={{ paddingHorizontal: 20 }}>
            <View style={{ marginBottom: 20, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={onMenuClick}
                        style={{
                            marginRight: 12,
                        }}
                    >
                        <Feather name="menu" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={{ flexDirection: 'row', alignItems: 'center', gap: 8, margin: 0, color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                        성장일기 <Text style={{ fontSize: 16, fontWeight: 'normal', color: 'white' }}>2024년 12월</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onAdd}
                    style={{ borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' }}
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <Text key={index} style={{ width: 40, textAlign: 'center', fontSize: 14, color: '#9CA3AF' }}>{day}</Text>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    {/* Empty slots for start of month (assuming starts on Wednesday based on original code implying offset) */}
                    {/* Original code had 3 empty slots, so starts Wednesday */}
                    <View style={{ width: '14.28%', height: 40 }}></View>
                    <View style={{ width: '14.28%', height: 40 }}></View>
                    <View style={{ width: '14.28%', height: 40 }}></View>

                    {days.map(d => {
                        const hasPhoto = [12, 13].includes(d);
                        const isToday = d === 13;
                        return (
                            <View key={d} style={{
                                width: '14.28%', // 100/7
                                height: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: isToday ? '#FFD700' : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{
                                        color: isToday ? '#1A1A2E' : 'white',
                                        fontSize: 14,
                                        fontWeight: isToday ? 'bold' : 'normal',
                                    }}>{d}</Text>
                                </View>
                                {hasPhoto && !isToday && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFD700', position: 'absolute', bottom: 4 }}></View>}
                            </View>
                        );
                    })}
                </View>
            </View>

            <Text style={{ marginBottom: 12, marginTop: 20, color: 'white' }}>12월 13일 (오늘)</Text>
            <View>
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="map-pin" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 14, color: 'white' }}>1동 앞쪽</Text>
                </View>
                <View style={{ marginBottom: 12, flexDirection: 'row', gap: 8 }}>
                    <View style={{ width: 60, height: 60, backgroundColor: '#333', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>🍇</Text>
                    </View>
                    <View style={{ width: 60, height: 60, backgroundColor: '#333', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>🍃</Text>
                    </View>
                    <View style={{ width: 60, height: 60, backgroundColor: '#333', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>🌱</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 14, color: '#ccc' }}>착색 진행 중. 당도 16.5Brix. 잎 상태 양호함.</Text>
            </View>

            <Text style={{ marginBottom: 12, marginTop: 24, color: 'white' }}>12월 12일</Text>
            <View style={{ packingBottom: 100 }}>
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="map-pin" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 14, color: 'white' }}>2동</Text>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <View style={{ width: 60, height: 60, backgroundColor: '#333', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EF4444' }}>
                        <Text style={{ fontSize: 24 }}>⚠️</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 14, color: '#ccc' }}>
                    <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>노균병 의심 발견</Text>
                    . 방제 계획 수립 필요.
                </Text>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

export default GrowthDiary;
