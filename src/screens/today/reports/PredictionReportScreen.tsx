import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';
import { tokens } from '../../../design-system/tokens';
import Header from '../../../components/common/Header';
import HelpModal from '../../../components/common/HelpModal';
import { HELP_CONTENTS } from '../../../constants/helpContents';
import { diseasePredictionApi, RealtimePrediction } from '../../../services/diseasePredictionApi';
import { dssApi } from '../../../services/dssApi';
import { useFarmId } from '../../../store/useStore';

const PredictionReportScreen = () => {
  const { colors } = useTheme();
  const [helpVisible, setHelpVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [realtime, setRealtime] = useState<RealtimePrediction | null>(null);
  const [growthStageDetail, setGrowthStageDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const farmId = useFarmId();
  const helpContent = HELP_CONTENTS['REPORT_PREDICTION'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const fid = parseInt(farmId || '0', 10);
      if (!fid) return;

      const [quickRes, realtimeRes, growthRes] = await Promise.allSettled([
        diseasePredictionApi.getQuickPrediction(fid),
        diseasePredictionApi.getRealtimePrediction(fid),
        dssApi.getGrowthStage(String(fid)),
      ]);

      if (quickRes.status === 'fulfilled') {
        const d = quickRes.value;
        setData({
          pmi: d.pmi ?? d.risk_score ?? 0,
          growthStage: d.growth_stage ?? d.stage_label ?? '확인중',
          sprayTiming: d.spray_timing ?? d.recommendation ?? '',
          diseases: (d.top_risks || []).map((r: any) => ({
            name: r.disease,
            risk: r.score ?? (r.risk_level === 'high' ? 0.8 : r.risk_level === 'medium' ? 0.5 : 0.2),
            color: r.risk_level === 'high' ? '#EF4444' : r.risk_level === 'medium' ? '#F59E0B' : '#10B981',
          })),
        });
      }

      if (realtimeRes.status === 'fulfilled') {
        setRealtime(realtimeRes.value);
      }
      if (growthRes.status === 'fulfilled') {
        setGrowthStageDetail(growthRes.value);
      }
    } catch (e) {
      console.warn('Prediction data load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRiskLevel = (pmi: number) => {
    if (pmi < 0.3) return { text: '낮음', color: '#10B981' };
    if (pmi < 0.6) return { text: '보통', color: '#F59E0B' };
    return { text: '높음', color: '#EF4444' };
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="병해 예측" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="병해 예측" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary }}>데이터를 불러올 수 없습니다</Text>
        </View>
      </View>
    );
  }

  const riskLevel = getRiskLevel(data.pmi);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="병해 예측"
        rightAction={
          <TouchableOpacity onPress={() => setHelpVisible(true)}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text.light} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>PMI (식물병 위험지수)</Text>
          <View style={styles.pmiContainer}>
            <Text style={[styles.pmiValue, { color: riskLevel.color }]}>
              {data.pmi.toFixed(2)}
            </Text>
            <View style={[styles.riskBadge, { backgroundColor: riskLevel.color + '20' }]}>
              <Text style={[styles.riskText, { color: riskLevel.color }]}>{riskLevel.text}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>현재 생육단계</Text>
          <View style={styles.stageRow}>
            <Ionicons name="leaf-outline" size={tokens.iconSize.md} color="#10B981" />
            <Text style={[styles.stageText, { color: colors.text.primary }]}>{data.growthStage}</Text>
          </View>
        </View>

        {growthStageDetail && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>생육 상세</Text>
            {growthStageDetail.gdd != null && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: tokens.fontSize.sm, color: colors.text.secondary }}>적산온도 (GDD)</Text>
                <Text style={{ fontSize: tokens.fontSize.sm, fontWeight: '600', color: colors.text.primary }}>{growthStageDetail.gdd.toLocaleString()}°D</Text>
              </View>
            )}
            {growthStageDetail.days_in_stage != null && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: tokens.fontSize.sm, color: colors.text.secondary }}>현 단계 경과일</Text>
                <Text style={{ fontSize: tokens.fontSize.sm, fontWeight: '600', color: colors.text.primary }}>{growthStageDetail.days_in_stage}일</Text>
              </View>
            )}
            {growthStageDetail.next_stage && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: tokens.fontSize.sm, color: colors.text.secondary }}>다음 단계</Text>
                <Text style={{ fontSize: tokens.fontSize.sm, fontWeight: '600', color: '#3B82F6' }}>{growthStageDetail.next_stage}</Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>병해별 위험도</Text>
          {data.diseases.map((disease: any, index: number) => (
            <View key={index} style={styles.diseaseItem}>
              <Text style={[styles.diseaseName, { color: colors.text.primary }]}>{disease.name}</Text>
              <View style={styles.riskBarContainer}>
                <View style={[styles.riskBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[styles.riskBarFill, { width: `${disease.risk * 100}%`, backgroundColor: disease.color }]}
                  />
                </View>
                <Text style={[styles.riskPercent, { color: colors.text.secondary }]}>
                  {(disease.risk * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.alertCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="warning-outline" size={tokens.iconSize.md} color="#F59E0B" />
          <Text style={[styles.alertText, { color: '#92400E' }]}>{data.sprayTiming}</Text>
        </View>

        {/* 실시간 병해 분석 (realtime API) */}
        {realtime && realtime.active_diseases?.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>실시간 병해 동향</Text>
            {realtime.active_diseases.map((d, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: tokens.fontSize.sm, color: colors.text.primary }}>{d.disease}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: tokens.fontSize.sm, color: d.probability > 0.6 ? '#EF4444' : '#F59E0B' }}>
                    {(d.probability * 100).toFixed(0)}%
                  </Text>
                  <Ionicons
                    name={d.trend === 'increasing' ? 'trending-up' : d.trend === 'decreasing' ? 'trending-down' : 'remove'}
                    size={16}
                    color={d.trend === 'increasing' ? '#EF4444' : d.trend === 'decreasing' ? '#10B981' : '#6B7280'}
                  />
                </View>
              </View>
            ))}
            {realtime.alerts?.map((alert, i) => (
              <View key={`alert-${i}`} style={[styles.alertCard, { backgroundColor: '#FEF2F2', marginTop: 8 }]}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={[styles.alertText, { color: '#991B1B' }]}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title={helpContent.title}
        subtitle={helpContent.subtitle}
        points={helpContent.points}
        category={helpContent.category}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.md,
  },
  card: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.md,
  },
  cardTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: '600',
    marginBottom: tokens.spacing.md,
  },
  pmiContainer: {
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  pmiValue: {
    fontSize: tokens.fontSize.xxl,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
  },
  riskText: {
    fontSize: tokens.fontSize.md,
    fontWeight: '600',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  stageText: {
    fontSize: tokens.fontSize.xl,
    fontWeight: '600',
  },
  diseaseItem: {
    marginBottom: tokens.spacing.md,
  },
  diseaseName: {
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  riskBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  riskBarBg: {
    flex: 1,
    height: 8,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
  },
  riskPercent: {
    fontSize: tokens.fontSize.xs,
    width: 40,
    textAlign: 'right',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  alertText: {
    flex: 1,
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
  },
});

export default PredictionReportScreen;
