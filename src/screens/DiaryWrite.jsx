import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DiaryWrite = ({ onBack, onSave }) => {
    const [selectedTag, setSelectedTag] = useState('착과기');
    const [location, setLocation] = useState('2dong');
    const tags = ['개화기', '착과기', '비대기', '착색기', '수확기', '휴면기'];

    return (
        <View style={{ height: '100%', flexDirection: 'column', backgroundColor: '#1E1E2E' }}>
            <View style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
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
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>일지 작성</Text>
                </View>
                <TouchableOpacity
                    onPress={onSave}
                    style={{ padding: 0 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#FFD700' }}>저장</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <Feather name="calendar" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#9CA3AF' }}>2024년 12월 14일 (토)</Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="map-pin" size={16} color="white" style={{ marginRight: 6 }} />
                        <Text style={{ fontWeight: 'bold', color: 'white' }}>위치 선택</Text>
                    </View>
                    <View style={{ padding: 16, flexDirection: 'column', gap: 12 }}>
                        <TouchableOpacity onPress={() => setLocation('1dong')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Ionicons name={location === '1dong' ? "radio-button-on" : "radio-button-off"} size={20} color={location === '1dong' ? "#FFD700" : "white"} style={{ marginRight: 12 }} />
                            <Text style={{ color: location === '1dong' ? '#FFD700' : 'white' }}>1동 (320평) - 샤인머스캣</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLocation('2dong')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Ionicons name={location === '2dong' ? "radio-button-on" : "radio-button-off"} size={20} color={location === '2dong' ? "#FFD700" : "white"} style={{ marginRight: 12 }} />
                            <Text style={{ fontWeight: 'bold', color: location === '2dong' ? '#FFD700' : 'white' }}>2동 (280평) - 캠벨얼리</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLocation('all')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name={location === 'all' ? "radio-button-on" : "radio-button-off"} size={20} color={location === 'all' ? "#FFD700" : "white"} style={{ marginRight: 12 }} />
                            <Text style={{ color: location === 'all' ? '#FFD700' : 'white' }}>전체</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ marginBottom: 12, fontWeight: 'bold', color: 'white' }}>📷 사진 추가</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#666' }}>사진1</Text>
                        </View>
                        <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#666' }}>사진2</Text>
                        </View>
                        <TouchableOpacity style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#666', borderStyle: 'dashed', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                            <Feather name="plus" size={24} color="#666" style={{ marginBottom: 4 }} />
                            <Text style={{ fontSize: 11, color: '#666' }}>추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ marginBottom: 12, fontWeight: 'bold', color: 'white' }}>🌱 생육 상태</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {tags.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => setSelectedTag(tag)}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 20,
                                    backgroundColor: selectedTag === tag ? '#FFD700' : '#252542',
                                }}
                            >
                                <Text style={{ fontSize: 13, color: selectedTag === tag ? 'black' : '#9CA3AF' }}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ marginBottom: 12, fontWeight: 'bold', color: 'white' }}>📊 측정값 (선택)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        <View style={{ backgroundColor: '#252542', padding: 16, borderRadius: 12, width: '48%' }}>
                            <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>당도</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <TextInput
                                    placeholder="__"
                                    placeholderTextColor="#555"
                                    style={{ width: 40, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#555', color: 'white', fontSize: 18, textAlign: 'center', padding: 0 }}
                                />
                                <Text style={{ marginLeft: 4, fontSize: 14, color: 'white' }}>Brix</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#252542', padding: 16, borderRadius: 12, width: '48%' }}>
                            <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>산도</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <TextInput
                                    placeholder="__"
                                    placeholderTextColor="#555"
                                    style={{ width: 40, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#555', color: 'white', fontSize: 18, textAlign: 'center', padding: 0 }}
                                />
                                <Text style={{ marginLeft: 4, fontSize: 14, color: 'white' }}>%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ marginBottom: 40 }}>
                    <Text style={{ marginBottom: 12, fontWeight: 'bold', color: 'white' }}>📝 메모</Text>
                    <TextInput multiline
                        placeholder="오늘의 작업 내용이나 관찰 사항을 기록하세요."
                        placeholderTextColor="#666"
                        style={{
                            width: '100%',
                            height: 120,
                            padding: 16,
                            backgroundColor: '#252542',
                            borderRadius: 12,
                            color: 'white',
                            fontSize: 15,
                            textAlignVertical: 'top'
                        }}
                        defaultValue={`오늘 착색 상태 양호함.\n당도 측정 결과 16.5Brix\n잎 상태 깨끗함.`}
                    ></TextInput>
                </View>

                <TouchableOpacity
                    onPress={onSave}
                    style={{
                        width: '100%',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        backgroundColor: '#FFD700',
                        marginBottom: 40,
                        shadowColor: '#FFD700',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 4
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' }}>저장하기</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default DiaryWrite;
