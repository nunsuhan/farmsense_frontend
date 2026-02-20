import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { dssApi } from '../../services/dssApi';
import { irrigationApi, WaterBalanceData, IrrigationRecommendation } from '../../services/irrigationApi';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { tokens } from '../../design-system/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useFarmInfo } from '../../store/useStore';

// Define the navigation prop type
type IrrigationDashboardNavigationProp = NavigationProp<any>;
type IrrigationDashboardRouteProp = RouteProp<any, any>;

const IrrigationDashboardScreen = () => {
    const navigation = useNavigation<IrrigationDashboardNavigationProp>();
    const route = useRoute<IrrigationDashboardRouteProp>();
    const { colors: tc } = useTheme();
    const farmInfo = useFarmInfo();
    const [cwsiData, setCwsiData] = useState<any>(null);
    const [vpdData, setVpdData] = useState<any>(null);
    const [waterBalance, setWaterBalance] = useState<WaterBalanceData | null>(null);
    const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
    const [loadingWB, setLoadingWB] = useState(true);
    const [savingLog, setSavingLog] = useState(false);

    useEffect(() => {
        if (route.params?.cwsiResult) setCwsiData(route.params.cwsiResult);
        if (route.params?.vpdResult) setVpdData(route.params.vpdResult);
    }, [route.params]);

    // 물수지 + 관개 권고 자동 로드
    useEffect(() => {
        const loadWaterData = async () => {
            const farmId = Number(farmInfo?.id);
            if (!farmId || isNaN(farmId)) { setLoadingWB(false); return; }
            try {
                const [wb, rec] = await Promise.allSettled([
                    irrigationApi.getWaterBalance(farmId),
                    irrigationApi.getRecommendation(farmId),
                ]);
                if (wb.status === 'fulfilled') setWaterBalance(wb.value);
                if (rec.status === 'fulfilled') setRecommendation(rec.value);
            } catch (e: any) {
                if (__DEV__) console.warn('[관개] 물수지 로드 실패:', e?.message);
            } finally {
                setLoadingWB(false);
            }
        };
        loadWaterData();
    }, [farmInfo?.id]);

    const getCwsiColor = (stressLevel: string) => {
        switch (stressLevel) {
            case 'none': return tc.success;
            case 'mild': return tc.warning;
            case 'moderate': return tc.error;
            case 'severe': return '#DC2626';
            case 'critical': return '#7F1D1D';
            default: return tc.text.disabled;
        }
    };

    const CustomProgressBar = ({ progress, color }: { progress: number, color: string }) => (
        <View style={[styles.progressBarContainer, { backgroundColor: tc.border }]}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
    );

    // Soil moisture: 0–100 %, color-coded red/yellow/green
    const getSoilMoistureColor = (pct: number): string => {
        if (pct < 30) return tc.error;
        if (pct < 60) return tc.warning;
        return tc.success;
    };

    const SoilMoistureGauge = ({ pct }: { pct: number }) => {
        const color = getSoilMoistureColor(pct);
        const label = pct < 30 ? '부족' : pct < 60 ? '보통' : '충분';
        return (
            <View style={styles.gaugeWrapper}>
                <View style={styles.gaugeRow}>
                    <Text style={[styles.gaugeLabel, { color: tc.text.secondary }]}>토양 수분</Text>
                    <Text style={[styles.gaugeValue, { color }]}>{pct.toFixed(0)}%</Text>
                </View>
                <View style={[styles.gaugeTrack, { backgroundColor: tc.border }]}>
                    {/* coloured zones */}
                    <View style={[styles.gaugeZone, { flex: 30, backgroundColor: '#FEE2E2' }]} />
                    <View style={[styles.gaugeZone, { flex: 30, backgroundColor: '#FEF3C7' }]} />
                    <View style={[styles.gaugeZone, { flex: 40, backgroundColor: '#D1FAE5' }]} />
                    {/* fill overlay */}
                    <View style={[styles.gaugeFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
                    {/* thumb marker */}
                    <View style={[styles.gaugeThumb, { left: `${Math.min(pct, 100)}%` as any, borderColor: color, backgroundColor: tc.surface }]} />
                </View>
                <View style={styles.gaugeTickRow}>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>0%</Text>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>30%</Text>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>60%</Text>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>100%</Text>
                </View>
                <View style={[styles.gaugeBadge, { backgroundColor: color + '22', borderColor: color }]}>
                    <Text style={[styles.gaugeBadgeText, { color }]}>{label}</Text>
                </View>
            </View>
        );
    };

    // Urgency badge for irrigation recommendation
    const getUrgencyStyle = (urgency: string): { bg: string; border: string; text: string; label: string } => {
        const u = urgency?.toLowerCase() ?? '';
        if (u.includes('urgent') || u.includes('긴급') || u.includes('즉시')) {
            return { bg: '#FEE2E2', border: tc.error, text: '#DC2626', label: '긴급' };
        }
        if (u.includes('moderate') || u.includes('보통') || u.includes('moderate')) {
            return { bg: '#FEF3C7', border: tc.warning, text: '#B45309', label: '보통' };
        }
        return { bg: '#D1FAE5', border: tc.success, text: '#047857', label: '낮음' };
    };

    const UrgencyIndicator = ({ urgency }: { urgency: string }) => {
        const s = getUrgencyStyle(urgency);
        return (
            <View style={[styles.urgencyBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                <View style={[styles.urgencyDot, { backgroundColor: s.border }]} />
                <Text style={[styles.urgencyText, { color: s.text }]}>{s.label}</Text>
            </View>
        );
    };

    // Water balance bar: positive = blue, negative = red
    const WaterBalanceBar = ({ balance }: { balance: number }) => {
        const isPositive = balance >= 0;
        const absMax = 50; // mm scale for display
        const fillPct = Math.min(Math.abs(balance) / absMax, 1) * 50; // 0–50% of bar from centre
        return (
            <View style={styles.wbWrapper}>
                <View style={styles.wbRow}>
                    <Text style={[styles.gaugeLabel, { color: tc.text.secondary }]}>수분 수지</Text>
                    <Text style={[styles.gaugeValue, { color: isPositive ? tc.info : tc.error }]}>
                        {isPositive ? '+' : ''}{balance.toFixed(1)} mm
                    </Text>
                </View>
                <View style={[styles.wbTrack, { backgroundColor: tc.border }]}>
                    {/* centre zero line */}
                    <View style={[styles.wbZeroLine, { backgroundColor: tc.text.disabled }]} />
                    {/* fill: left side = negative (red), right side = positive (blue) */}
                    {isPositive ? (
                        <View style={[styles.wbFill, {
                            left: '50%',
                            width: `${fillPct}%` as any,
                            backgroundColor: tc.info,
                        }]} />
                    ) : (
                        <View style={[styles.wbFill, {
                            right: '50%',
                            width: `${fillPct}%` as any,
                            backgroundColor: tc.error,
                        }]} />
                    )}
                </View>
                <View style={styles.wbTickRow}>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>부족</Text>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>±0</Text>
                    <Text style={[styles.gaugeTick, { color: tc.text.disabled }]}>충분</Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
            {/* CWSI 상태 카드 */}
            <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>💧 수분 스트레스 상태</Text>

                {cwsiData ? (
                    <View style={styles.cwsiDisplay}>
                        <Text style={[styles.cwsiValue, { color: tc.text.primary }]}>CWSI: {cwsiData.cwsi.toFixed(2)}</Text>
                        <CustomProgressBar
                            progress={Math.min(cwsiData.cwsi, 1.0)}
                            color={getCwsiColor(cwsiData.stress_level)}
                        />
                        <Text style={[styles.stressLevel, { color: tc.text.secondary }]}>{cwsiData.stress_level_korean}</Text>
                        <Text style={[styles.confidence, { color: tc.text.disabled }]}>신뢰도: {(cwsiData.confidence * 100).toFixed(0)}%</Text>
                    </View>
                ) : (
                    <Text style={[styles.noDataText, { color: tc.text.disabled }]}>수관 온도 측정이 필요합니다</Text>
                )}
            </View>

            {/* VPD 상태 카드 */}
            <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>🌡️ VPD 상태</Text>

                {vpdData ? (
                    <View style={styles.vpdDisplay}>
                        <Text style={[styles.vpdValue, { color: tc.text.primary }]}>{vpdData.vpd.toFixed(2)} kPa</Text>
                        <Text style={[styles.vpdStatus, { color: getCwsiColor(vpdData.level) }]}>
                            {vpdData.status_korean}
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.noDataText, { color: tc.text.disabled }]}>센서 데이터 로딩 중...</Text>
                )}
            </View>

            {/* 관개 권고 카드 */}
            <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>🚰 관개 권고</Text>
                <Text style={[styles.recommendation, { color: tc.text.secondary }]}>
                    {cwsiData?.recommendation || '수관 온도 측정 후 맞춤 권고를 제공합니다'}
                </Text>

                {cwsiData && (
                    <View style={[styles.detailsContainer, { backgroundColor: tc.background }]}>
                        <Text style={[styles.detailText, { color: tc.text.secondary }]}>측정 온도: {cwsiData.t_canopy}°C</Text>
                        <Text style={[styles.detailText, { color: tc.text.secondary }]}>대기 온도: {cwsiData.t_air}°C</Text>
                        <Text style={[styles.detailText, { color: tc.text.secondary }]}>온도차: {cwsiData.delta_t.toFixed(1)}°C</Text>
                    </View>
                )}
            </View>

            {/* 물수지 현황 카드 */}
            <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>💦 물수지 현황</Text>
                {loadingWB ? (
                    <ActivityIndicator size="small" color={tc.info} style={{ paddingVertical: 20 }} />
                ) : waterBalance ? (
                    <View>
                        {/* Soil moisture gauge — only shown when soil_moisture is available */}
                        {waterBalance.soil_moisture != null && (
                            <SoilMoistureGauge pct={waterBalance.soil_moisture} />
                        )}

                        {/* Water balance visual bar */}
                        <WaterBalanceBar balance={waterBalance.current_balance} />

                        <View style={[styles.detailsContainer, { backgroundColor: tc.background, marginTop: 12 }]}>
                            <Text style={[styles.detailText, { color: tc.text.secondary }]}>증발산량: {waterBalance.evapotranspiration.toFixed(1)} mm</Text>
                            <Text style={[styles.detailText, { color: tc.text.secondary }]}>강수량: {waterBalance.rainfall.toFixed(1)} mm</Text>
                            <Text style={[styles.detailText, { color: tc.text.secondary }]}>관개 합계: {waterBalance.irrigation_total.toFixed(1)} mm</Text>
                        </View>
                        <Text style={[styles.recommendation, { color: tc.text.secondary, marginTop: 8 }]}>
                            {waterBalance.recommendation}
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.noDataText, { color: tc.text.disabled }]}>물수지 데이터를 불러올 수 없습니다</Text>
                )}
            </View>

            {/* 관개 권고 (API 기반) */}
            {recommendation && (
                <View style={[
                    styles.card,
                    { backgroundColor: tc.surface },
                    recommendation.should_irrigate
                        ? { borderLeftWidth: 4, borderLeftColor: tc.error }
                        : { borderLeftWidth: 4, borderLeftColor: tc.success },
                ]}>
                    <Text style={[styles.cardTitle, { color: tc.text.primary }]}>🚿 관개 권고 (자동)</Text>

                    {/* Urgency indicator row */}
                    <View style={styles.recHeaderRow}>
                        <Text style={[styles.stressLevel, {
                            color: recommendation.should_irrigate ? tc.error : tc.success,
                            flex: 1,
                        }]}>
                            {recommendation.should_irrigate ? '💧 관개 필요' : '✅ 관개 불필요'}
                        </Text>
                        {recommendation.should_irrigate && (
                            <UrgencyIndicator urgency={recommendation.urgency} />
                        )}
                    </View>

                    {recommendation.amount_mm && (
                        <View style={styles.amountRow}>
                            <View style={[styles.amountBadge, { backgroundColor: tc.info + '15', borderColor: tc.info + '40' }]}>
                                <Text style={[styles.amountLabel, { color: tc.text.secondary }]}>권장량</Text>
                                <Text style={[styles.amountValue, { color: tc.info }]}>{recommendation.amount_mm} mm</Text>
                            </View>
                            <View style={[styles.amountBadge, { backgroundColor: tc.info + '15', borderColor: tc.info + '40' }]}>
                                <Text style={[styles.amountLabel, { color: tc.text.secondary }]}>관개 시간</Text>
                                <Text style={[styles.amountValue, { color: tc.info }]}>{recommendation.duration_min} 분</Text>
                            </View>
                        </View>
                    )}
                    <Text style={[styles.recommendation, { color: tc.text.secondary, marginTop: 4 }]}>{recommendation.reason}</Text>
                </View>
            )}

            {/* 관개 기록 저장 버튼 */}
            {recommendation?.should_irrigate && recommendation.amount_mm && (
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: tc.info + '15', borderWidth: 1, borderColor: tc.info, alignItems: 'center', paddingVertical: 14, opacity: savingLog ? 0.6 : 1 }]}
                    disabled={savingLog}
                    onPress={async () => {
                        const farmId = Number(farmInfo?.id);
                        if (!farmId || isNaN(farmId)) { Alert.alert('알림', '농장 정보를 먼저 설정해주세요.'); return; }
                        setSavingLog(true);
                        try {
                            await irrigationApi.saveIrrigationLog(farmId, {
                                date: new Date().toISOString().slice(0, 10),
                                amount_mm: recommendation.amount_mm!,
                                duration_min: recommendation.duration_min || 0,
                                method: 'drip',
                                memo: `DSS 권고 | CWSI: ${cwsiData?.cwsi?.toFixed(2) ?? '-'} | VPD: ${vpdData?.vpd?.toFixed(2) ?? '-'}`,
                            });
                            Alert.alert('저장 완료', '관개 기록이 저장되었습니다.');
                        } catch (e: any) {
                            Alert.alert('오류', '관개 기록 저장에 실패했습니다.');
                        } finally {
                            setSavingLog(false);
                        }
                    }}
                >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: tc.info }}>{savingLog ? '저장 중...' : '💾 관개 기록 저장'}</Text>
                </TouchableOpacity>
            )}

            {/* 측정 버튼들 */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: tc.info }]}
                    onPress={() => (navigation as any).navigate('ThermalMeasurement')}
                >
                    <Text style={[styles.buttonText, { color: tc.text.white }]}>📱 수관 온도 측정</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: tc.text.secondary }]}
                    onPress={async () => {
                        const farmId = Number(farmInfo?.id);
                        if (!farmId || isNaN(farmId)) { Alert.alert('알림', '농장 정보를 먼저 설정해주세요.'); return; }
                        try {
                            const history = await irrigationApi.getWaterBalanceHistory(farmId, 30);
                            Alert.alert('물수지 이력 (최근 30일)',
                                `기간: ${history.dates?.[0] || '-'} ~ ${history.dates?.[history.dates.length - 1] || '-'}\n` +
                                `총 관개: ${history.irrigation?.reduce((a: number, b: number) => a + b, 0)?.toFixed(1) || 0}mm\n` +
                                `총 강수: ${history.rainfall?.reduce((a: number, b: number) => a + b, 0)?.toFixed(1) || 0}mm`
                            );
                        } catch (e: any) {
                            Alert.alert('오류', '이력 조회에 실패했습니다.');
                        }
                    }}
                >
                    <Text style={[styles.buttonText, { color: tc.text.white }]}>📊 측정 이력</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: tokens.fontSize.md,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    cwsiDisplay: {
        alignItems: 'center',
    },
    cwsiValue: {
        fontSize: tokens.fontSize.xxl,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    stressLevel: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '600',
        marginBottom: 4,
    },
    confidence: {
        fontSize: tokens.fontSize.xs,
    },
    vpdDisplay: {
        alignItems: 'center',
    },
    vpdValue: {
        fontSize: tokens.fontSize.lg,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vpdStatus: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '600',
    },
    recommendation: {
        fontSize: tokens.fontSize.sm,
        lineHeight: 24,
        marginBottom: 12,
    },
    detailsContainer: {
        borderRadius: 8,
        padding: 12,
    },
    detailText: {
        fontSize: tokens.fontSize.xs,
        marginBottom: 4,
    },
    noDataText: {
        fontSize: tokens.fontSize.xs,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '600',
    },

    // ── Soil moisture gauge ──────────────────────────────────────
    gaugeWrapper: {
        marginBottom: 12,
    },
    gaugeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    gaugeLabel: {
        fontSize: tokens.fontSize.xs,
        fontWeight: '600',
    },
    gaugeValue: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '700',
    },
    gaugeTrack: {
        height: 14,
        borderRadius: 7,
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative',
    },
    gaugeZone: {
        height: '100%',
    },
    gaugeFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        opacity: 0.75,
    },
    gaugeThumb: {
        position: 'absolute',
        top: -3,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2.5,
        marginLeft: -10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    gaugeTickRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    gaugeTick: {
        fontSize: 11,
    },
    gaugeBadge: {
        alignSelf: 'flex-start',
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    gaugeBadgeText: {
        fontSize: tokens.fontSize.xs,
        fontWeight: '700',
    },

    // ── Water balance bar ────────────────────────────────────────
    wbWrapper: {
        marginBottom: 4,
    },
    wbRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    wbTrack: {
        height: 14,
        borderRadius: 7,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
    },
    wbZeroLine: {
        position: 'absolute',
        left: '50%' as any,
        top: 0,
        bottom: 0,
        width: 2,
        zIndex: 2,
    },
    wbFill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        opacity: 0.8,
    },
    wbTickRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },

    // ── Recommendation card enhancements ────────────────────────
    recHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    urgencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        gap: 5,
    },
    urgencyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    urgencyText: {
        fontSize: tokens.fontSize.xs,
        fontWeight: '700',
    },
    amountRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    amountBadge: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    amountLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: tokens.fontSize.sm,
        fontWeight: '700',
    },
});

export default IrrigationDashboardScreen;
