import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ProfileSettings = ({ onLogout, onDataConsent }) => {
    const MenuItem = ({ iconName, label, value, onPress, labelColor }) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                backgroundColor: 'transparent',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.05)',
            }}
        >
            <Feather name={iconName} size={20} color={labelColor || "white"} style={{ marginRight: 12, opacity: 0.8 }} />
            <Text style={{ flex: 1, fontSize: 15, color: labelColor || 'white' }}>{label}</Text>
            {value && <Text style={{ fontSize: 13, color: '#9CA3AF', marginRight: 8 }}>{value}</Text>}
            <Feather name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>
    );

    return (
        <View style={{ height: '100%', backgroundColor: '#1E1E2E' }}>
            <View style={{ paddingVertical: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>설정</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Profile Card */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#333',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                    }}>
                        <Feather name="user" size={30} color="#9CA3AF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: 'white' }}>홍문수</Text>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>artmer3061@gmail.com</Text>
                        <View style={{ marginTop: 8, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, backgroundColor: 'rgba(255,215,0,0.1)', alignSelf: 'flex-start' }}>
                            <Text style={{ color: '#FFD700', fontSize: 11 }}>평생회원</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        backgroundColor: '#333',
                        borderRadius: 4
                    }}>
                        <Text style={{ color: 'white', fontSize: 12 }}>수정</Text>
                    </TouchableOpacity>
                </View>

                {/* Sections */}
                <View style={{ marginTop: 24 }}>
                    <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 8 }}>농장 관리</Text>
                    <MenuItem iconName="home" label="농장 정보 수정" />
                    <MenuItem iconName="map" label="섹터 관리" />
                    <MenuItem iconName="settings" label="품종 설정" />
                </View>

                <View style={{ marginTop: 24 }}>
                    <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 8 }}>알림 설정</Text>
                    <MenuItem iconName="bell" label="푸시 알림" value="ON" />
                    <MenuItem iconName="bell" label="PMI 경보 알림" value="ON" />
                </View>

                <View style={{ marginTop: 24 }}>
                    <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 8 }}>데이터 관리</Text>
                    <MenuItem iconName="database" label="데이터 활용 동의 관리" onPress={onDataConsent} />
                    <MenuItem iconName="database" label="데이터 내보내기" />
                </View>

                <View style={{ marginTop: 24 }}>
                    <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 8 }}>고객지원</Text>
                    <MenuItem iconName="help-circle" label="문의하기" />
                    <MenuItem iconName="help-circle" label="사용 가이드" />
                </View>

                <TouchableOpacity
                    onPress={onLogout}
                    style={{
                        width: '100%',
                        marginTop: 32,
                        padding: 16,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#9CA3AF' }}>로그아웃</Text>
                </TouchableOpacity>

                <View style={{ alignItems: 'center', marginTop: 24, paddingBottom: 40 }}>
                    <Text style={{ color: '#444', fontSize: 12 }}>버전 1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProfileSettings;
