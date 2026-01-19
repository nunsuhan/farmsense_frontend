import React from 'react';
import { Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const SignupScreen = ({ onBack, onComplete }) => {
    return (
        <View style={{ height: '100%', flexDirection: 'column', backgroundColor: '#1E1E2E' }}>
            {/* Header */}
            <View style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.1)',
                flexDirection: 'row'
            }}>
                <TouchableOpacity
                    onPress={onBack}
                    style={{ padding: 0, marginRight: 16 }}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>농장 정보 입력</Text>
                <Text style={{ marginLeft: 'auto', color: '#FFD700' }}>1/3</Text>
            </View>

            <ScrollView style={{ padding: 24, flex: 1 }}>
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ marginBottom: 8, fontWeight: 'bold', color: 'white' }}>
                        농장 이름 <Text style={{ color: '#FFD700' }}>*</Text>
                    </Text>
                    <TextInput
                        placeholder="예: 김천 문수네 포도농장"
                        placeholderTextColor="#999"
                        style={{
                            width: '100%',
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 0,
                            backgroundColor: '#252542',
                            color: 'white',
                            fontSize: 16
                        }}
                    />
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ marginBottom: 8, fontWeight: 'bold', color: 'white' }}>
                        농장 주소 <Text style={{ color: '#FFD700' }}>*</Text>
                    </Text>
                    <View style={{
                        width: '100%',
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: '#252542',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>주소 검색</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#FBBF24' }}>
                        ⚠️ 자택이 아닌 농장 주소를 입력하세요
                    </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ marginBottom: 12, fontWeight: 'bold', color: 'white' }}>
                        재배 형태 <Text style={{ color: '#FFD700' }}>*</Text>
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {['비가림', '연동하우스', '노지', '기타'].map((type, idx) => (
                            <TouchableOpacity
                                key={type}
                                style={{
                                    backgroundColor: idx === 0 ? '#FFD700' : '#252542',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    borderWidth: 0,
                                    flex: 1,
                                    minWidth: 80,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: idx === 0 ? 'black' : '#9CA3AF' }}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ marginBottom: 40 }}>
                    <Text style={{ marginBottom: 12, fontWeight: 'bold', color: 'white' }}>
                        주요 품종 <Text style={{ color: '#FFD700' }}>*</Text>
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {['샤인머스캣', '캠벨', '거봉', 'MBA'].map((type, idx) => (
                            <TouchableOpacity
                                key={type}
                                style={{
                                    backgroundColor: idx === 0 ? '#FFD700' : '#252542',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    borderWidth: 0,
                                    flex: 1,
                                    minWidth: 80,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: idx === 0 ? 'black' : '#9CA3AF' }}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={onComplete}
                    style={{
                        width: '100%',
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: '#FFD700',
                        alignItems: 'center',
                        shadowColor: '#FFD700',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 5,
                        marginBottom: 40
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>다음</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default SignupScreen;
