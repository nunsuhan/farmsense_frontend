/**
 * 병해 예측 상세 리포트
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import PageLayout from '../../../components/common/PageLayout';
import HelpCard from '../../../components/common/HelpCard';
import { HELP } from '../../../constants/helpContents';
import { useTheme } from '../../../theme/ThemeProvider';
import { diseasePredictionApi, FullAnalysis } from '../../../services/diseasePredictionApi';
import { useFarmId } from '../../../store/useStore';

// ─── helpers ────────────────────────────────────────────────────────────────

const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

type SprayItem = {
  date: string;
  target_disease: string;
  pesticide: string;
  urgency: string;
};

type ThemeColors = ReturnType<typeof import('../../../theme/ThemeProvider').useTheme>['colors'];

const getItemStatus = (date: string): 'past' | 'today' | 'future' => {
  if (date < todayStr) return 'past';
  if (date === todayStr) return 'today';
  return 'future';
};

const DOT_SIZE = 14;
const LINE_WIDTH = 2;

const SprayTimeline = ({ schedule, tc }: { schedule: SprayItem[]; tc: ThemeColors }) => {
  const dotColor = (status: 'past' | 'today' | 'future') => {
    if (status === 'past') return '#9CA3AF';
    if (status === 'today') return '#10B981';
    return '#3B82F6';
  };

  const labelColor = (status: 'past' | 'today' | 'future') => {
    if (status === 'past') return '#9CA3AF';
    if (status === 'today') return '#10B981';
    return '#3B82F6';
  };

  return (
    <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 16 }}>살포 스케줄</Text>
      {schedule.map((s, i) => {
        const status = getItemStatus(s.date);
        const isLast = i === schedule.length - 1;
        const dot = dotColor(status);
        const label = labelColor(status);

        return (
          <View key={i} style={{ flexDirection: 'row' }}>
            {/* Left column: dot + vertical line */}
            <View style={{ width: DOT_SIZE + 16, alignItems: 'center' }}>
              {/* dot */}
              <View
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE / 2,
                  backgroundColor: status === 'today' ? dot : 'transparent',
                  borderWidth: 2,
                  borderColor: dot,
                  marginTop: 3,
                  zIndex: 1,
                }}
              />
              {/* connector line below dot */}
              {!isLast && (
                <View
                  style={{
                    width: LINE_WIDTH,
                    flex: 1,
                    backgroundColor: '#E5E7EB',
                    marginTop: 2,
                    marginBottom: 0,
                  }}
                />
              )}
            </View>

            {/* Right column: content card */}
            <View
              style={{
                flex: 1,
                marginLeft: 8,
                marginBottom: isLast ? 0 : 16,
                backgroundColor: status === 'today' ? '#F0FDF4' : status === 'future' ? '#EFF6FF' : tc.background,
                borderRadius: 10,
                padding: 10,
                borderWidth: status === 'today' ? 1 : 0,
                borderColor: status === 'today' ? '#6EE7B7' : 'transparent',
              }}
            >
              {/* date row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: label }}>
                  {s.date}
                  {status === 'today' ? '  오늘' : ''}
                </Text>
                {/* urgency badge */}
                <View
                  style={{
                    backgroundColor: s.urgency === 'high' ? '#FEE2E2' : s.urgency === 'medium' ? '#FEF3C7' : '#F3F4F6',
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: s.urgency === 'high' ? '#DC2626' : s.urgency === 'medium' ? '#D97706' : '#6B7280',
                    }}
                  >
                    {s.urgency === 'high' ? '긴급' : s.urgency === 'medium' ? '보통' : s.urgency}
                  </Text>
                </View>
              </View>
              {/* disease + pesticide */}
              <Text style={{ fontSize: 13, color: status === 'past' ? '#9CA3AF' : tc.text.primary, fontWeight: '600' }}>
                {s.target_disease}
              </Text>
              <Text style={{ fontSize: 12, color: status === 'past' ? '#9CA3AF' : tc.text.secondary, marginTop: 2 }}>
                {s.pesticide}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ────────────────────────────────────────────────────────────────────────────

