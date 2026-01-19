/**
 * PHI 타임라인 카드 컴포넌트
 * Week 7 Day 2: 농약 살포 기록 및 수확 가능일 표시
 * 
 * 핵심 기능:
 * - 최근 농약 살포 기록 타임라인
 * - 수확 가능/불가능 상태 표시
 * - PHI 잔여 일수 표시
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FarmSenseColors, neumorphismShadow } from '../../theme/colors';

interface PHIRecord {
  pesticide_name: string;
  application_date: string;
  safe_harvest_date: string;
  phi_days: number;
  days_until_safe: number;
  is_safe: boolean;
  status: string;
}

interface PHITimelineCardProps {
  canHarvestNow: boolean;
  earliestSafeDate: string | null;
  timeline: PHIRecord[];
  isLoading?: boolean;
}

const PHITimelineCard: React.FC<PHITimelineCardProps> = ({
  canHarvestNow,
  earliestSafeDate,
  timeline,
  isLoading = false,
}) => {
  // 수확 가능 여부에 따른 색상
  const statusColor = canHarvestNow ? FarmSenseColors.primary : FarmSenseColors.error;

  if (isLoading) {
    return (
      <View style={[styles.card, neumorphismShadow]}>
        <Text style={styles.title}>🌿 농약 안전 관리 (PHI)</Text>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (timeline.length === 0) {
    return (
      <View style={[styles.card, neumorphismShadow]}>
        <Text style={styles.title}>🌿 농약 안전 관리 (PHI)</Text>
        <Text style={styles.emptyText}>최근 농약 살포 기록이 없습니다.</Text>
        <Text style={[styles.harvestStatus, { color: FarmSenseColors.primary }]}>
          ✅ 수확 가능
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, neumorphismShadow]}>
      <View style={styles.header}>
        <Text style={styles.title}>🌿 농약 안전 관리 (PHI)</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>
            {canHarvestNow ? '수확가능' : '대기중'}
          </Text>
        </View>
      </View>

      {!canHarvestNow && earliestSafeDate && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ 안전 수확일: {new Date(earliestSafeDate).toLocaleDateString('ko-KR')}
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.timeline}
        showsVerticalScrollIndicator={false}
      >
        {timeline.map((record, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineHeader}>
              <Text style={styles.pesticideName} numberOfLines={1}>
                {record.pesticide_name}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: record.is_safe ? FarmSenseColors.primary : FarmSenseColors.warning }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {record.is_safe ? '✅' : `⏳ ${record.days_until_safe}일`}
                </Text>
              </View>
            </View>

            <View style={styles.timelineDetails}>
              <Text style={styles.detailText}>
                살포일: {new Date(record.application_date).toLocaleDateString('ko-KR')}
              </Text>
              <Text style={styles.detailText}>
                안전일: {new Date(record.safe_harvest_date).toLocaleDateString('ko-KR')}
              </Text>
            </View>

            {/* PHI 진행 바 */}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: record.is_safe ? '100%' : `${Math.min(100, ((record.phi_days - record.days_until_safe) / record.phi_days) * 100)}%`,
                    backgroundColor: record.is_safe ? FarmSenseColors.primary : FarmSenseColors.warning
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 PHI(Pre-Harvest Interval): 농약 살포 후 수확까지 대기 기간
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: FarmSenseColors.warning,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  timeline: {
    maxHeight: 300,
  },
  timelineItem: {
    backgroundColor: FarmSenseColors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pesticideName: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  timelineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: FarmSenseColors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FarmSenseColors.card.border,
  },
  footerText: {
    fontSize: 11,
    color: FarmSenseColors.text.secondary,
    lineHeight: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: FarmSenseColors.text.secondary,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: FarmSenseColors.text.secondary,
    marginVertical: 20,
  },
  harvestStatus: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default PHITimelineCard;

