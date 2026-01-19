import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const FarmSettings = ({ onEditMode, onMenuClick }) => {
    return (
        <ScrollView style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 20 }}>
                <TouchableOpacity
                    onPress={onMenuClick}
                    style={{
                        marginRight: 12,
                    }}
                >
                    <Feather name="menu" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ margin: 0, color: 'white', fontSize: 18, fontWeight: 'bold' }}>농장 설정</Text>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>내 농장: 김천시 감문면</Text>
                <Text style={{ color: '#ccc', marginTop: 4 }}>총 면적: 1,200평</Text>
            </View>

            {/* Map Visualization */}
            <View style={{ height: 240, position: 'relative', overflow: 'hidden', borderRadius: 12, marginBottom: 20 }}>
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: '#222',
                    // Grid pattern simulation
                    borderWidth: 1,
                    borderColor: '#333'
                }}>
                    {/* Mock Shapes for Sectors via Views (Shapes are approximate rectangles) */}

                    {/* Sector 1: Triangle approximation or just Box */}
                    <View style={{
                        position: 'absolute',
                        top: 50, left: 50, width: 100, height: 50,
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        borderWidth: 2,
                        borderColor: '#FFD700'
                    }}>
                        <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', top: '35%' }}>1동 (320평)</Text>
                    </View>

                    {/* Sector 2 */}
                    <View style={{
                        position: 'absolute',
                        top: 80, left: 160, width: 90, height: 70,
                        backgroundColor: 'rgba(74, 222, 128, 0.2)',
                        borderWidth: 2,
                        borderColor: '#4ADE80'
                    }}>
                        <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', top: '35%' }}>2동 (280평)</Text>
                    </View>

                    <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 }}>
                        <Text style={{ color: 'white', fontSize: 12 }}>🛰️ 위성 지도</Text>
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: 'white' }}>섹터 목록</Text>
                <TouchableOpacity style={{ paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#333', borderRadius: 4 }}>
                    <Text style={{ fontSize: 12, color: 'white' }}>+ 추가</Text>
                </TouchableOpacity>
            </View>

            <View>
                <View style={{ paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: 2 }}>1동 (320평)</Text>
                    <Text style={{ fontSize: 14, color: '#ccc' }}>샤인머스캣 5년생</Text>
                </View>
                <View>
                    <Text style={{ fontWeight: 'bold', color: '#4ADE80', marginBottom: 2 }}>2동 (280평)</Text>
                    <Text style={{ fontSize: 14, color: '#ccc' }}>캠벨얼리 12년생</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onEditMode}
                style={{ width: '100%', marginTop: 24, padding: 12, backgroundColor: '#333', borderRadius: 8, alignItems: 'center' }}
            >
                <Text style={{ color: 'white' }}>✏️ 지도에서 섹터 그리기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default FarmSettings;
