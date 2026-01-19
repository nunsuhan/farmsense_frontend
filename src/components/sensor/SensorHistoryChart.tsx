/**
 * 센서 히스토리 차트 컴포넌트
 * Week 7 Day 2
 * 
 * 센서 데이터의 시간별 변화 추이를 시각화
 * 
 * Features:
 * - LineChart (react-native-chart-kit)
 * - 기간 선택 (1h, 6h, 24h, 7d)
 * - 통계 표시 (max, min, avg)
 * - 자동 리프레시
 * - 로딩/에러 상태
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FarmSenseColors } from '../../theme/colors';
import { getSensorHistory, getSensorStats, SensorHistoryEntry, SensorStats } from '../../services/sensorApi';
import ChartSkeleton from './ChartSkeleton';

const screenWidth = Dimensions.get('window').width;

interface SensorHistoryChartProps {
  sensorType: 'temperature' | 'humidity' | 'soil_moisture' | 'co2';
  sensorTypeKr: string;
  icon: string;
  defaultPeriod?: '1h' | '6h' | '24h' | '7d' | '30d';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// 기간 옵션
const PERIOD_OPTIONS = [
  { value: '1h', label: '1시간' },
  { value: '6h', label: '6시간' },
  { value: '24h', label: '24시간' },
  { value: '7d', label: '7일' },
];

export const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({
  sensorType,
  sensorTypeKr,
  icon,
  defaultPeriod = '24h',
  autoRefresh = false,
  refreshInterval = 60000, // 1분
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod);
  const [historyData, setHistoryData] = useState<SensorHistoryEntry[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드 (기존 데이터 유지 방식)
  const loadData = async () => {
    try {
      // 첫 로드가 아니면 로딩 표시하지 않음 (기존 데이터 유지)
      const isFirstLoad = historyData.length === 0 && stats === null;
      if (isFirstLoad) {
        setLoading(true);
      }
      setError(null);

      // 히스토리와 통계 동시 조회 (병렬 처리로 속도 최적화)
      const [historyResponse, statsResponse] = await Promise.all([
        getSensorHistory(sensorType, selectedPeriod),
        getSensorStats(sensorType, selectedPeriod),
      ]);

      if (historyResponse.success && historyResponse.data.length > 0) {
        setHistoryData(historyResponse.data);
      } else {
        // 첫 로드일 때만 빈 배열로 설정
        if (isFirstLoad) {
          setHistoryData([]);
          setError('데이터가 없습니다.');
        }
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (err: any) {
      console.error('센서 히스토리 로드 실패:', err);
      // 첫 로드일 때만 에러 표시
      if (historyData.length === 0) {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadData();
  }, [sensorType, selectedPeriod]);

  // 자동 리프레시
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, sensorType, selectedPeriod]);

  // 차트 데이터 준비
  const chartData = React.useMemo(() => {
    if (historyData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    // 최대 12개 레이블만 표시 (가독성)
    const maxLabels = 12;
    const step = Math.max(1, Math.floor(historyData.length / maxLabels));

    const labels: string[] = [];
    const values: number[] = [];

    historyData.forEach((entry, index) => {
      values.push(entry.value);

      // 일정 간격으로만 레이블 표시
      if (index % step === 0 || index === historyData.length - 1) {
        const date = new Date(entry.timestamp);
        
        // 기간에 따라 레이블 형식 변경
        if (selectedPeriod === '1h' || selectedPeriod === '6h') {
          labels.push(date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        } else if (selectedPeriod === '24h') {
          labels.push(date.toLocaleTimeString('ko-KR', { hour: '2-digit' }));
        } else {
          labels.push(date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }));
        }
      } else {
        labels.push('');
      }
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => FarmSenseColors.primary,
          strokeWidth: 2,
        },
      ],
    };
  }, [historyData, selectedPeriod]);

  // 차트 설정
  const chartConfig = {
    backgroundColor: FarmSenseColors.white,
    backgroundGradientFrom: FarmSenseColors.white,
    backgroundGradientTo: FarmSenseColors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Primary color
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: FarmSenseColors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // 실선
      stroke: FarmSenseColors.border,
      strokeWidth: 0.5,
    },
  };

  // 렌더링: 첫 로드 시에만 스켈레톤 표시
  if (loading && historyData.length === 0 && stats === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{icon} {sensorTypeKr} 변화 추이</Text>
        </View>
        <ChartSkeleton height={300} />
      </View>
    );
  }

  if (error && historyData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{icon} {sensorTypeKr} 변화 추이</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{icon} {sensorTypeKr} 변화 추이</Text>
        <View style={styles.headerRight}>
          {loading && <ActivityIndicator size="small" color={FarmSenseColors.primary} style={styles.headerLoader} />}
          <TouchableOpacity onPress={loadData} disabled={loading}>
            <Text style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 기간 선택 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.periodSelector}
      >
        {PERIOD_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.periodButton,
              selectedPeriod === option.value && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(option.value)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === option.value && styles.periodButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 통계 */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>최고</Text>
            <Text style={styles.statValue}>{stats.max}{stats.unit}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>최저</Text>
            <Text style={styles.statValue}>{stats.min}{stats.unit}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>평균</Text>
            <Text style={styles.statValue}>{stats.avg}{stats.unit}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>현재</Text>
            <Text style={[styles.statValue, styles.statValueCurrent]}>
              {stats.current}{stats.unit}
            </Text>
          </View>
        </View>
      )}

      {/* 차트 */}
      {historyData.length > 0 && chartData.datasets[0].data.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={Math.max(screenWidth - 40, chartData.labels.length * 40)}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines
            withVerticalLines
            withHorizontalLines
            withDots
            withShadow={false}
            fromZero={false}
          />
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>표시할 데이터가 없습니다</Text>
        </View>
      )}

      {/* 데이터 개수 표시 */}
      {historyData.length > 0 && (
        <Text style={styles.dataCount}>
          {historyData.length}개 데이터 포인트
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: FarmSenseColors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: FarmSenseColors.textDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLoader: {
    marginRight: 4,
  },
  refreshButton: {
    fontSize: 20,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: FarmSenseColors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: FarmSenseColors.border,
  },
  periodButtonActive: {
    backgroundColor: FarmSenseColors.primary,
    borderColor: FarmSenseColors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: FarmSenseColors.textLight,
  },
  periodButtonTextActive: {
    color: FarmSenseColors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: FarmSenseColors.background,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: FarmSenseColors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: FarmSenseColors.textDark,
  },
  statValueCurrent: {
    color: FarmSenseColors.primary,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dataCount: {
    textAlign: 'center',
    fontSize: 12,
    color: FarmSenseColors.textLight,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: FarmSenseColors.textLight,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: FarmSenseColors.danger,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: FarmSenseColors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: FarmSenseColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 14,
    color: FarmSenseColors.textLight,
  },
});

export default SensorHistoryChart;

