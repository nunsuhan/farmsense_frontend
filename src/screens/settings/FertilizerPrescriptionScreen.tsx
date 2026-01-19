import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Card } from '../../components/common/Card';
import { getFertilizerPrescription } from '../../services/soilApi';
import { colors } from '../../theme/colors';

const FertilizerPrescriptionScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { pnuCode } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [treeAge, setTreeAge] = useState('5-10년생'); // Default
    const [prescription, setPrescription] = useState<any>(null);

    const AGE_OPTIONS = ['1-3년생', '5-10년생', '10년 이상'];

    // Mock Data for fallback or development
    const MOCK_DATA = {
        base_fertilizer: { N: 4.1, P: 4.5, K: 2.1 },
        top_dressing: { N: 3.2, P: 0.0, K: 0.9 },
        compost: { cow: 1200, pig: 264, chicken: 204 }
    };

    const fetchPrescription = async () => {
        if (!pnuCode) return;
        setLoading(true);
        try {
            // API 호출 시도
            const data = await getFertilizerPrescription(pnuCode, treeAge);
            setPrescription(data);
        } catch (error) {
            console.log('Using Mock Data for Fertilizer');
            // Mock Fallback
            setPrescription(MOCK_DATA);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescription();
    }, [pnuCode, treeAge]);

    if (!pnuCode) {
        return (
            <ScreenWrapper title="비료 처방" showBack>
                <View style={styles.center}>
                    <Text>토양 정보(PNU)가 없습니다.</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper title="비료 처방" showBack>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text variant="h3" style={{ marginBottom: 4 }}>🌿 포도 비료처방</Text>
                    <Text variant="body2" color="#6B7280">토양 분석 기반 최적 시비량 가이드</Text>
                </View>

                {/* Tree Age Selector */}
                <View style={styles.ageSelector}>
                    {AGE_OPTIONS.map((age) => (
                        <TouchableOpacity
                            key={age}
                            style={[styles.ageButton, treeAge === age && styles.ageButtonSelected]}
                            onPress={() => setTreeAge(age)}
                        >
                            <Text style={[styles.ageText, treeAge === age && styles.ageTextSelected]}>
                                {age}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    prescription && (
                        <>
                            {/* Chemical Fertilizer Table */}
                            <Card style={styles.card}>
                                <Text variant="h3" style={{ marginBottom: 16 }}>💊 화학비료 처방량 (10a당)</Text>
                                <View style={styles.table}>
                                    <View style={styles.tableRowHeader}>
                                        <Text style={[styles.col, styles.headerText]}>성분</Text>
                                        <Text style={[styles.col, styles.headerText]}>밑거름</Text>
                                        <Text style={[styles.col, styles.headerText]}>웃거름</Text>
                                    </View>
                                    <View style={styles.tableRow}>
                                        <Text style={styles.col}>질소(N)</Text>
                                        <Text style={styles.col}>{prescription.base_fertilizer.N} kg</Text>
                                        <Text style={styles.col}>{prescription.top_dressing.N} kg</Text>
                                    </View>
                                    <View style={styles.tableRow}>
                                        <Text style={styles.col}>인산(P)</Text>
                                        <Text style={styles.col}>{prescription.base_fertilizer.P} kg</Text>
                                        <Text style={styles.col}>{prescription.top_dressing.P} kg</Text>
                                    </View>
                                    <View style={styles.tableRow}>
                                        <Text style={styles.col}>칼리(K)</Text>
                                        <Text style={styles.col}>{prescription.base_fertilizer.K} kg</Text>
                                        <Text style={styles.col}>{prescription.top_dressing.K} kg</Text>
                                    </View>
                                </View>
                            </Card>

                            {/* Compost Prescription */}
                            <Card style={styles.card}>
                                <Text variant="h3" style={{ marginBottom: 16 }}>🐄 퇴비 처방량</Text>
                                <View style={styles.listRow}>
                                    <Text variant="body1">우분퇴비</Text>
                                    <Text variant="body1" weight="bold">{prescription.compost.cow.toLocaleString()} kg/10a</Text>
                                </View>
                                <View style={[styles.listRow, { backgroundColor: '#F9FAFB' }]}>
                                    <Text variant="body1">돈분퇴비</Text>
                                    <Text variant="body1" weight="bold">{prescription.compost.pig.toLocaleString()} kg/10a</Text>
                                </View>
                                <View style={styles.listRow}>
                                    <Text variant="body1">계분퇴비</Text>
                                    <Text variant="body1" weight="bold">{prescription.compost.chicken.toLocaleString()} kg/10a</Text>
                                </View>
                            </Card>

                            <View style={styles.infoBox}>
                                <Text variant="caption" color="#6B7280">
                                    * 위 처방량은 표준 토양 검정 수치를 기준으로 한 권장량입니다. 실제 과원 상태에 따라 가감하여 사용하세요.
                                </Text>
                            </View>
                        </>
                    )
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerSection: { marginBottom: 20 },
    ageSelector: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4, marginBottom: 20 },
    ageButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    ageButtonSelected: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    ageText: { color: '#6B7280', fontWeight: '500' },
    ageTextSelected: { color: '#10B981', fontWeight: 'bold' },
    card: { marginBottom: 16, padding: 16 },
    table: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
    tableRowHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    col: { flex: 1, textAlign: 'center', fontSize: 14, color: '#374151' } as any,
    headerText: { fontWeight: 'bold', color: '#1F2937' },
    listRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8 },
    infoBox: { marginTop: 16, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8 }
});

export default FertilizerPrescriptionScreen;
