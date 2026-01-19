import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Card } from '../../components/common/Card';
import { colors, shadows, spacing } from '../../theme/colors';
import { FarmingLogEntry, CATEGORY_LABELS } from './types';

// Calendar Config (Korean)
LocaleConfig.locales['kr'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

// Mock Data
const MOCK_LOGS: FarmingLogEntry[] = [
    {
        id: '1', date: '2025-12-15', time: '07:30', category: 'irrigation',
        title: '오전 점적 관수', content: '1구역, 2구역 30분씩 관수 진행함. 수압 정상.',
        weather: { condition: '맑음', temp: 24 },
        images: [], materials: [], workers: ['김철수']
    },
    {
        id: '2', date: '2025-12-15', time: '14:00', category: 'pest_control',
        title: '노균병 예방 방제', content: '어제 비가 와서 예방 차원에서 다이센엠 살포.',
        weather: { condition: '흐림', temp: 22 },
        images: [{ id: 'img1', uri: 'https://via.placeholder.com/150' }],
        materials: [{ id: 'm1', name: '다이센엠-45', amount: 500, unit: 'g' }],
        workers: ['김농부']
    },
];

export const FarmingLogScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [selectedDate, setSelectedDate] = useState('2025-12-15');

    // Filter logs by date
    const filteredLogs = MOCK_LOGS.filter(log => log.date === selectedDate);

    // Render Log Item
    const renderLogItem = ({ item }: { item: FarmingLogEntry }) => {
        const cat = CATEGORY_LABELS[item.category];

        return (
            <Card style={styles.logCard} onPress={() => navigation.navigate('LogWrite', { logId: item.id })}>
                <View style={styles.logHeader}>
                    <View style={[styles.catBadge, { backgroundColor: cat.color + '20' }]}>
                        <MaterialCommunityIcons name={cat.icon as any} size={16} color={cat.color} />
                        <Text variant="caption" weight="bold" color={cat.color} style={{ marginLeft: 4 }}>{cat.label}</Text>
                    </View>
                    <Text variant="caption" color={colors.textSub}>{item.time}</Text>
                </View>

                <Text variant="h3" style={{ marginTop: 8 }}>{item.title}</Text>
                <Text variant="body2" color={colors.textSub} numberOfLines={2} style={{ marginTop: 4 }}>
                    {item.content}
                </Text>

                {/* Materials & Images Preview */}
                {(item.materials.length > 0 || item.images.length > 0) && (
                    <View style={styles.logFooter}>
                        {item.materials.length > 0 && (
                            <View style={styles.footerTag}>
                                <MaterialCommunityIcons name="bottle-tonic-plus-outline" size={14} color={colors.textSub} />
                                <Text variant="caption" style={{ marginLeft: 4 }}>
                                    {item.materials[0].name} 외 {item.materials.length - 1}건
                                </Text>
                            </View>
                        )}
                        {item.images.length > 0 && (
                            <View style={styles.footerTag}>
                                <MaterialCommunityIcons name="image-outline" size={14} color={colors.textSub} />
                                <Text variant="caption" style={{ marginLeft: 4 }}>사진 {item.images.length}장</Text>
                            </View>
                        )}
                    </View>
                )}
            </Card>
        );
    };

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }} showMenu={true}>
            {/* 1. Header removed as it is in ScreenWrapper now or we keep it? 
               Wait, ScreenWrapper header has menu button. 
               FarmingLogScreen has its own custom header "영농일지".
               If I add showMenu=true, ScreenWrapper will show its header.
               I should probably use ScreenWrapper's title "영농일지" and remove custom header to be consistent.
            */}
            <View style={styles.actionBar}>
                <Text variant="h2">영농일지 📝</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('LogWrite', { date: selectedDate })}
                >
                    <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                    <Text variant="button" color="#FFF" style={{ marginLeft: 4 }}>기록하기</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredLogs}
                renderItem={renderLogItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        <Card style={styles.calendarCard}>
                            <Calendar
                                current={selectedDate}
                                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: { selected: true, selectedColor: colors.primary },
                                    '2025-12-15': { marked: true, dotColor: colors.primary },
                                    '2025-12-12': { marked: true, dotColor: colors.secondary },
                                }}
                                theme={{
                                    todayTextColor: colors.primary,
                                    arrowColor: colors.primary,
                                    textDayFontWeight: '500',
                                    textMonthFontWeight: 'bold',
                                    textDayHeaderFontWeight: 'bold',
                                }}
                            />
                        </Card>
                        <Text variant="h3" style={styles.sectionTitle}>
                            {selectedDate}의 기록 ({filteredLogs.length})
                        </Text>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 40, marginBottom: 10 }}>🍃</Text>
                        <Text variant="body1" color={colors.textSub}>작성된 영농일지가 없습니다.</Text>
                        <Text variant="caption" color={colors.textDisabled}>오늘의 작업을 기록해보세요!</Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    actionBar: {
        padding: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        paddingHorizontal: spacing.m,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        ...shadows.small,
    },
    listContent: {
        paddingHorizontal: spacing.m,
        paddingBottom: 100,
    },
    calendarCard: {
        marginBottom: spacing.l,
        padding: 0, // Calendar has its own padding
    },
    sectionTitle: {
        marginBottom: spacing.m,
    },
    logCard: {
        marginBottom: spacing.m,
        padding: spacing.m,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    catBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    logFooter: {
        marginTop: spacing.m,
        paddingTop: spacing.s,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
    },
    footerTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.m,
        backgroundColor: colors.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 40,
    },
});
