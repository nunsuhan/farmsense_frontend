import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/common/ScreenWrapper';
import { Text } from '../components/common/Text';
import { Card } from '../components/common/Card';
import { colors } from '../theme/colors';

const BenchmarkScreen = () => {
    // Mock Data for MVP
    const [loading, setLoading] = useState(false);

    // Simulate API Load
    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    }, []);

    const MyScore = 80;
    const Top10Score = 95;
    const AverageScore = 65;

    const MyRank = 8;
    const TotalFarms = 64;

    const getBarWidth = (score: number) => {
        return `${score}%` as any;
    };

    return (
        <ScreenWrapper title="최우수 농가 비교" showBack>
            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <View style={styles.header}>
                            <Text variant="h2">🏆 최우수 농가 벤치마킹</Text>
                            <View style={styles.badge}>
                                <Text color="#FFF" weight="bold">현재: 🌸 착과기 (6-7월)</Text>
                            </View>
                        </View>

                        {/* Ranking Card */}
                        <Card style={styles.card}>
                            <Text variant="h3" style={{ marginBottom: 20 }}>📊 내 농장 vs 최우수 농가</Text>

                            {/* Graph Rows */}
                            <View style={styles.graphRow}>
                                <View style={styles.labelContainer}><Text weight="bold">TOP 10%</Text></View>
                                <View style={styles.barContainer}>
                                    <View style={[styles.bar, { width: getBarWidth(Top10Score), backgroundColor: '#10B981' } as any]} />
                                    <Text style={styles.scoreText}>{Top10Score}점</Text>
                                </View>
                            </View>

                            <View style={styles.graphRow}>
                                <View style={styles.labelContainer}><Text weight="bold" color="#3B82F6">내 점수</Text></View>
                                <View style={styles.barContainer}>
                                    <View style={[styles.bar, { width: getBarWidth(MyScore), backgroundColor: '#3B82F6' } as any]} />
                                    <Text style={styles.scoreText}>{MyScore}점</Text>
                                </View>
                            </View>

                            <View style={styles.graphRow}>
                                <View style={styles.labelContainer}><Text>전체 평균</Text></View>
                                <View style={styles.barContainer}>
                                    <View style={[styles.bar, { width: getBarWidth(AverageScore), backgroundColor: '#9CA3AF' } as any]} />
                                    <Text style={styles.scoreText}>{AverageScore}점</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.rankInfo}>
                                <Text variant="h3" color="#3B82F6">내 순위: {MyRank}위</Text>
                                <Text color="#6B7280"> / {TotalFarms}농가 (상위 {Math.round((MyRank / TotalFarms) * 100)}%)</Text>
                            </View>
                        </Card>

                        {/* Environment Comparison Table */}
                        <Card style={styles.card}>
                            <Text variant="h3" style={{ marginBottom: 16 }}>🌡️ 환경 비교 (평균)</Text>
                            <View style={styles.table}>
                                <View style={[styles.row, styles.headerRow]}>
                                    <Text style={[styles.cell, styles.headerCell]}>항목</Text>
                                    <Text style={[styles.cell, styles.headerCell]}>내 농장</Text>
                                    <Text style={[styles.cell, styles.headerCell]}>TOP 10%</Text>
                                    <Text style={[styles.cell, styles.headerCell]}>GAP</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.cell}>평균온도</Text>
                                    <Text style={styles.cell}>25.3°</Text>
                                    <Text style={styles.cell}>26.0°</Text>
                                    <Text style={[styles.cell, { color: '#EF4444' }]}>-0.7°</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.cell}>평균습도</Text>
                                    <Text style={styles.cell}>68%</Text>
                                    <Text style={styles.cell}>70%</Text>
                                    <Text style={[styles.cell, { color: '#EF4444' }]}>-2%</Text>
                                </View>
                            </View>
                        </Card>

                        {/* Recommendations */}
                        <Card style={styles.card}>
                            <Text variant="h3" style={{ marginBottom: 16 }}>💡 개선 권장사항</Text>
                            <View style={styles.recomItem}>
                                <Text variant="body1">FAILED</Text>
                                <Text variant="body2">• 온도를 0.7°C 높이면 상위권 진입이 가능합니다.</Text>
                            </View>
                            <View style={styles.recomItem}>
                                <Text variant="body2">• 야간 환기 시간을 1시간 줄여 습도를 조금 더 유지하세요.</Text>
                            </View>
                        </Card>
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: { marginBottom: 20 },
    badge: { alignSelf: 'flex-start', backgroundColor: '#F472B6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
    card: { marginBottom: 16, padding: 16 },

    // Graph
    graphRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    labelContainer: { width: 70 },
    barContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    bar: { height: 12, borderRadius: 6, marginRight: 8 },
    scoreText: { fontSize: 12, color: '#4B5563', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
    rankInfo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },

    // Table
    table: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
    row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerRow: { backgroundColor: '#F9FAFB' },
    cell: { flex: 1, textAlign: 'center', fontSize: 13 } as any,
    headerCell: { fontWeight: 'bold', color: '#374151' },

    // Recommendation
    recomItem: { marginBottom: 8 }
});

export default BenchmarkScreen;
