import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const NotificationList = ({ onBack }) => {
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
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>알림</Text>
                <Text style={{ marginLeft: 'auto', fontSize: 13, color: '#9CA3AF' }}>모두 읽음</Text>
            </View>

            <ScrollView style={{ padding: 20, flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 0, marginBottom: 12 }}>오늘</Text>

                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                        <Feather name="bell" size={20} color="#EF4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>PMI 경보</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>오전 9:30</Text>
                        </View>
                        <Text style={{ fontSize: 14, margin: 0, color: '#ddd' }}>노균병 위험도 82점 - 즉시 확인</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Feather name="calendar" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>일정 알림</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>오전 8:00</Text>
                        </View>
                        <Text style={{ fontSize: 14, margin: 0, color: '#ddd' }}>오후 2시 관수 예정</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 24, marginBottom: 12 }}>어제</Text>

                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                        <Feather name="check-circle" size={20} color="#4ADE80" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>진단 완료</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>오후 3:45</Text>
                        </View>
                        <Text style={{ fontSize: 14, margin: 0, color: '#ddd' }}>정상으로 판정되었습니다</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                        <Feather name="thermometer" size={20} color="#FBBF24" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>센서 알림</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>오후 1:20</Text>
                        </View>
                        <Text style={{ fontSize: 14, margin: 0, color: '#ddd' }}>1동 습도 92% - 환기 권장</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default NotificationList;
