import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { pesticideApi } from '../../services/pesticideApi';
import { Ionicons } from '@expo/vector-icons';

const PrescriptionGuideScreen = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setHasSearched(true);
        try {
            // Searching by disease name generally
            const res = await pesticideApi.searchPesticides(undefined, query);
            if (res && res.results) {
                setResults(res.results);
            } else if (Array.isArray(res)) {
                setResults(res);
            } else {
                setResults([]);
            }
        } catch (e) {
            console.error(e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.pesticideName}>{item.pesticide_name}</Text>
                <View style={styles.brandBadge}>
                    <Text style={styles.brandText}>{item.brand_name || '상표명 없음'}</Text>
                </View>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.label}>대상 병해:</Text>
                <Text style={styles.value}>{item.target_disease || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.label}>작물:</Text>
                <Text style={styles.value}>{item.crop_name || '-'}</Text>
            </View>
            <View style={styles.safetyBox}>
                <Text style={styles.safetyText}>안전 사용: 수확 {item.safe_use_std || '-'}일 전까지</Text>
            </View>
        </View>
    );

    return (
        <ScreenWrapper title="처방 가이드 (농약 검색)" showBack={true}>
            <View style={styles.container}>
                <View style={styles.searchBox}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.input}
                            placeholder="병해명 또는 약제명을 입력하세요 (예: 탄저병)"
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Text style={styles.searchBtnText}>검색</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={results}
                        renderItem={renderItem}
                        keyExtractor={(item, idx) => idx.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name={hasSearched ? "alert-circle-outline" : "book-outline"} size={48} color="#D1D5DB" />
                                <Text style={styles.emptyText}>
                                    {hasSearched ? "검색 결과가 없습니다." : "병해명으로 농약을 검색해보세요.\n(예: 탄저병, 노균병)"}
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    searchBox: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E5E7EB' },
    inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, height: 44 },
    input: { flex: 1, marginLeft: 8, fontSize: 16 },
    searchBtn: { marginLeft: 12, justifyContent: 'center', backgroundColor: '#10B981', paddingHorizontal: 20, borderRadius: 8 },
    searchBtnText: { color: 'white', fontWeight: 'bold' },

    list: { padding: 16 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    pesticideName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    brandBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    brandText: { fontSize: 12, color: '#059669', fontWeight: 'bold' },

    detailRow: { flexDirection: 'row', marginBottom: 4 },
    label: { width: 70, fontSize: 13, color: '#6B7280' },
    value: { flex: 1, fontSize: 13, color: '#374151' },

    safetyBox: { marginTop: 12, backgroundColor: '#FEF2F2', padding: 8, borderRadius: 4 },
    safetyText: { fontSize: 12, color: '#DC2626', textAlign: 'center' },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }
});

export default PrescriptionGuideScreen;
