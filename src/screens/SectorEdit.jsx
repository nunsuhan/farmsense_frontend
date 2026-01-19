import React from 'react';
import { Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const SectorEdit = ({ onBack, onSave }) => {
    return (
        <View style={{ height: '100%', flexDirection: 'column', backgroundColor: '#1E1E2E' }}>
            <View style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.1)'
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={onBack}
                        style={{ padding: 0, marginRight: 16 }}
                    >
                        <Feather name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>섹터 그리기</Text>
                </View>
                <TouchableOpacity
                    onPress={onSave}
                    style={{ padding: 0 }}
                >
                    <Text style={{
                        color: '#FFD700',
                        fontWeight: 'bold',
                        fontSize: 16,
                    }}>완료</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Map Area Mock */}
                <View style={{
                    height: 300,
                    backgroundColor: '#1E3A2F',
                    position: 'relative',
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{ position: 'absolute', top: 20, left: 20, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="planet" size={12} color="white" style={{ marginRight: 6 }} />
                        <Text style={{ color: 'white', fontSize: 12 }}>위성지도</Text>
                    </View>

                    {/* Polygon Mock (Replaced SVG with View) */}
                    <View style={{
                        width: 150,
                        height: 120,
                        borderWidth: 2,
                        borderColor: '#FFD700',
                        borderStyle: 'dashed',
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        // Simple rectangle representation as fallback for SVG polygon
                    }}>
                        {/* Vertices */}
                        <View style={{ position: 'absolute', top: -6, left: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 2, borderColor: '#FFD700' }} />
                        <View style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 2, borderColor: '#FFD700' }} />
                        <View style={{ position: 'absolute', bottom: -6, left: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 2, borderColor: '#FFD700' }} />
                        <View style={{ position: 'absolute', bottom: -6, right: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 2, borderColor: '#FFD700' }} />
                    </View>

                    <Text style={{
                        position: 'absolute',
                        top: 140,
                        left: '50%',
                        marginLeft: -20,
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0,0,0,0.8)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4
                    }}>
                        새 섹터
                    </Text>

                    <View style={{ position: 'absolute', bottom: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}>
                        <Text style={{ color: 'white', fontSize: 13 }}>📍 탭하여 꼭짓점 추가</Text>
                    </View>
                </View>

                <View style={{ padding: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: 'white' }}>📐 면적</Text>
                        <Text style={{ fontSize: 18, color: '#FFD700' }}>320평 <Text style={{ fontSize: 13, color: '#888' }}>(자동계산)</Text></Text>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: 'white' }}>
                            섹터 이름 <Text style={{ color: '#FFD700' }}>*</Text>
                        </Text>
                        <TextInput
                            defaultValue="3동 뒷편"
                            style={{ width: '100%', padding: 16, borderRadius: 12, backgroundColor: '#252542', borderWidth: 0, color: 'white', fontSize: 16 }}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: 'white' }}>
                            품종 선택 <Text style={{ color: '#FFD700' }}>*</Text>
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#FFD700', alignItems: 'center' }}>
                                <Text style={{ color: 'black' }}>샤인머스캣</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#252542', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>캠벨</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#252542', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>거봉</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#252542', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>MBA</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: 'white' }}>수령</Text>
                        <TextInput
                            defaultValue="5년생"
                            style={{ width: '100%', padding: 16, borderRadius: 12, backgroundColor: '#252542', borderWidth: 0, color: 'white', fontSize: 16 }}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={{ marginBottom: 40 }}>
                        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: 'white' }}>재배 형태</Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#252542', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>비가림</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#252542', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>연동하우스</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#252542', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>노지</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default SectorEdit;
