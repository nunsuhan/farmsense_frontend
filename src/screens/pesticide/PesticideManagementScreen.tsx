import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Card } from '../../components/common/Card';
import { colors, spacing } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { pesticideApi } from '../../services/pesticideApi';
import { sprayApi, type PesticideInventory, type BarcodeScanResult } from '../../services/sprayApi';
import { pesticideRecommendationApi } from '../../services/pesticideRecommendationApi';
import { useFarmId } from '../../store/useStore';
import type { SafetyCheck } from './types';

export const PesticideManagementScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors: tc } = useTheme();
    const farmId = useFarmId();
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [filtered, setFiltered] = useState<SafetyCheck[]>([]);
    const [history, setHistory] = useState<Array<{ id: string; name: string; date: string; status: string }>>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [inventory, setInventory] = useState<PesticideInventory[]>([]);
    const [showInventory, setShowInventory] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [barcodeResult, setBarcodeResult] = useState<BarcodeScanResult | null>(null);
    const [barcodeLoading, setBarcodeLoading] = useState(false);

    useEffect(() => {
        loadHistory();
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const fid = parseInt(farmId || '0', 10);
            if (!fid) return;
            const data = await sprayApi.getInventory(fid);
            setInventory(data || []);
        } catch {}
    };

    const handleAiRecommend = async () => {
        setAiLoading(true);
        try {
            const fid = farmId || '';
            const result = await pesticideRecommendationApi.getSmartRecommendation(fid);
            setAiAnswer(result.rag_answer || '추천 결과를 가져올 수 없습니다.');
        } catch {
            setAiAnswer('AI 추천 서비스에 연결할 수 없습니다.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleBarcodeScan = async () => {
        if (!barcodeInput.trim()) return;
        setBarcodeLoading(true);
        try {
            const result = await sprayApi.scanBarcode(barcodeInput.trim());
            setBarcodeResult(result);
        } catch {
            setBarcodeResult({ found: false });
        } finally {
            setBarcodeLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const fid = parseInt(farmId || '0', 10);
            if (!fid) { setHistoryLoading(false); return; }
            const data = await sprayApi.getSprayHistory(fid);
            const sessions = data.sessions || [];
            setHistory(sessions.slice(0, 5).map((s, i) => ({
                id: s.id?.toString() || `h${i}`,
                name: s.pesticide_name || '-',
                date: s.started_at?.split('T')[0]?.replace(/-/g, '.') || '-',
                status: s.mrl_status === '부적합' ? '주의' : '안전',
            })));
        } catch {
            // keep empty history
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSearch = async (text: string) => {
        setSearch(text);
        if (text.length < 2) { setFiltered([]); return; }
        try {
            setSearching(true);
            const results = await pesticideApi.searchPesticides('포도', text);
            const items = results.results || results || [];
            setFiltered(items.slice(0, 10).map((item: any, i: number) => ({
                id: item.pesti_code || item.id?.toString() || `p${i}`,
                name: item.brand_name || item.pesticide_name || '-',
                company: item.company_name || item.manufacturer || '-',
                crop: item.crop_name || '포도',
                dilution: item.usage || item.dilution_rate || '-',
                preHarvestInterval: item.phi_days || item.safety_interval || 7,
                maxCount: item.max_applications || 3,
                riskLevel: (item.phi_days || 7) > 30 ? 'warning' as const : 'safe' as const,
                notes: item.target_disease || item.notes || '',
            })));
        } catch {
            setFiltered([]);
        } finally {
            setSearching(false);
        }
    };

    const renderSafetyBadge = (level: string) => {
        let color: string = colors.success;
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
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text.primary} />
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
                        onChangeText={handleSearch}
                        placeholderTextColor={colors.textDisabled}
                    />
                    {searching && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />}
                </View>

                {/* 바코드 스캔 */}
                <View style={styles.barcodeSection}>
                    <View style={styles.barcodeRow}>
                        <MaterialCommunityIcons name="barcode-scan" size={20} color={colors.primary} />
                        <TextInput
                            style={styles.barcodeInput}
                            placeholder="바코드 번호 입력"
                            value={barcodeInput}
                            onChangeText={setBarcodeInput}
                            placeholderTextColor={colors.textDisabled}
                            keyboardType="number-pad"
                            onSubmitEditing={handleBarcodeScan}
                        />
                        <TouchableOpacity
                            style={[styles.barcodeScanBtn, !barcodeInput.trim() && { opacity: 0.4 }]}
                            onPress={handleBarcodeScan}
                            disabled={!barcodeInput.trim() || barcodeLoading}
                        >
                            {barcodeLoading ? (
                                <ActivityIndicator size="small" color={tc.text.white} />
                            ) : (
                                <Text variant="caption" color={tc.text.white} weight="bold">조회</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    {barcodeResult && (
                        <Card style={styles.barcodeResultCard}>
                            {barcodeResult.found && barcodeResult.pesticide ? (
                                <View>
                                    <Text variant="body1" weight="bold">{barcodeResult.pesticide.name}</Text>
                                    <Text variant="caption" color={colors.textSub}>
                                        {barcodeResult.pesticide.manufacturer} | {barcodeResult.pesticide.category}
                                    </Text>
                                    <View style={styles.infoGrid}>
                                        <View style={styles.infoItem}>
                                            <Text variant="caption" color={colors.textSub}>희석배수</Text>
                                            <Text variant="body2" weight="bold">{barcodeResult.pesticide.dilution_rate}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text variant="caption" color={colors.textSub}>안전기간</Text>
                                            <Text variant="body2" weight="bold">{barcodeResult.pesticide.safety_interval}일</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text variant="caption" color={colors.textSub}>PLS</Text>
                                            <Text variant="body2" weight="bold" color={barcodeResult.pesticide.is_pls_registered ? colors.success : colors.error}>
                                                {barcodeResult.pesticide.is_pls_registered ? '등록' : '미등록'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text variant="caption" color={colors.textSub} style={{ marginTop: 6 }}>
                                        대상: {barcodeResult.pesticide.target_pests?.join(', ') || '-'}
                                    </Text>
                                </View>
                            ) : (
                                <Text variant="body2" color={colors.textSub} align="center">해당 바코드의 농약 정보를 찾을 수 없습니다.</Text>
                            )}
                        </Card>
                    )}
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

                {/* AI 농약 추천 */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.aiButton, { backgroundColor: tc.secondary }, aiLoading && { opacity: 0.6 }]}
                        onPress={handleAiRecommend}
                        disabled={aiLoading}
                    >
                        {aiLoading ? (
                            <ActivityIndicator size="small" color={tc.text.white} />
                        ) : (
                            <MaterialCommunityIcons name="robot" size={20} color={tc.text.white} />
                        )}
                        <Text variant="body2" color={tc.text.white} weight="bold" style={{ marginLeft: 8 }}>
                            AI 맞춤 농약 추천
                        </Text>
                    </TouchableOpacity>
                    {aiAnswer && (
                        <Card style={[styles.aiResultCard, { backgroundColor: tc.secondaryLight, borderLeftColor: tc.secondary }]}>
                            <Text variant="caption" color={tc.primary} weight="bold" style={{ marginBottom: 4 }}>AI 추천 결과</Text>
                            <Text variant="body2" color={tc.text.primary} style={{ lineHeight: 20 }}>{aiAnswer}</Text>
                        </Card>
                    )}
                </View>

                {/* 재고 관리 */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.inventoryToggle}
                        onPress={() => setShowInventory(!showInventory)}
                    >
                        <MaterialCommunityIcons name="warehouse" size={20} color={colors.primary} />
                        <Text variant="h3" style={{ marginLeft: 8, flex: 1 }}>농약 재고</Text>
                        <Text variant="caption" color={colors.textSub}>{inventory.length}건</Text>
                        <MaterialCommunityIcons name={showInventory ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSub} />
                    </TouchableOpacity>
                    {showInventory && inventory.map((item, idx) => (
                        <Card key={item.id || idx} style={styles.historyCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                    <MaterialCommunityIcons name="bottle-tonic-outline" size={20} color={colors.primary} />
                                </View>
                                <View style={{ marginLeft: spacing.m, flex: 1 }}>
                                    <Text variant="body1" weight="medium">{item.pesticide_name}</Text>
                                    <Text variant="caption" color={colors.textSub}>
                                        {item.manufacturer} | 잔량: {item.quantity_remaining}{item.unit}
                                    </Text>
                                </View>
                            </View>
                            {item.expiry_date && (
                                <Text variant="caption" color={new Date(item.expiry_date) < new Date() ? colors.error : colors.textSub}>
                                    {item.expiry_date.split('T')[0]}
                                </Text>
                            )}
                        </Card>
                    ))}
                    {showInventory && inventory.length === 0 && (
                        <Text color={colors.textSub} align="center" style={{ paddingVertical: 16 }}>등록된 재고가 없습니다.</Text>
                    )}
                </View>

                {/* 빠른 살포 기록 */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.aiButton, { backgroundColor: tc.primaryDark }]}
                        onPress={async () => {
                            if (!search.trim() && filtered.length === 0) {
                                Alert.alert('알림', '먼저 농약을 검색하거나 바코드를 스캔해주세요.');
                                return;
                            }
                            const target = barcodeResult?.found && barcodeResult.pesticide
                                ? barcodeResult.pesticide
                                : filtered[0];
                            if (!target) {
                                Alert.alert('알림', '기록할 농약을 선택해주세요.');
                                return;
                            }
                            try {
                                const name = 'brand_name' in target ? String(target.brand_name || '') : String(target.name || '');
                                await sprayApi.quickRecord({
                                    farm_id: parseInt(farmId || '0', 10),
                                    pesticide_name: name,
                                    target_disease: ('target_pests' in target ? target.target_pests?.[0] : target.notes) || '',
                                    dilution_rate: ('dilution_rate' in target ? String(target.dilution_rate || '') : String(target.dilution || '')),
                                    spray_volume_liters: 0,
                                    spray_date: new Date().toISOString().slice(0, 10),
                                });
                                Alert.alert('저장 완료', '살포 기록이 저장되었습니다.');
                                loadHistory();
                            } catch {
                                Alert.alert('오류', '살포 기록 저장에 실패했습니다.');
                            }
                        }}
                    >
                        <MaterialCommunityIcons name="spray" size={20} color={tc.text.white} />
                        <Text variant="body2" color={tc.text.white} weight="bold" style={{ marginLeft: 8 }}>
                            빠른 살포 기록
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* PLS Info Card */}
                <Card style={[styles.plsCard, { backgroundColor: tc.primaryLight }]}>
                    <MaterialCommunityIcons name="shield-check" size={32} color={tc.primary} />
                    <View style={{ marginLeft: spacing.m, flex: 1 }}>
                        <Text variant="h3" color={tc.primary}>PLS 제도 준수</Text>
                        <Text variant="caption" color={tc.text.secondary} style={{ marginTop: 4 }}>
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
        color: colors.text.primary,
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
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: spacing.m,
    },
    aiResultCard: {
        padding: spacing.m,
        backgroundColor: '#F5F3FF',
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6',
    },
    inventoryToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        marginBottom: spacing.s,
    },
    plsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.l,
        backgroundColor: '#ECFDF5',
        marginBottom: spacing.xxl,
    },
    barcodeSection: {
        marginBottom: spacing.l,
    },
    barcodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: spacing.m,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
    },
    barcodeInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text.primary,
    },
    barcodeScanBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    barcodeResultCard: {
        padding: spacing.m,
        marginTop: spacing.s,
    },
});
