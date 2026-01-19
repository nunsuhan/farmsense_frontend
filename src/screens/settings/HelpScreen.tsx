// src/screens/settings/HelpScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager, Linking, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { faqData, FAQItem, FAQCategory } from '../../data/faqData';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ item, expanded, onPress }: { item: FAQItem, expanded: boolean, onPress: () => void }) => (
    <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.accordionHeader} onPress={onPress}>
            <Text style={[styles.questionText, expanded && { color: '#10B981', fontWeight: 'bold' }]}>{item.q}</Text>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={expanded ? "#10B981" : "#6B7280"} />
        </TouchableOpacity>
        {expanded && (
            <View style={styles.accordionContent}>
                <Text style={styles.answerText}>{item.a}</Text>
            </View>
        )}
    </View>
);

const HelpScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    // insets removed as ScreenWrapper handles it
    const [search, setSearch] = useState('');
    // Default to 'service' since 'all' is being removed
    const [activeCategory, setActiveCategory] = useState<'all' | string>('service');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredData = useMemo(() => {
        const result: Record<string, FAQCategory> = {};

        Object.entries(faqData).forEach(([key, category]) => {
            if (activeCategory !== 'all' && key !== activeCategory) return;

            const filteredItems = category.items.filter(item =>
                item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredItems.length > 0) {
                result[key] = { ...category, items: filteredItems };
            }
        });

        return result;
    }, [search, activeCategory]);

    return (
        <ScreenWrapper title="도움말" showBack showMenu={true}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="궁금한 내용을 입력하세요..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Chips - Horizontal Scroll */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >

                    {
                        Object.entries(faqData).map(([key, cat]) => {
                            // Skip rendering 'pricing' category in the chips
                            if (key === 'pricing') return null;

                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.categoryChip, activeCategory === key && styles.categoryChipActive]}
                                    onPress={() => setActiveCategory(key)}
                                >
                                    <Ionicons
                                        name={cat.icon}
                                        size={14}
                                        color={activeCategory === key ? "#fff" : "#6B7280"}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[styles.categoryText, activeCategory === key && styles.categoryTextActive]}>{cat.title}</Text>
                                </TouchableOpacity>
                            );
                        })
                    }
                </ScrollView >
            </View >

            <ScrollView style={styles.content}>

                {/* Contact Buttons */}
                <View style={styles.buttonGroup}>

                    {/* Updated to Navigate to Support Screen */}
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Support')}>
                        <Ionicons name="mail-outline" size={24} color="#10B981" />
                        <Text style={styles.actionText}>이메일 문의</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ List */}
                <View style={styles.faqListContainer}>
                    {Object.entries(filteredData).length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                        </View>
                    ) : (
                        Object.entries(filteredData).map(([key, category]) => (
                            <View key={key} style={styles.categorySection}>
                                <View style={styles.categoryHeader}>
                                    <Ionicons name={category.icon} size={20} color="#10B981" />
                                    <Text style={styles.categoryTitle}>{category.title}</Text>
                                    <Text style={styles.countBadge}>{category.items.length}</Text>
                                </View>

                                <View style={styles.accordionGroup}>
                                    {category.items.map((item, i) => {
                                        const itemId = `${key}-${i}`;
                                        return (
                                            <AccordionItem
                                                key={itemId}
                                                item={item}
                                                expanded={expandedIds.includes(itemId)}
                                                onPress={() => toggleExpand(itemId)}
                                            />
                                        );
                                    })}
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Beta Service Notice */}
                <View style={styles.betaNoticeContainer}>
                    <Text style={styles.betaNoticeTitle}>🚧 베타 서비스 안내</Text>
                    <Text style={styles.betaNoticeText}>
                        현재 FarmSense는 베타 서비스 기간입니다. 모든 기능을 무료로 이용하실 수 있으며, 사용자 여러분의 소중한 피드백을 통해 더 정확하고 편리한 서비스로 발전하고 있습니다.{'\n\n'}
                        오진이나 불편 사항은 [설정 {'>'} 문의하기]를 통해 제보해 주시면 서비스 개선에 큰 도움이 됩니다.
                    </Text>
                </View>

                {/* Footer Section - Updated to Navigate to Support */}
                <View style={styles.supportFooter}>
                    <Text style={styles.supportTitle}>찾으시는 답변이 없나요?</Text>
                    <Text style={styles.supportSubtitle}>직접 문의해주시면 빠르게 답변드리겠습니다.</Text>
                    <TouchableOpacity
                        style={styles.supportButton}
                        onPress={() => navigation.navigate('Support')}
                    >
                        <Text style={styles.supportButtonText}>문의하기</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },

    // Search
    searchContainer: { padding: 16, backgroundColor: '#fff', paddingBottom: 8 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#374151' },

    // Categories
    categoryScroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, alignItems: 'center' },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
    categoryText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    categoryTextActive: { color: '#fff', fontWeight: 'bold' },

    content: { flex: 1 },

    // Buttons
    buttonGroup: { flexDirection: 'row', padding: 16, gap: 12 },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    actionText: { marginTop: 6, fontSize: 13, fontWeight: '600', color: '#374151' },

    // Lists
    faqListContainer: { paddingHorizontal: 16 },
    categorySection: { marginBottom: 24 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    categoryTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginLeft: 8, marginRight: 6 },
    countBadge: { fontSize: 13, color: '#6B7280', backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },

    accordionGroup: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
    accordionContainer: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    questionText: { fontSize: 15, fontWeight: '500', color: '#374151', flex: 1, marginRight: 8, lineHeight: 22 },
    accordionContent: { padding: 16, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    answerText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

    // Empty
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 15 },

    // Beta Notice
    betaNoticeContainer: { margin: 16, padding: 20, backgroundColor: '#FEF3C7', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#D97706' },
    betaNoticeTitle: { fontSize: 16, fontWeight: 'bold', color: '#92400E', marginBottom: 8 },
    betaNoticeText: { fontSize: 14, color: '#92400E', lineHeight: 22 },

    // Support Footer
    supportFooter: { margin: 16, padding: 24, backgroundColor: '#ECFDF5', borderRadius: 16, alignItems: 'center' },
    supportTitle: { fontSize: 16, fontWeight: 'bold', color: '#065F46', marginBottom: 4 },
    supportSubtitle: { fontSize: 13, color: '#047857', marginBottom: 16 },
    supportButton: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
    supportButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default HelpScreen;