const PredictionDetailScreen = () => {
  const { colors: tc } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [data, setData] = useState<any>(null);
  const [fullData, setFullData] = useState<FullAnalysis | null>(null);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [autoData, setAutoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const farmId = useFarmId();
  const h = HELP.prediction;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const fid = parseInt(farmId || '0', 10);
      if (!fid) return;

      const [quickRes, fullRes, seasonRes, autoRes] = await Promise.allSettled([
        diseasePredictionApi.getQuickPrediction(fid),
        diseasePredictionApi.getFullAnalysis(fid),
        diseasePredictionApi.getSeasonAnalysis(fid),
        diseasePredictionApi.getAutoPrediction(fid),
      ]);

      if (quickRes.status === 'fulfilled') {
        const d = quickRes.value;
        setData({
          pmi: d.pmi ?? d.risk_score ?? 0,
          growthStage: d.growth_stage ?? d.stage_label ?? '확인중',
          gdd: d.gdd ?? null,
          sprayTiming: d.spray_timing ?? d.recommendation ?? '',
          diseases: (d.top_risks || []).map((r: any) => ({
            name: r.disease,
            risk: r.score ?? (r.risk_level === 'high' ? 0.8 : r.risk_level === 'medium' ? 0.5 : 0.2),
            color: r.risk_level === 'high' ? '#EF4444' : r.risk_level === 'medium' ? '#F59E0B' : '#10B981',
          })),
        });
      }

      if (fullRes.status === 'fulfilled') {
        setFullData(fullRes.value);
      }
      if (seasonRes.status === 'fulfilled') {
        setSeasonData(seasonRes.value);
      }
      if (autoRes.status === 'fulfilled') {
        setAutoData(autoRes.value);
      }
    } catch (e) {
      console.warn('Prediction data load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (pmi: number) => {
    if (pmi < 0.3) return { text: '낮은 위험', color: '#059669', bg: '#D1FAE5' };
    if (pmi < 0.6) return { text: '보통 위험', color: '#D97706', bg: '#FEF3C7' };
    return { text: '높은 위험', color: '#DC2626', bg: '#FEE2E2' };
  };

  if (loading) {
    return (
      <PageLayout title="병해 예측" helpId={h.id} showFooter={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={tc.primary} />
        </View>
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout title="병해 예측" helpId={h.id} showFooter={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: tc.text.secondary }}>데이터를 불러올 수 없습니다</Text>
        </View>
      </PageLayout>
    );
  }

  const riskLevel = getRiskLevel(data.pmi);

  return (
    <PageLayout title="병해 예측" helpId={h.id} onHelpPress={() => setShowHelp(!showHelp)} showFooter={false}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {showHelp && <HelpCard id={h.id} title={h.title} body={h.body} icon={h.icon} iconColor={h.iconColor} forceShow />}

        <View style={{ alignItems: 'center', paddingVertical: 32, backgroundColor: tc.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 16 }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: riskLevel.color }}>{data.pmi.toFixed(2)}</Text>
          <Text style={{ fontSize: 14, color: tc.text.secondary, marginTop: 4 }}>PMI (병해관리지수)</Text>
          <View style={[styles.badge, { backgroundColor: riskLevel.bg }]}>
            <Text style={[styles.badgeText, { color: riskLevel.color }]}>{riskLevel.text}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 12 }}>상세 분석</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>생육 단계</Text><Text style={{ fontSize: 15, fontWeight: '600', color: tc.text.primary }}>{data.growthStage}</Text></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>적산온도 (GDD)</Text><Text style={{ fontSize: 15, fontWeight: '600', color: tc.text.primary }}>{data.gdd ? `${data.gdd.toLocaleString()}°D` : '–'}</Text></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>살포 권고</Text><Text style={{ fontSize: 15, fontWeight: '600', color: tc.text.primary }}>{data.sprayTiming}</Text></View>
        </View>

        <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 12 }}>병해별 위험도</Text>
          {data.diseases.map((d: any) => (
            <View key={d.name} style={styles.riskRow}>
              <Text style={{ fontSize: 15, color: tc.text.secondary }}>{d.name}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: tc.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={[styles.riskFill, { width: `${d.risk * 100}%`, backgroundColor: d.color }]} />
              </View>
              <Text style={[styles.riskValue, { color: d.color }]}>{(d.risk * 100).toFixed(0)}%</Text>
            </View>
          ))}
        </View>

        {/* 전체 분석 - 살포 스케줄 (full API) */}
        {fullData?.spray_schedule && fullData.spray_schedule.length > 0 && (
          <SprayTimeline schedule={fullData.spray_schedule} tc={tc} />
        )}

        {/* 전체 분석 - 시즌 전망 */}
        {fullData?.season_outlook && (
          <View style={{ backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: '#BBF7D0' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 }}>시즌 전망</Text>
            <Text style={{ fontSize: 14, color: '#047857', lineHeight: 20 }}>{fullData.season_outlook}</Text>
          </View>
        )}

        {/* 시즌 분석 (getSeasonAnalysis) */}
        {seasonData && (
          <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 12 }}>시즌 분석</Text>
            {seasonData.season_risks?.map((r: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i < (seasonData.season_risks.length - 1) ? 1 : 0, borderBottomColor: tc.border }}>
                <Text style={{ fontSize: 14, color: tc.text.secondary }}>{r.period || r.month}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: r.risk_level === 'high' ? '#EF4444' : r.risk_level === 'medium' ? '#F59E0B' : '#10B981' }}>{r.disease || r.description}</Text>
              </View>
            ))}
            {seasonData.summary && (
              <Text style={{ fontSize: 13, color: tc.text.secondary, marginTop: 8, lineHeight: 18 }}>{seasonData.summary}</Text>
            )}
          </View>
        )}

        {/* 자동 분석 (getAutoPrediction) */}
        {autoData && (
          <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 12 }}>자동 환경 분석</Text>
            {autoData.environmental_risk != null && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tc.border }}>
                <Text style={{ fontSize: 14, color: tc.text.secondary }}>환경 위험도</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: autoData.environmental_risk > 0.6 ? '#EF4444' : '#10B981' }}>{(autoData.environmental_risk * 100).toFixed(0)}%</Text>
              </View>
            )}
            {autoData.recommendation && (
              <Text style={{ fontSize: 13, color: tc.text.secondary, marginTop: 8, lineHeight: 18 }}>{autoData.recommendation}</Text>
            )}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  riskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  riskFill: { height: 8, borderRadius: 4 },
  riskValue: { width: 36, textAlign: 'right', fontSize: 13, fontWeight: '600' },
});

export default PredictionDetailScreen;
