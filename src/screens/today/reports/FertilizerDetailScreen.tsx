/**
 * GAP 비료 관리 상세 화면
 * 영양소 수지 분석, GAP 준수 비료 추천, 감사 보고서
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageLayout from '../../../components/common/PageLayout';
import HelpCard from '../../../components/common/HelpCard';
import { HELP } from '../../../constants/helpContents';
import { useTheme } from '../../../theme/ThemeProvider';
import { gapFertilizerApi, FertilizerRecommendation, FertilizerRecommendationResponse, FertilizerAuditResponse } from '../../../services/gapFertilizerApi';
import { useFarmId, useStore } from '../../../store/useStore';

type ApplyingState = Record<number, boolean>;

const DEFICIENCY_COLORS: Record<string, string> = {
  severe: '#EF4444',
  moderate: '#F59E0B',
  mild: '#3B82F6',
  none: '#10B981',
};

const DEFICIENCY_LABELS: Record<string, string> = {
  severe: '심각',
  moderate: '보통',
  mild: '경미',
  none: '정상',
};

const FertilizerDetailScreen = () => {
  const { colors: tc } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const h = HELP.fertilizer;
  const farmId = useFarmId();
  const farmInfo = useStore((s) => s.farmInfo);
  const [recommendation, setRecommendation] = useState<FertilizerRecommendationResponse | null>(null);
  const [audit, setAudit] = useState<FertilizerAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<ApplyingState>({});
  const [appliedList, setAppliedList] = useState<number[]>([]);

  // 추천 비료 시비 완료 → GAP 기록 + 영농일지 자동 생성
  const handleApplyFertilizer = async (rec: FertilizerRecommendation, idx: number) => {
    const areaHa = farmInfo?.area ? Number(farmInfo.area) / 10000 : 1.5;
    const totalKg = rec.amount_kg_per_ha * areaHa;

    Alert.alert(
      '시비 완료 확인',
      `${rec.fertilizer_name} ${totalKg.toFixed(1)}kg을 시비 완료하시겠습니까?\n\n영농일지에 자동 기록됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시비 완료',
          onPress: async () => {
            if (!farmId) {
              Alert.alert('알림', '농장을 먼저 등록해주세요.');
              return;
            }
            try {
              setApplying((prev) => ({ ...prev, [idx]: true }));
              const fid = farmId;
              await gapFertilizerApi.createRecord(fid, {
                fertilizer_name: rec.fertilizer_name,
                amount_kg: totalKg,
                application_date: new Date().toISOString().slice(0, 10),
                application_method: rec.application_method || '토양시비',
              });
              setAppliedList((prev) => [...prev, idx]);
              Alert.alert('완료', `${rec.fertilizer_name} 시비가 기록되었습니다.\nGAP 비료 기록 + 영농일지에 자동 저장되었습니다.`);
              // 감사 데이터 갱신
              try {
                const auditResult = await gapFertilizerApi.getAudit(fid);
                setAudit(auditResult);
              } catch (_) {}
            } catch (e: any) {
              Alert.alert('오류', e?.message || '시비 기록 저장에 실패했습니다.');
            } finally {
              setApplying((prev) => ({ ...prev, [idx]: false }));
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!farmId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fid = farmId;

      const [recResult, auditResult] = await Promise.allSettled([
        gapFertilizerApi.getRecommendations(fid, {
          variety: farmInfo?.variety || '샤인머스켓',
          growth_stage: getGrowthStage(),
          area_ha: farmInfo?.area ? Number(farmInfo.area) / 10000 : 1.5,
        }),
        gapFertilizerApi.getAudit(fid),
      ]);

      if (recResult.status === 'fulfilled') setRecommendation(recResult.value);
      if (auditResult.status === 'fulfilled') setAudit(auditResult.value);
    } catch (e) {
      console.warn('Fertilizer detail load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthStage = (): string => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 3) return '발아기';
    if (month >= 4 && month <= 4) return '신초생장기';
    if (month >= 5 && month <= 5) return '개화기';
    if (month >= 6 && month <= 6) return '과실비대기';
    if (month >= 7 && month <= 7) return '변색기';
    if (month >= 8 && month <= 9) return '수확기';
    return '휴면기';
  };

  const getGrowthStageLabel = (): string => {
    return recommendation?.growth_stage || getGrowthStage();
  };

  const renderNutrientBar = (label: string, nutrient: { required: number; applied: number; deficit: number; level: string }) => {
    const ratio = nutrient.required > 0
      ? Math.min((nutrient.applied / nutrient.required) * 100, 100)
      : 100;
    const defColor = DEFICIENCY_COLORS[nutrient.level] || DEFICIENCY_COLORS.none;

    return (
      <View style={styles.nutrientRow} key={label}>
        <View style={styles.nutrientLabel}>
          <Text style={[styles.nutrientName, { color: tc.text.primary }]}>{label}</Text>
          <View style={[styles.levelBadge, { backgroundColor: `${defColor}20` }]}>
            <Text style={[styles.levelText, { color: defColor }]}>
              {DEFICIENCY_LABELS[nutrient.level] || '정상'}
            </Text>
          </View>
        </View>
        <View style={[styles.barBg, { backgroundColor: tc.border }]}>
          <View style={[styles.barFill, { width: `${ratio}%`, backgroundColor: defColor }]} />
        </View>
        <View style={styles.nutrientValues}>
          <Text style={[styles.nutrientVal, { color: tc.text.secondary }]}>
            투입 {nutrient.applied.toFixed(1)} / 필요 {nutrient.required.toFixed(1)} kg/ha
          </Text>
          {nutrient.deficit > 0 && (
            <Text style={[styles.deficitText, { color: defColor }]}>
              부족 {nutrient.deficit.toFixed(1)} kg/ha
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <PageLayout title="GAP 비료 관리" helpId={h?.id} onHelpPress={() => setShowHelp(!showHelp)} showFooter={false}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {showHelp && h && (
          <HelpCard id={h.id} title={h.title} body={h.body} icon={h.icon} iconColor={h.iconColor} forceShow />
        )}

        {loading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={tc.text.primary} />
          </View>
        ) : !recommendation && !audit ? (
          <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 16, color: tc.text.secondary, textAlign: 'center' }}>
              비료 데이터를 불러올 수 없습니다
            </Text>
          </View>
        ) : (
          <>
            {/* GAP 준수 점수 + 생육 단계 */}
            <View style={[styles.heroCard, { backgroundColor: tc.surface }]}>
              <Text style={[styles.heroLabel, { color: tc.text.secondary }]}>GAP 비료 준수율</Text>
              <Text style={[styles.heroValue, { color: '#059669' }]}>
                {recommendation?.gap_compliance_summary?.overall_score ?? audit?.compliance_rate ?? '--'}%
              </Text>
              <View style={styles.heroRow}>
                <View style={[styles.heroPill, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="leaf" size={14} color="#3B82F6" />
                  <Text style={[styles.heroPillText, { color: '#3B82F6' }]}>{getGrowthStageLabel()}</Text>
                </View>
                {recommendation?.growth_stage_timing && (
                  <View style={[styles.heroPill, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="flash" size={14} color="#D97706" />
                    <Text style={[styles.heroPillText, { color: '#D97706' }]}>
                      중점: {recommendation.growth_stage_timing.focus}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 영양소 수지 분석 */}
            {recommendation?.nutrient_balance && (
              <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>영양소 수지 분석</Text>
                {Object.entries(recommendation.nutrient_balance).map(([key, val]) =>
                  renderNutrientBar(key, val)
                )}
              </View>
            )}

            {/* GAP 비료 추천 */}
            {recommendation?.recommendations && recommendation.recommendations.length > 0 && (
              <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>GAP 준수 비료 추천</Text>
                {recommendation.recommendations.map((rec, idx) => (
                  <View key={idx} style={[styles.recItem, { borderBottomColor: tc.border }]}>
                    <View style={styles.recHeader}>
                      <Text style={[styles.recName, { color: tc.text.primary }]}>{rec.fertilizer_name}</Text>
                      <View style={[styles.safetyBadge, {
                        backgroundColor: rec.safety_level === 'LOW_RISK' ? '#D1FAE5' : '#FEF3C7',
                      }]}>
                        <Text style={[styles.safetyText, {
                          color: rec.safety_level === 'LOW_RISK' ? '#059669' : '#D97706',
                        }]}>
                          {rec.safety_level === 'LOW_RISK' ? '저위험' : '보통'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.recGrid}>
                      <View style={styles.recCell}>
                        <Text style={[styles.recLabel, { color: tc.text.secondary }]}>투입량</Text>
                        <Text style={[styles.recValue, { color: tc.text.primary }]}>
                          {rec.amount_kg_per_ha.toFixed(1)} kg/ha
                        </Text>
                      </View>
                      <View style={styles.recCell}>
                        <Text style={[styles.recLabel, { color: tc.text.secondary }]}>대상 영양소</Text>
                        <Text style={[styles.recValue, { color: tc.text.primary }]}>{rec.target_nutrient}</Text>
                      </View>
                      <View style={styles.recCell}>
                        <Text style={[styles.recLabel, { color: tc.text.secondary }]}>결핍도</Text>
                        <Text style={[styles.recValue, { color: DEFICIENCY_COLORS[rec.deficiency_level] || '#666' }]}>
                          {DEFICIENCY_LABELS[rec.deficiency_level] || rec.deficiency_level}
                        </Text>
                      </View>
                      <View style={styles.recCell}>
                        <Text style={[styles.recLabel, { color: tc.text.secondary }]}>비용</Text>
                        <Text style={[styles.recValue, { color: tc.text.primary }]}>
                          {rec.cost_per_ha ? `${Math.round(rec.cost_per_ha).toLocaleString()}원/ha` : '-'}
                        </Text>
                      </View>
                    </View>
                    {/* 안전 정보 */}
                    <View style={[styles.safetyRow, { borderTopColor: tc.border }]}>
                      {rec.phi_days > 0 && (
                        <View style={styles.safetyItem}>
                          <Ionicons name="time-outline" size={14} color="#EF4444" />
                          <Text style={[styles.safetyItemText, { color: tc.text.secondary }]}>PHI {rec.phi_days}일</Text>
                        </View>
                      )}
                      {rec.rei_hours > 0 && (
                        <View style={styles.safetyItem}>
                          <Ionicons name="hourglass-outline" size={14} color="#F59E0B" />
                          <Text style={[styles.safetyItemText, { color: tc.text.secondary }]}>REI {rec.rei_hours}시간</Text>
                        </View>
                      )}
                      {rec.ppe_required && rec.ppe_required.length > 0 && (
                        <View style={styles.safetyItem}>
                          <Ionicons name="shield-checkmark-outline" size={14} color="#3B82F6" />
                          <Text style={[styles.safetyItemText, { color: tc.text.secondary }]}>
                            {rec.ppe_required.join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                    {/* 시비 완료 버튼 */}
                    <TouchableOpacity
                      style={[styles.applyBtn, appliedList.includes(idx) && styles.applyBtnDone]}
                      disabled={applying[idx] || appliedList.includes(idx)}
                      onPress={() => handleApplyFertilizer(rec, idx)}
                    >
                      {applying[idx] ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons
                            name={appliedList.includes(idx) ? 'checkmark-circle' : 'pencil-outline'}
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.applyBtnText}>
                            {appliedList.includes(idx) ? '기록 완료' : '시비 완료 → 영농일지 기록'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
                {/* 총 비용 */}
                {recommendation.total_cost_per_ha > 0 && (
                  <View style={styles.totalCost}>
                    <Text style={[styles.totalLabel, { color: tc.text.secondary }]}>총 예상 비용</Text>
                    <Text style={[styles.totalValue, { color: tc.text.primary }]}>
                      {Math.round(recommendation.total_cost_per_ha).toLocaleString()}원/ha
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* GAP 감사 현황 */}
            {audit && (
              <View style={[styles.card, { backgroundColor: tc.surface }]}>
                <Text style={[styles.cardTitle, { color: tc.text.primary }]}>GAP 감사 현황</Text>
                <View style={styles.auditGrid}>
                  <View style={styles.auditCell}>
                    <Text style={[styles.auditNum, { color: '#059669' }]}>{audit.compliance_rate}%</Text>
                    <Text style={[styles.auditLabel, { color: tc.text.secondary }]}>준수율</Text>
                  </View>
                  <View style={styles.auditCell}>
                    <Text style={[styles.auditNum, { color: '#3B82F6' }]}>{audit.total_records}</Text>
                    <Text style={[styles.auditLabel, { color: tc.text.secondary }]}>기록 건수</Text>
                  </View>
                  <View style={styles.auditCell}>
                    <View style={[styles.certBadge, {
                      backgroundColor: audit.certification_status === 'ready' ? '#D1FAE5' :
                        audit.certification_status === 'needs_improvement' ? '#FEF3C7' : '#FEE2E2',
                    }]}>
                      <Text style={[styles.certText, {
                        color: audit.certification_status === 'ready' ? '#059669' :
                          audit.certification_status === 'needs_improvement' ? '#D97706' : '#DC2626',
                      }]}>
                        {audit.certification_status === 'ready' ? '인증 가능' :
                          audit.certification_status === 'needs_improvement' ? '개선 필요' : '미준비'}
                      </Text>
                    </View>
                    <Text style={[styles.auditLabel, { color: tc.text.secondary }]}>인증 상태</Text>
                  </View>
                </View>

                {/* 개선 권장사항 */}
                {audit.issues && audit.issues.length > 0 && (
                  <View style={[styles.issueSection, { borderTopColor: tc.border }]}>
                    <Text style={[styles.issueTitle, { color: tc.text.primary }]}>개선 필요 사항</Text>
                    {audit.issues.map((issue, i) => (
                      <View key={i} style={styles.issueItem}>
                        <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                        <Text style={[styles.issueText, { color: tc.text.secondary }]}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 최근 비료 사용 요약 */}
                {audit.records_summary && audit.records_summary.length > 0 && (
                  <View style={[styles.issueSection, { borderTopColor: tc.border }]}>
                    <Text style={[styles.issueTitle, { color: tc.text.primary }]}>비료 사용 내역</Text>
                    {audit.records_summary.map((rec, i) => (
                      <View key={i} style={[styles.recSummaryRow, { borderBottomColor: tc.border }]}>
                        <Text style={[styles.recSummaryName, { color: tc.text.primary }]}>{rec.fertilizer_name}</Text>
                        <Text style={[styles.recSummaryVal, { color: tc.text.secondary }]}>
                          {rec.total_amount_kg}kg · {rec.application_count}회
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  heroLabel: { fontSize: 14 },
  heroValue: { fontSize: 56, fontWeight: '800', marginTop: 4 },
  heroRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroPillText: { fontSize: 13, fontWeight: '600' },
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  // Nutrient bars
  nutrientRow: { marginBottom: 14 },
  nutrientLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nutrientName: { fontSize: 15, fontWeight: '600' },
  levelBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 12, fontWeight: '600' },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  nutrientValues: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  nutrientVal: { fontSize: 12 },
  deficitText: { fontSize: 12, fontWeight: '600' },
  // Recommendations
  recItem: { paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1 },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recName: { fontSize: 16, fontWeight: '700' },
  safetyBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  safetyText: { fontSize: 12, fontWeight: '600' },
  recGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  recCell: { width: '50%', marginBottom: 8 },
  recLabel: { fontSize: 12, marginBottom: 2 },
  recValue: { fontSize: 15, fontWeight: '600' },
  safetyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 10, marginTop: 8, borderTopWidth: 1 },
  safetyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  safetyItemText: { fontSize: 12 },
  totalCost: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 18, fontWeight: '800' },
  // Audit
  auditGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  auditCell: { alignItems: 'center' },
  auditNum: { fontSize: 28, fontWeight: '800' },
  auditLabel: { fontSize: 12, marginTop: 4 },
  certBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  certText: { fontSize: 14, fontWeight: '700' },
  issueSection: { borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  issueTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  issueItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  issueText: { fontSize: 13, flex: 1 },
  recSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  recSummaryName: { fontSize: 14, fontWeight: '600' },
  recSummaryVal: { fontSize: 13 },
  // 시비 완료 버튼
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  applyBtnDone: {
    backgroundColor: '#9CA3AF',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default FertilizerDetailScreen;
