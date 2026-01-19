// PesticideSafetyScreen - 농약 안전관리 화면
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenWrapper from '../components/common/ScreenWrapper';

interface SafetyRecord {
  id: number;
  pesticide_name: string;
  brand_name: string;
  application_date: string;
  phi_days: number;
  safe_harvest_date: string;
  days_remaining: number;
  is_safe: boolean;
  target_disease: string;
}

const PesticideSafetyScreen: React.FC = () => {
  const [records, setRecords] = useState<SafetyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSafetyRecords();
  }, []);

  const loadSafetyRecords = async () => {
    try {
      // TODO: 실제 API 연동
      // const response = await apiClient.get('/pesticide/safety/');

      // 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));

      const today = new Date();
      const dummyRecords: SafetyRecord[] = [
        {
          id: 1,
          pesticide_name: '디티아논',
          brand_name: '델란 입상수화제',
          application_date: '2025-11-25',
          phi_days: 14,
          safe_harvest_date: '2025-12-09',
          days_remaining: Math.max(0, Math.ceil((new Date('2025-12-09').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
          is_safe: new Date('2025-12-09') <= today,
          target_disease: '탄저병',
        },
        {
          id: 2,
          pesticide_name: '지베렐린',
          brand_name: '지베렐린산',
          application_date: '2025-11-20',
          phi_days: 7,
          safe_harvest_date: '2025-11-27',
          days_remaining: 0,
          is_safe: true,
          target_disease: '열매 비대',
        },
        {
          id: 3,
          pesticide_name: '만코제브',
          brand_name: '다이센 수화제',
          application_date: '2025-11-28',
          phi_days: 21,
          safe_harvest_date: '2025-12-19',
          days_remaining: Math.max(0, Math.ceil((new Date('2025-12-19').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
          is_safe: new Date('2025-12-19') <= today,
          target_disease: '노균병',
        },
      ];

      setRecords(dummyRecords);
    } catch (error) {
      console.error('농약 안전 기록 로드 실패:', error);
      Alert.alert('오류', '농약 안전 기록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSafetyRecords();
  };

  const getStatusColor = (days: number, isSafe: boolean) => {
    if (isSafe) return '#10B981'; // 안전 - 초록
    if (days <= 3) return '#EF4444'; // 위험 - 빨강
    if (days <= 7) return '#F59E0B'; // 주의 - 노랑
    return '#3B82F6'; // 대기 - 파랑
  };

  const getStatusText = (days: number, isSafe: boolean) => {
    if (isSafe) return '✅ 수확 가능';
    if (days <= 3) return `⚠️ ${days}일 남음`;
    if (days <= 7) return `🕐 ${days}일 남음`;
    return `📅 ${days}일 남음`;
  };

  const renderRecord = (record: SafetyRecord) => (
    <View
      key={record.id}
      style={[
        styles.recordCard,
        { borderLeftColor: getStatusColor(record.days_remaining, record.is_safe) }
      ]}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleRow}>
          <Text style={styles.pestName}>{record.pesticide_name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(record.days_remaining, record.is_safe) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(record.days_remaining, record.is_safe)}
            </Text>
          </View>
        </View>
        <Text style={styles.brandName}>{record.brand_name}</Text>
      </View>

      <View style={styles.recordBody}>
        <View style={styles.infoRow}>
          <Ionicons name="bug-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>대상 병해충:</Text>
          <Text style={styles.infoValue}>{record.target_disease}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>살포일:</Text>
          <Text style={styles.infoValue}>{record.application_date}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>PHI:</Text>
          <Text style={styles.infoValue}>{record.phi_days}일</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>안전 수확일:</Text>
          <Text style={[styles.infoValue, { fontWeight: '600' }]}>
            {record.safe_harvest_date}
          </Text>
        </View>
      </View>
    </View>
  );

  const unsafeCount = records.filter(r => !r.is_safe).length;
  const safeCount = records.filter(r => r.is_safe).length;

  return (
    <ScreenWrapper title="농약 안전관리">
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>안전 기록을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 요약 카드 */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>🛡️ PHI 안전 현황</Text>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.summaryNumber, { color: '#DC2626' }]}>{unsafeCount}</Text>
                <Text style={styles.summaryLabel}>수확 대기</Text>
              </View>
              <View style={[styles.summaryItem, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.summaryNumber, { color: '#059669' }]}>{safeCount}</Text>
                <Text style={styles.summaryLabel}>수확 가능</Text>
              </View>
            </View>

            {unsafeCount > 0 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  {unsafeCount}건의 농약이 아직 안전 기간 중입니다.
                </Text>
              </View>
            )}
          </View>

          {/* PHI 안내 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ PHI란?</Text>
            <Text style={styles.infoDescription}>
              PHI(Pre-Harvest Interval)는 수확 전 마지막 농약 살포 후 수확까지 반드시 지켜야 하는 안전 기간입니다.
              이 기간을 준수해야 농산물 안전성이 보장됩니다.
            </Text>
          </View>

          {/* 기록 목록 */}
          <Text style={styles.sectionTitle}>📋 최근 농약 살포 기록</Text>

          {records.length > 0 ? (
            records.map(renderRecord)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="flask-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>등록된 농약 살포 기록이 없습니다.</Text>
              <Text style={styles.emptySubtext}>
                농약 기록 메뉴에서 살포 기록을 추가해주세요.
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recordTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  brandName: {
    fontSize: 13,
    color: '#6B7280',
  },
  recordBody: {
    padding: 16,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    width: 90,
  },
  infoValue: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PesticideSafetyScreen;





