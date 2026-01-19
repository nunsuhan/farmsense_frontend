/**
 * 처방 요약 카드 컴포넌트
 * Week 6 Day 1
 * 
 * 핵심: AI RAG의 가장 중요한 "오늘의 처방 한 줄"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FarmSenseColors, softShadow } from '../../theme/colors';

interface PrescriptionSummaryCardProps {
  summary: string;
  icon?: string;
}

const PrescriptionSummaryCard: React.FC<PrescriptionSummaryCardProps> = ({
  summary,
  icon = '💊',
}) => {
  return (
    <View style={[styles.container, softShadow]}>
      {/* 아이콘 */}
      <Text style={styles.icon}>{icon}</Text>
      
      {/* 처방 요약 */}
      <View style={styles.contentContainer}>
        <Text style={styles.label}>오늘의 처방</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
  },
  icon: {
    fontSize: 40,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: FarmSenseColors.primary,
    marginBottom: 6,
  },
  summary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: FarmSenseColors.text.primary,
    lineHeight: 24,
  },
});

export default PrescriptionSummaryCard;










