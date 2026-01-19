import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ScreenWrapper from '../components/common/ScreenWrapper';
import { Text } from '../components/common/Text';
import { Card } from '../components/common/Card';
import { colors } from '../theme/colors';

const YearlyReportScreen = () => {
    // Stage Data
    const stages = [
        { name: '휴면기', score: 82, grade: 'A', width: '82%' },
        { name: '발아기', score: 75, grade: 'C', width: '75%' },
        { name: '개화기', score: 80, grade: 'B', width: '80%' },
        { name: '착과기', score: 88, grade: 'A', width: '88%', current: true },
        { name: '착색기', score: 72, grade: 'C', width: '72%' },
        { name: '수확기', score: 78, grade: 'B', width: '78%' },
    ];

    return (
        <ScreenWrapper title="연간 성적표" showBack>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text variant="h2">📈 2025년 연간 성적표</Text>
                </View>

                {/* Summary Card */}
                <Card style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text variant="caption" color="#6B7280">종합 점수</Text>
                            <Text variant="h1" color="#15803D">78점</Text>
                            <Text variant="caption" color="#15803D" weight="bold">B등급 (양호)</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryItem}>
                            <Text variant="caption" color="#6B7280">종합 순위</Text>
                            <Text variant="h1" color="#15803D">Top 25%</Text>
                            <Text variant="caption" color="#15803D">상위권 도달 가능</Text>
                        </View>
                    </View>
                </Card>

                {/* Stage Progress */}
                <Card style={styles.card}>
                    <Text variant="h3" style={{ marginBottom: 16 }}>📊 생육단계별 성적</Text>

                    {stages.map((stage, index) => (
                        <View key={index} style={styles.stageRow}>
                            <View style={styles.labelBox}>
                                <Text weight={stage.current ? "bold" : "regular"}>
                                    {stage.name} {stage.current && "⭐"}
                                </Text>
                            </View>
                            <View style={styles.barArea}>
                                <View style={styles.barBg}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            { width: stage.width as any, backgroundColor: getGradeColor(stage.grade) }
                                        ] as any}
                                    />
                                </View>
                            </View>
                            <View style={styles.scoreBox}>
                                <Text weight="bold" color={getGradeColor(stage.grade)}>
                                    {stage.score}점 ({stage.grade})
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* Analysis */}
                <Card style={styles.card}>
                    <Text variant="h3" style={{ marginBottom: 12 }}>📝 분석 요약</Text>
                    <View style={styles.bulletItem}>
                        <Text variant="body1">• <Text weight="bold">착과기 관리 우수</Text>: 적절한 온습도 관리로 생육이 매우 좋습니다. (상위 10%)</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text variant="body1">• <Text weight="bold" color="#EF4444">착색기 주의</Text>: 작년 데이터 기준, 착색기 온도 관리가 미흡했습니다. 올해는 환기에 더 신경 써주세요.</Text>
                    </View>
                </Card>

            </ScrollView>
        </ScreenWrapper>
    );
};

const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'A': return '#10B981'; // Green
        case 'B': return '#F59E0B'; // Amber
        case 'C': return '#EF4444'; // Red
        default: return '#9CA3AF';
    }
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: { marginBottom: 20 },
    card: { marginBottom: 16, padding: 16 },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    summaryItem: { alignItems: 'center' },
    divider: { width: 1, height: 40, backgroundColor: '#D1D5DB' },

    stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    labelBox: { width: 70 },
    barArea: { flex: 1, marginHorizontal: 8 },
    barBg: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 5 },
    scoreBox: { width: 80, alignItems: 'flex-end' },

    bulletItem: { marginBottom: 8 }
});

export default YearlyReportScreen;
