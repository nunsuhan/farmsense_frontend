import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PesticideDetail = ({ onBack }) => {
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
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>추천 농약</Text>
            </View>

            <ScrollView style={{ padding: 20, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, marginRight: 8 }}>🎯</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>노균병 방제용 농약</Text>
                </View>

                {/* Medication Card 1 (Expanded) */}
                <View style={{ borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, marginRight: 8 }}>💊</Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>포리옥신 수화제</Text>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        <View style={{ width: '48%', marginBottom: 4 }}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>희석배수: <Text style={{ fontWeight: 'bold', color: '#ddd' }}>1,000배</Text></Text>
                        </View>
                        <View style={{ width: '48%', marginBottom: 4 }}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>살포량: <Text style={{ color: '#ddd' }}>10a당 200L</Text></Text>
                        </View>
                        <View style={{ width: '48%', marginBottom: 4 }}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>안전사용: <Text style={{ color: '#ddd' }}>수확 14일 전</Text></Text>
                        </View>
                        <View style={{ width: '48%', marginBottom: 4 }}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>사용횟수: <Text style={{ color: '#ddd' }}>3회 이내</Text></Text>
                        </View>
                    </View>

                    <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Feather name="alert-triangle" size={14} color="#FBBF24" style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 14, color: '#FBBF24' }}>주의사항</Text>
                        </View>
                        <View style={{ paddingLeft: 8 }}>
                            <Text style={{ fontSize: 13, color: '#ccc', lineHeight: 20 }}>• 꿀벌 등 화분매개충에 독성</Text>
                            <Text style={{ fontSize: 13, color: '#ccc', lineHeight: 20 }}>• 고온 시 약해 주의</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={{
                        width: '100%',
                        padding: 12,
                        backgroundColor: '#333',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row'
                    }}>
                        <Text style={{ color: 'white', fontSize: 14 }}>농약 구매처 검색</Text>
                        <Feather name="external-link" size={14} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                </View>

                {/* Medication Card 2 (Collapsed) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#252542', borderRadius: 12, marginBottom: 24 }}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ marginRight: 8 }}>💊</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>안트라콜 수화제</Text>
                        </View>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>희석배수: 500배</Text>
                    </View>
                    <TouchableOpacity style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: '#555',
                        borderRadius: 6
                    }}>
                        <Text style={{ color: '#ccc', fontSize: 12 }}>상세보기</Text>
                    </TouchableOpacity>
                </View>

                {/* Tips Card */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ marginRight: 8, fontSize: 16 }}>💡</Text>
                        <Text style={{ fontSize: 16, color: 'white' }}>살포 팁</Text>
                    </View>
                    <View style={{ paddingLeft: 8 }}>
                        <Text style={{ fontSize: 14, color: '#ddd', lineHeight: 24 }}>• 이슬 마른 후 오전 살포</Text>
                        <Text style={{ fontSize: 14, color: '#ddd', lineHeight: 24 }}>• 잎 뒷면까지 충분히</Text>
                        <Text style={{ fontSize: 14, color: '#ddd', lineHeight: 24 }}>• 비 오기 전 2시간 확보</Text>
                    </View>
                </View>

                {/* AI Ask Button */}
                <TouchableOpacity style={{
                    width: '100%',
                    padding: 16,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    marginTop: 16,
                    marginBottom: 40
                }}>
                    <Feather name="help-circle" size={18} color="#FFD700" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#FFD700', fontSize: 15, fontWeight: 'bold' }}>AI에게 더 물어보기</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default PesticideDetail;
