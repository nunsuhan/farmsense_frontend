/**
 * v2 TodayReportScreen - 오늘의 보고서 (메인 홈)
 * 7개 도메인 통합 요약 카드 + 센서 수치 타일
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PageLayout from '../../components/common/PageLayout';
import ReportSummaryCard from '../../components/common/ReportSummaryCard';
import SensorValueTile from '../../components/common/SensorValueTile';
import HelpCard from '../../components/common/HelpCard';
import { HELP } from '../../constants/helpContents';
import { reportApi, ReportSummary } from '../../services/reportApi';
import { useStore } from '../../store/useStore';
import { colors } from '../../theme/colors';

const TodayReportScreen = () => {
  const navigation = useNavigation<any>();
  const farmInfo = useStore((s) => s.farmInfo);
  const sensorData = useStore((s) => s.sensorData);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      const data = await reportApi.getReportSummary(farmInfo?.id || 'farm-123');
      setReport(data);
    } catch (e) {
      console.warn('Report load failed:', e);
    } finally {
      setLoading(false);
    }
  }, [farmInfo?.id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  };

  const getFormattedDate = () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const day = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    return `${m}월 ${d}일 (${day})`;
  };

  const getRisk = (level?: string): 'safe' | 'caution' | 'warning' | 'danger' | 'info' => {
    if (!level) return 'info';
    if (level === 'none' || level === 'low') return 'safe';
    if (level === 'mild' || level === 'moderate') return 'caution';
    if (level === 'high') return 'warning';
    if (level === 'critical' || level === 'severe') return 'danger';
    return 'info';
  };

  return (
    <PageLayout title="오늘의 보고서" showBack={true} showFooter={false}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Date + Farm header + 상세분석 버튼 */}
        <View style={styles.dateHeader}>
          <View>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
            <Text style={styles.farmName}>{farmInfo?.name || 'FarmSense'}</Text>
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => navigation.navigate('ReportList')}
            activeOpacity={0.7}
          >
            <Ionicons name="grid-outline" size={16} color="#FFFFFF" />
            <Text style={styles.detailBtnText}>상세분석</Text>
          </TouchableOpacity>
        </View>

        {/* Help toggle */}
        {showHelp && HELP[showHelp] && (
          <HelpCard
            id={HELP[showHelp].id}
            title={HELP[showHelp].title}
            body={HELP[showHelp].body}
            icon={HELP[showHelp].icon}
            iconColor={HELP[showHelp].iconColor}
            forceShow
          />
        )}

        {/* 1. 관개 */}
        <ReportSummaryCard
          title="관개 관리"
          icon="water"
          iconColor="#3B82F6"
          mainValue={report?.irrigation ? `CWSI ${report.irrigation.cwsi}` : undefined}
          subValue={report?.irrigation?.shouldIrrigate ? '오늘 관개 필요' : '관개 불필요'}
          riskLevel={getRisk(report?.irrigation?.stressLevel)}
          riskText={report?.irrigation?.shouldIrrigate ? '관개 필요' : '정상'}
          onPress={() => navigation.navigate('IrrigationDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'irrigation' ? null : 'irrigation')}
          loading={loading}
          error={!loading && !report?.irrigation}
        />

        {/* 2. 병해 진단 */}
        <ReportSummaryCard
          title="병해 진단"
          icon="scan"
          iconColor="#EF4444"
          mainValue={report?.diagnosis?.disease || undefined}
          subValue={report?.diagnosis ? `신뢰도 ${report.diagnosis.confidence}%` : undefined}
          riskLevel={getRisk(report?.diagnosis?.severity)}
          riskText={report?.diagnosis?.disease === '정상' ? '정상' : report?.diagnosis?.disease}
          onPress={() => navigation.navigate('DiagnosisDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'diagnosis' ? null : 'diagnosis')}
          loading={loading}
          error={!loading && !report?.diagnosis}
        />

        {/* 3. 병해 예측 */}
        <ReportSummaryCard
          title="병해 예측"
          icon="analytics"
          iconColor="#F59E0B"
          mainValue={report?.prediction ? `PMI ${report.prediction.pmi}` : undefined}
          subValue={report?.prediction?.sprayTiming}
          riskLevel={report?.prediction?.pmi && report.prediction.pmi > 0.6 ? 'warning' : 'safe'}
          riskText={report?.prediction?.growthStage}
          onPress={() => navigation.navigate('PredictionDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'prediction' ? null : 'prediction')}
          loading={loading}
          error={!loading && !report?.prediction}
        />

        {/* 4. DSS 알림 */}
        <ReportSummaryCard
          title="DSS 알림"
          icon="alert-circle"
          iconColor="#8B5CF6"
          mainValue={report?.dss ? `${report.dss.alertCount}건` : undefined}
          mainLabel="이상 감지"
          subValue={report?.dss?.lastAlert}
          riskLevel={getRisk(report?.dss?.maxSeverity)}
          riskText={report?.dss?.maxSeverity === 'warning' ? '주의' : '정상'}
          onPress={() => navigation.navigate('DSSDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'dss' ? null : 'dss')}
          loading={loading}
          error={!loading && !report?.dss}
        />

        {/* 5. 센서 현황 - 수치 타일 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>센서 현황</Text>
          <Text
            style={styles.seeAll}
            onPress={() => navigation.navigate('SensorDetail')}
          >
            전체 보기 &gt;
          </Text>
        </View>
        <View style={styles.sensorSection}>
          {sensorData?.temperature && (
            <SensorValueTile
              name="온도"
              value={sensorData.temperature.value}
              unit="°C"
              icon="thermometer-outline"
              status={sensorData.temperature.status}
              sensorType="temperature"
            />
          )}
          {sensorData?.humidity && (
            <SensorValueTile
              name="습도"
              value={sensorData.humidity.value}
              unit="%"
              icon="water-outline"
              status={sensorData.humidity.status}
              sensorType="humidity"
            />
          )}
          {sensorData?.soil_moisture && (
            <SensorValueTile
              name="토양수분"
              value={sensorData.soil_moisture.value}
              unit="%"
              icon="leaf-outline"
              status={sensorData.soil_moisture.status}
              sensorType="soil_moisture"
            />
          )}
          {sensorData?.co2 && (
            <SensorValueTile
              name="CO2"
              value={sensorData.co2.value}
              unit="ppm"
              icon="cloud-outline"
              status={sensorData.co2.status}
              sensorType="co2"
            />
          )}
        </View>

        {/* 6. 실시간 연결 */}
        <ReportSummaryCard
          title="실시간 연결"
          icon="pulse"
          iconColor="#10B981"
          mainValue={report?.realtime?.connected ? '연결됨' : '연결 끊김'}
          subValue={report?.realtime ? `마지막 수신: ${report.realtime.lastReceived}` : undefined}
          riskLevel={report?.realtime?.connected ? 'safe' : 'danger'}
          riskText={report?.realtime?.connected ? '정상' : '확인 필요'}
          onPress={() => navigation.navigate('RealtimeDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'realtime' ? null : 'realtime')}
          loading={loading}
          error={!loading && !report?.realtime}
        />

        {/* 7. 농약/살포 */}
        <ReportSummaryCard
          title="농약/살포 관리"
          icon="flask"
          iconColor="#EC4899"
          mainValue={report?.spray ? `D-${report.spray.daysRemaining}` : undefined}
          mainLabel="안전기간"
          subValue={report?.spray ? `MRL: ${report.spray.mrlStatus}` : undefined}
          riskLevel={report?.spray && report.spray.daysRemaining < 3 ? 'danger' : 'safe'}
          riskText={report?.spray?.mrlStatus}
          onPress={() => navigation.navigate('SprayDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'spray' ? null : 'spray')}
          loading={loading}
          error={!loading && !report?.spray}
        />

        {/* 8. GAP 비료 관리 */}
        <ReportSummaryCard
          title="GAP 비료 관리"
          icon="nutrition"
          iconColor="#059669"
          mainValue={report?.fertilizer ? `${report.fertilizer.complianceRate}%` : undefined}
          mainLabel="GAP 준수율"
          subValue={
            report?.fertilizer?.deficiencies && report.fertilizer.deficiencies.length > 0
              ? `결핍: ${report.fertilizer.deficiencies.join(', ')} · 추천: ${report.fertilizer.topRecommendation}`
              : report?.fertilizer ? '영양소 균형 양호' : undefined
          }
          riskLevel={
            !report?.fertilizer ? 'info' :
            report.fertilizer.complianceRate >= 90 ? 'safe' :
            report.fertilizer.complianceRate >= 70 ? 'caution' : 'warning'
          }
          riskText={
            !report?.fertilizer ? undefined :
            report.fertilizer.certStatus === 'ready' ? 'GAP 인증 가능' :
            report.fertilizer.certStatus === 'needs_improvement' ? '개선 필요' : '확인중'
          }
          onPress={() => navigation.navigate('FertilizerDetail')}
          onHelpPress={() => setShowHelp(showHelp === 'fertilizer' ? null : 'fertilizer')}
          loading={loading}
          error={!loading && !report?.fertilizer}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 14,
    color: colors.textSub,
  },
  farmName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  sensorSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});

export default TodayReportScreen;
