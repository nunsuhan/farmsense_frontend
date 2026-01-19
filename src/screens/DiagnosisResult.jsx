import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const DiagnosisResult = ({ onBack, onMoreClick }) => {
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
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>진단 결과</Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={{
                    height: 240,
                    backgroundColor: '#333',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{ color: '#666' }}>[촬영된 사진]</Text>
                </View>

                <View style={{ padding: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 24, marginRight: 8 }}>🔴</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>노균병 의심 (87%)</Text>
                    </View>

                    <View style={{
                        backgroundColor: '#252542',
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 24,
                    }}>
                        <Text style={{ fontSize: 14, lineHeight: 22, color: '#9CA3AF' }}>
                            잎 뒷면에 흰색 곰팡이가 관찰됩니다. 노균병 초기 증상으로 보입니다.
                        </Text>
                    </View>

                    <Text style={{ fontSize: 18, marginBottom: 12, color: 'white' }}>💊 추천 농약</Text>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' }}>
                            <Text style={{ color: 'white' }}>포리옥신 수화제</Text>
                            <Text style={{ color: '#FFD700' }}>1,000배</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' }}>
                            <Text style={{ color: 'white' }}>안트라콜 수화제</Text>
                            <Text style={{ color: '#FFD700' }}>500배</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onMoreClick}
                            style={{ paddingVertical: 12 }}
                        >
                            <Text style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>더보기</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 18, marginBottom: 12, marginTop: 12, color: 'white' }}>📋 조치 방법</Text>
                    <View style={{ paddingLeft: 8 }}>
                        <Text style={{ color: '#ddd', lineHeight: 24 }}>1. 발병 잎 제거</Text>
                        <Text style={{ color: '#ddd', lineHeight: 24 }}>2. 통풍 개선</Text>
                        <Text style={{ color: '#ddd', lineHeight: 24 }}>3. 예방제 살포</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={{
                paddingTop: 20,
                paddingHorizontal: 24,
                paddingBottom: 30,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.05)',
                flexDirection: 'row',
                gap: 16,
                backgroundColor: '#1E1E2E'
            }}>
                <TouchableOpacity style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#333344',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)'
                }}>
                    <Feather name="message-square" size={20} color="white" />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>상담하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#FFD700',
                    shadowColor: '#FFD700',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 4
                }}>
                    <Feather name="clipboard" size={20} color="#000" />
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>일지저장</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default DiagnosisResult;
