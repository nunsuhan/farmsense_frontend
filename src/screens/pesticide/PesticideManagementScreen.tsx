import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Card } from '../../components/common/Card';
import { colors, spacing } from '../../theme/colors';
import { MOCK_PESTICIDES, SafetyCheck } from './types';

export const PesticideManagementScreen: React.FC = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [history] = useState([
        { id: 'h1', name: '다이센엠-45', date: '2025.12.10', status: '안전' },
        { id: 'h2', name: '스미치온', date: '2025.11.25', status: '주의' },
    ]);

    const filtered = MOCK_PESTICIDES.filter(p => p.name.includes(search));

    const renderSafetyBadge = (level: string) => {
        let color = colors.success;
        let text = '안전';
        if (level === 'warning') { color = colors.warning; text = '주의'; }
        if (level === 'danger') { color = colors.error; text = '금지'; }

        return (
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                <Text variant="caption" color={color} weight="bold">{text}</Text>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" style={{ marginLeft: spacing.m }}>농약 안전 관리 🧪</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchBox}>
                    <MaterialCommunityIcons name="magnify" size={24} color={colors.textSub} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="농약명을 검색해보세요 (예: 다이센엠)"
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                {/* Search Results */}
                {search.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="h3" style={{ marginBottom: spacing.m }}>검색 결과</Text>
                        {filtered.length === 0 ? (
                            <Text color={colors.textSub} align="center">검색 결과가 없습니다.</Text>
                        ) : (
                            filtered.map(item => (
                                <Card key={item.id} style={styles.resultCard}>
                                    <View style={styles.cardHeader}>
                                        <Text variant="body1" weight="bold">{item.name}</Text>
                                        {renderSafetyBadge(item.riskLevel)}
                                    </View>
                                    <Text variant="caption" color={colors.textSub}>{item.company} | {item.crop}</Text>

                                    <View style={styles.infoGrid}>
                                        <View style={styles.infoItem}>
                                            <Text variant="caption" color={colors.textSub}>희석배수</Text>
                                            <Text variant="body2" weight="bold">{item.dilution}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text variant="caption" color={colors.textSub}>수확 전</Text>
                                            <Text variant="body2" weight="bold">{item.preHarvestInterval}일 전</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text variant="caption" color={colors.textSub}>최대 사용</Text>
                                            <Text variant="body2" weight="bold">{item.maxCount}회</Text>
                                        </View>
                                    </View>
                                    <Text variant="caption" color={colors.error} style={{ marginTop: 8 }}>
                                        ⚠️ {item.notes}
                                    </Text>
                                </Card>
                            ))
                        )}
                    </View>
                )}

                {/* Recent Usage History */}
                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: spacing.m }}>최근 사용 이력</Text>
                    {history.map((h) => (
                        <Card key={h.id} style={styles.historyCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconBox, { backgroundColor: colors.secondary + '20' }]}>
                                    <MaterialCommunityIcons name="bottle-tonic" size={20} color={colors.secondary} />
                                </View>
                                <View style={{ marginLeft: spacing.m }}>
                                    <Text variant="body1" weight="medium">{h.name}</Text>
                                    <Text variant="caption" color={colors.textSub}>{h.date}</Text>
                                </View>
                            </View>
                            {renderSafetyBadge(h.status === '주의' ? 'warning' : 'safe')}
                        </Card>
                    ))}
                </View>

                {/* PLS Info Card */}
                <Card style={styles.plsCard} variant="flat">
                    <MaterialCommunityIcons name="shield-check" size={32} color={colors.primary} />
                    <View style={{ marginLeft: spacing.m, flex: 1 }}>
                        <Text variant="h3" color={colors.primary}>PLS 제도 준수</Text>
                        <Text variant="caption" color={colors.textSub} style={{ marginTop: 4 }}>
                            등록된 농약만 사용하고, 잔류허용기준을 반드시 지켜주세요. 위반 시 과태료가 부과될 수 있습니다.
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.m,
        paddingBottom: 50,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.m,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.l,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.s,
        fontSize: 16,
        color: colors.text,
    },
    section: {
        marginBottom: spacing.l,
    },
    resultCard: {
        padding: spacing.m,
        marginBottom: spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    infoGrid: {
        flexDirection: 'row',
        marginTop: spacing.m,
        backgroundColor: colors.background,
        padding: spacing.s,
        borderRadius: 8,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    historyCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        marginBottom: spacing.s,
    },
    iconBox: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.l,
        backgroundColor: '#ECFDF5', // Light Green
        marginBottom: spacing.xxl,
    },
});
