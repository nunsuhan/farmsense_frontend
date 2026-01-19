import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, ImageBackground } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { WeatherBanner } from './widgets/WeatherBanner';
import { ServiceGrid } from './widgets/ServiceGrid';
import { SensorChips } from './widgets/SensorChips';
import { Card } from '../../components/common/Card';
import { colors, spacing } from '../../theme/colors';
import { useStore } from '../../store/useStore';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Helper for date
const getFormattedDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    return `${month}월 ${date}일 ${day}요일`;
};

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const user = useStore(state => state.user);
    const farmInfo = useStore(state => state.farmInfo);

    // Redirect to onboarding if no farm info
    React.useEffect(() => {
        if (!farmInfo) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'FarmRegistration' }],
            });
        }
    }, [farmInfo, navigation]);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    return (
        <ScreenWrapper backgroundColor={colors.primary}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text variant="body2" color={colors.primaryLight} weight="medium">
                                {getFormattedDate()}
                            </Text>
                            <Text variant="h1" color={colors.surface} style={{ marginTop: 4 }}>
                                {user?.name || '농장주'}님, 반가워요! 👋
                            </Text>
                        </View>
                        <View style={styles.profileIcon}>
                            <Text style={{ fontSize: 20 }}>🧑‍🌾</Text>
                        </View>
                    </View>

                    {/* Weather Widget In Header Area */}
                    <View style={{ marginTop: spacing.l }}>
                        <WeatherBanner />
                    </View>
                </View>

                {/* 2. Main Content Board */}
                <View style={styles.boardContainer}>
                    {/* Sensor Chips */}
                    <View style={{ marginTop: spacing.m }}>
                        <SensorChips />
                    </View>

                    {/* Core Services */}
                    <View style={{ marginTop: spacing.s }}>
                        <Text variant="h3" style={{ marginBottom: spacing.s }}>주요 서비스</Text>
                        <ServiceGrid />
                    </View>

                    {/* Today's Brief */}
                    <View style={{ marginTop: spacing.s }}>
                        <Text variant="h3" style={{ marginBottom: spacing.s }}>오늘의 요약</Text>
                        <Card style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.m }}>
                            <View style={[styles.briefIcon, { backgroundColor: colors.info + '20' }]}>
                                <MaterialCommunityIcons name="bell-ring-outline" size={24} color={colors.info} />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.m }}>
                                <Text variant="body1" weight="bold">새로운 알림 2건</Text>
                                <Text variant="caption" style={{ marginTop: 2 }}>방제 시기가 도래했습니다. 확인해보세요.</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
                        </Card>

                        <Card style={{ marginTop: spacing.s, flexDirection: 'row', alignItems: 'center', padding: spacing.m }}>
                            <View style={[styles.briefIcon, { backgroundColor: colors.success + '20' }]}>
                                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color={colors.success} />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.m }}>
                                <Text variant="body1" weight="bold">오늘의 할일</Text>
                                <Text variant="caption" style={{ marginTop: 2 }}>포도 곁순 제거 작업 외 2건</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
                        </Card>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 100, // Space for BottomTab
    },
    headerSection: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.l,
        paddingTop: spacing.l,
        paddingBottom: spacing.xxl * 1.5, // Extra space for overlap
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boardContainer: {
        marginTop: -spacing.xxl,
        backgroundColor: colors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: spacing.l,
        minHeight: 800,
    },
    briefIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
