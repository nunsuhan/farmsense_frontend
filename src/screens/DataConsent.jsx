import React, { useState } from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const DataConsent = ({ onBack }) => {
    const [consents, setConsents] = useState({
        service: true,
        ai: true,
        research: false,
        profit: false
    });

    const toggle = (key) => {
        if (key === 'service') return; // Essential
        setConsents(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const ConsentItem = ({ id, label, desc, required, checked }) => (
        <TouchableOpacity onPress={() => toggle(id)} activeOpacity={0.7} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ marginRight: 16, marginTop: 2 }}>
                    {checked
                        ? <Feather name="check-circle" size={24} color={required ? "#9CA3AF" : "#FFD700"} />
                        : <Feather name="circle" size={24} color="#666" />
                    }
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'white', marginRight: 6 }}>{label}</Text>
                        <Text style={{ fontSize: 12, color: required ? '#FFD700' : '#666' }}>({required ? '필수' : '선택'})</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 20 }}>
                        {desc}
                    </Text>
                </View>
                <View style={{ alignSelf: 'center', marginLeft: 8 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                        {required ? '변경불가' : (checked ? 'ON' : 'OFF')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>데이터 활용 동의</Text>
            </View>

            <ScrollView style={{ padding: 20, flex: 1 }}>
                <ConsentItem
                    id="service"
                    label="서비스 제공"
                    desc="병해 진단, 맞춤 정보 제공을 위해 필수적입니다."
                    required={true}
                    checked={consents.service}
                />

                <ConsentItem
                    id="ai"
                    label="AI 모델 개선"
                    desc="익명화된 진단 데이터를 활용하여 AI 정확도를 높입니다."
                    required={false}
                    checked={consents.ai}
                />

                <ConsentItem
                    id="research"
                    label="연구/논문 활용"
                    desc="농진청 및 대학과의 공동 연구 자료로 활용됩니다."
                    required={false}
                    checked={consents.research}
                />

                <ConsentItem
                    id="profit"
                    label="수익 공유 프로그램"
                    desc="데이터 기여도에 따라 리워드를 제공받습니다."
                    required={false}
                    checked={consents.profit}
                />

                <View style={{
                    backgroundColor: 'rgba(255,215,0,0.1)',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 24,
                }}>
                    <Text style={{ fontSize: 13, color: '#FFD700', lineHeight: 20 }}>
                        💡 동의 항목은 언제든 변경할 수 있으며, 변경 즉시 효력이 발생합니다.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default DataConsent;
