/**
 * ReportHomeScreen - 로그인 후 메인 보고서 화면
 * API에서 동적 카드를 받아 렌더링
 * GET /api/v1/farms/{farm_id}/report/today/
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { useStore } from '../../store/useStore';
import apiClient from '../../services/api';
import AskReportBar from '../../components/home/AskReportBar';
import OnboardingReminderBanner from '../../components/common/OnboardingReminderBanner';

// 카드 타입별 색상
const CARD_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  opinion: { bg: '#FFFBEB', border: '#FDE68A', icon: '#F59E0B' },
  warning: { bg: '#FEF2F2', border: '#FECACA', icon: '#EF4444' },
  action: { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626' },
  info: { bg: '#ECFDF5', border: '#A7F3D0', icon: '#10B981' },
  ok: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#22C55E' },
  vent: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#3B82F6' },
};

const CARD_ICONS: Record<string, string> = {
  opinion: 'bulb-outline',
  warning: 'warning-outline',
  action: 'alert-circle-outline',
  info: 'information-circle-outline',
  ok: 'checkmark-circle-outline',
  vent: 'thunderstorm-outline',
};

interface ReportCard {
  type: string;
  title: string;
  body: string;
}

interface ReportMetric {
  label: string;
  value: string;
  unit: string;
  status?: string;
}

interface ReportData {
  farm_name: string;
  report_date: string;
  cards: ReportCard[];
  metrics: ReportMetric[];
}

const ReportHomeScreen = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const farmInfo = useStore((s) => s.farmInfo);
  const user = useStore((s) => s.user);

  const farmName = farmInfo?.name || user?.farm_name || '내 농장';
  const farmId = farmInfo?.id || user?.farm_id;

  const fetchReport = useCallback(async () => {
    if (!farmId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const res = await apiClient.get(`/v1/farms/${farmId}/report/today/`);
      setReport(res.data);
    } catch (e: any) {
      console.warn('Report fetch failed:', e?.message);
      setError('보고서를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 센서/농장 미등록
  if (!farmId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.farmName}>{farmName}</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={colors.textDisabled} />
          <Text style={styles.emptyTitle}>농장을 등록해주세요</Text>
          <Text style={styles.emptySubtitle}>
            내농장 탭에서 농장 정보와 센서를 등록하면{'\n'}맞춤 보고서를 받을 수 있습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.farmName}>{farmName}</Text>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <OnboardingReminderBanner />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>보고서 불러오는 중...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchReport}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && report && (
          <>
            {/* 의견 카드 */}
            {report.cards.map((card, i) => {
              const colorScheme = CARD_COLORS[card.type] || CARD_COLORS.info;
              const iconName = CARD_ICONS[card.type] || 'information-circle-outline';
              return (
                <View key={i} style={[styles.reportCard, { backgroundColor: colorScheme.bg, borderColor: colorScheme.border }]}>
                  <Ionicons name={iconName as any} size={22} color={colorScheme.icon} />
                  <View style={styles.reportCardContent}>
                    <Text style={styles.reportCardTitle}>{card.title}</Text>
                    <Text style={styles.reportCardBody}>{card.body}</Text>
                  </View>
                </View>
              );
            })}

            {/* 숫자 카드 2x2 그리드 */}
            {report.metrics && report.metrics.length > 0 && (
              <View style={styles.metricsGrid}>
                {report.metrics.map((m, i) => (
                  <View key={i} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <Text style={styles.metricValue}>
                      {m.value}<Text style={styles.metricUnit}> {m.unit}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {!loading && !error && !report && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyTitle}>아직 보고서가 없습니다</Text>
            <Text style={styles.emptySubtitle}>센서 데이터가 쌓이면 보고서가 자동 생성됩니다.</Text>
          </View>
        )}

        {!loading && <AskReportBar reportContext={report} />}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  farmName: { fontSize: 22, fontWeight: '800', color: colors.text },
  dateText: { fontSize: 13, color: colors.textSub, marginTop: 4 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  loadingContainer: { alignItems: 'center', paddingTop: 60 },
  loadingText: { fontSize: 14, color: colors.textSub, marginTop: 12 },
  errorContainer: { alignItems: 'center', paddingTop: 60 },
  errorText: { fontSize: 15, color: '#EF4444', marginTop: 12, marginBottom: 16 },
  retryButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  reportCardContent: { flex: 1 },
  reportCardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  reportCardBody: { fontSize: 13, color: colors.textSub, lineHeight: 20 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    ...shadows.small,
  },
  metricLabel: { fontSize: 13, color: colors.textSub, marginBottom: 6 },
  metricValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  metricUnit: { fontSize: 14, fontWeight: '500', color: colors.textSub },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textSub, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});

export default ReportHomeScreen;
