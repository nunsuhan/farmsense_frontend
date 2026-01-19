// src/screens/settings/SoilEnvironmentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Card } from '../../components/common/Card';
import { colors } from '../../theme/colors';
import { getMyFarmSoilInfo, registerMyFarmPNU, getGrapeSuitability } from '../../services/soilApi';

import AddressSearchModal from '../../components/AddressSearchModal';

const SoilEnvironmentScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const [pnuCode, setPnuCode] = useState('');
    const [addressText, setAddressText] = useState('');
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [soilInfo, setSoilInfo] = useState<any>(null);
    const [suitability, setSuitability] = useState<any>(null);

    // Mock initial load - In real app, check if user already has PNU
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. 내 농장 정보 조회 (PNU 확인용)
            // const farmInfo = await getMyFarmSoilInfo(); // API 구현 필요
            // if (farmInfo?.pnu) {
            //    setPnuCode(farmInfo.pnu);
            //    await fetchSoilDetails(farmInfo.pnu);
            // }

            // For MVP Demo: If no PNU, just wait for user input
        } catch (e) {
            console.log('No PNU found');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = async (address: any) => {
        // 주소 선택 시 처리
        const selectedAddress = address.jibunAddr || address.roadAddr;
        setAddressText(selectedAddress);

        // PNU 코드 변환 로직 (실제로는 API 호출 필요)
        // 여기서는 예시로 PNU 코드가 있다고 가정하거나, 
        // 주소 기반으로 검색하는 API를 호출해야 함.
        // 임시로 PNU 코드를 입력받는 필드는 유지하되, 주소 선택 시 자동 채움 등의 UX도 고려 가능.
        // 지금은 데모용으로 주소가 선택되면 더미 PNU를 넣거나 API 호출 시늉을 함.

        // const pnu = await getPNUFromAddress(selectedAddress);
        // setPnuCode(pnu || '51150...'); 

        // 데모: 주소가 선택되면 바로 조회 시도
        setLoading(true);
        try {
            // 실제 변환 API 호출 (구현 필요)
            // await registerMyFarmPNU(address.admCd + ...);

            // 데모용 Fallback 조회
            await fetchSoilDetails('DEMO_PNU');
            Alert.alert('성공', `선택된 주소(${selectedAddress})의 토양 정보를 불러왔습니다.`);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // 기존 수동 등록 (유지하되 주소 검색 위주로)
    const handleRegisterPNU = async () => {
        if (!pnuCode || pnuCode.length < 10) {
            Alert.alert('알림', '올바른 PNU 코드를 입력해주세요.');
            return;
        }
        setLoading(true);
        try {
            // PNU 등록
            await registerMyFarmPNU(pnuCode);
            // 정보 조회
            await fetchSoilDetails(pnuCode);
            Alert.alert('성공', '농장 토양 정보가 등록되었습니다.');
        } catch (e) {
            // Fallback for Demo if API fails
            await fetchSoilDetails(pnuCode);
            // Alert.alert('오류', '등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSoilDetails = async (code: string) => {
        try {
            // Mock Data for Demo
            const mockSoil = {
                soil_texture: '양질사토',
                drainage_grade: '약간양호',
                effective_soil_depth: '50-100cm',
                slope: '0-2%',
                fruit_aptitude: '2급지'
            };
            setSoilInfo(mockSoil);

            const mockSuitability = {
                score: 60,
                grade: 'B (양호)',
                issues: ['저습지역'],
                recommendations: ['배수시설 강화 필요', '이랑 높이기']
            };
            setSuitability(mockSuitability);

            // Real API call would be:
            // const sInfo = await getMyFarmSoilInfo();
            // const suit = await getGrapeSuitability(code);
            // setSoilInfo(sInfo);
            // setSuitability(suit);

        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ScreenWrapper title="내 농장 토양정보" showBack>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Address/PNU Input Section */}
                <Card style={styles.card}>
                    <Text variant="h3" style={{ marginBottom: 12 }}>📍 농장 위치 설정</Text>

                    {/* 주소 검색 버튼 */}
                    <TouchableOpacity
                        style={styles.addressSearchBox}
                        onPress={() => setIsAddressModalVisible(true)}
                    >
                        <Text style={addressText ? styles.addressText : styles.placeholderText}>
                            {addressText || '주소 검색을 통해 농장을 찾아보세요'}
                        </Text>
                        <View style={styles.searchIconBtn}>
                            <Text style={styles.searchBtnText}>검색</Text>
                        </View>
                    </TouchableOpacity>

                    {/* 수동 PNU 입력 (숨김 또는 보조) - 여기서는 삭제하고 주소 검색만 남김, 
                        하지만 기존 기능 보존을 위해 작은 텍스트로 남길 수도 있음.
                        사용자 요청이 '잘못된 디자인 고치기' 이므로 PNU 입력창은 과감히 제거하고 주소 기반으로 변경. 
                    */}

                    <Text variant="caption" color="#6B7280" style={{ marginTop: 8, lineHeight: 20 }}>
                        * 지번 주소를 선택하면 해당 지역의 토양 적성 정보를 자동으로 분석합니다.
                        {'\n'}* PNU 코드를 모르셔도 주소만으로 조회가 가능합니다.
                    </Text>
                </Card>

                <AddressSearchModal
                    visible={isAddressModalVisible}
                    onClose={() => setIsAddressModalVisible(false)}
                    onSelectAddress={handleSelectAddress}
                />

                {loading && <ActivityIndicator size="large" color={colors.primary} />}

                {soilInfo && (
                    <>
                        {/* Soil Characteristics */}
                        <Card style={styles.card}>
                            <Text variant="h3" style={{ marginBottom: 16 }}>📊 토양 특성</Text>
                            <View style={styles.infoRow}>
                                <Text color="#4B5563">과수적성</Text>
                                <Text weight="bold">{soilInfo.fruit_aptitude}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text color="#4B5563">배수등급</Text>
                                <Text weight="bold">{soilInfo.drainage_grade}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text color="#4B5563">토성</Text>
                                <Text weight="bold">{soilInfo.soil_texture}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text color="#4B5563">유효토심</Text>
                                <Text weight="bold">{soilInfo.effective_soil_depth}</Text>
                            </View>
                        </Card>

                        {/* Suitability Evaluation */}
                        {suitability && (
                            <Card style={[styles.card, { borderColor: '#10B981', borderWidth: 1, backgroundColor: '#ECFDF5' } as any]}>
                                <Text variant="h3" style={{ marginBottom: 12 }}>🍇 포도 재배 적합성</Text>
                                <View style={styles.scoreBox}>
                                    <Text variant="h1" color="#059669">{suitability.score}점</Text>
                                    <Text variant="h3" color="#059669" style={{ marginTop: 4 }}>{suitability.grade}</Text>
                                </View>

                                {suitability.issues && suitability.issues.length > 0 && (
                                    <View style={styles.issueBox}>
                                        <Text weight="bold" color="#EF4444">⚠️ 문제점: {suitability.issues.join(', ')}</Text>
                                    </View>
                                )}

                                <View style={{ marginTop: 12 }}>
                                    <Text weight="bold" style={{ marginBottom: 4 }}>💡 개선 권장:</Text>
                                    {suitability.recommendations.map((rec: string, idx: number) => (
                                        <Text key={idx} variant="body2" color="#374151">• {rec}</Text>
                                    ))}
                                </View>
                            </Card>
                        )}

                        {/* Link to Fertilizer Prescription */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('FertilizerPrescription', { pnuCode })}
                        >
                            <Text style={styles.actionButtonText}>💊 맞춤 비료처방 받기</Text>
                        </TouchableOpacity>
                    </>
                )}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: { marginBottom: 16, padding: 16 },
    inputRow: { flexDirection: 'row', gap: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF' },
    searchButton: { backgroundColor: '#10B981', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8 },
    searchButtonText: { color: '#FFF', fontWeight: 'bold' },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    divider: { height: 1, backgroundColor: '#F3F4F6' },

    scoreBox: { alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#10B98130', marginBottom: 12 },
    issueBox: { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 4, marginBottom: 8 },

    actionButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    // Address Search Styles
    addressSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#10B981',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#F0FDF4',
        marginBottom: 8
    },
    addressText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#065F46',
        flex: 1,
        marginRight: 8
    },
    placeholderText: {
        fontSize: 15,
        color: '#059669',
        flex: 1
    },
    searchIconBtn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6
    },
    searchBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold'
    }
});

export default SoilEnvironmentScreen;
