import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const HomeDashboard = ({ onNavigate, onNotificationClick, onMenuClick }) => {
    return (
        <View style={{
            height: '100%',
            paddingBottom: 80, // Space for TabBar
            backgroundColor: '#1A1A2E' // Fallback for linear-gradient
        }}>
            {/* Header */}
            <View style={{
                padding: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(26, 26, 46, 0.95)',
                zIndex: 100
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={onMenuClick}
                        style={{
                            marginRight: 12,
                        }}
                    >
                        <Feather name="menu" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                            김천 문수네 포도농장
                            <Text style={{ fontSize: 14, fontWeight: 'normal', marginLeft: 6 }}> ▼</Text>
                        </Text>
                        <Text style={{ marginTop: 4, fontSize: 12, color: '#9CA3AF' }}>
                            오늘도 풍성한 수확을 기원합니다!
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={onNotificationClick}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 20,
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    <Feather name="bell" size={20} color="white" />
                    <View style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        backgroundColor: '#EF4444',
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#1A1A2E'
                    }} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Weather Brief */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 24,
                    backgroundColor: '#252542',
                    padding: 16,
                    borderRadius: 16
                }}>
                    <Feather name="sun" size={40} color="#FFD700" style={{ marginRight: 16 }} />
                    <View>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>24°C</Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>흐림 • 습도 65%</Text>
                    </View>
                </View>

                {/* PMI Card */}
                <TouchableOpacity
                    onPress={() => onNavigate('pmi_detail')}
                    style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: '#1A1A2E'
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="leaf" color="#FFD700" size={20} style={{ marginRight: 8 }} />
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>병해 위험도 (PMI)</Text>
                        </View>
                        <View style={{
                            backgroundColor: 'rgba(244, 67, 54, 0.2)',
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 8,
                        }}>
                            <Text style={{
                                color: '#FF5252',
                                fontSize: 12,
                                fontWeight: 'bold'
                            }}>
                                위험
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <View>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FF5252' }}>82<Text style={{ fontSize: 16 }}>점</Text></Text>
                            <Text style={{ fontSize: 12, color: '#ccc' }}>노균병 주의보</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Sensor Grid */}
                <Text style={{ fontSize: 18, marginTop: 24, marginBottom: 12, color: 'white' }}>센서 모니터링</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => onNavigate('sensor_detail')}
                        style={{ backgroundColor: '#252542', padding: 16, borderRadius: 16, width: '48%' }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="thermometer" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                            <Text style={{ color: '#9CA3AF' }}>온도</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>24.5°C</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onNavigate('sensor_detail')}
                        style={{ backgroundColor: '#252542', padding: 16, borderRadius: 16, width: '48%' }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="water" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                            <Text style={{ color: '#9CA3AF' }}>습도</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>78%</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onNavigate('sensor_detail')}
                        style={{ backgroundColor: '#252542', padding: 16, borderRadius: 16, width: '48%' }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Feather name="wind" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                            <Text style={{ color: '#9CA3AF' }}>CO2</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>420ppm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onNavigate('sensor_detail')}
                        style={{ backgroundColor: '#252542', padding: 16, borderRadius: 16, width: '48%' }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Feather name="sun" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                            <Text style={{ color: '#9CA3AF' }}>일사</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>850w</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default HomeDashboard;
