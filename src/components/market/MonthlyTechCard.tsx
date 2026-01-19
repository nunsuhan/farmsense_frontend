/**
 * MonthlyTechCard - 월간 농업기술 정보 카드
 * Week 7 Day 4
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FarmSenseColors } from '../../theme/colors';

interface TechInfo {
  title: string;
  content: string;
  month: number;
  crop: string;
}

interface MonthlyTechCardProps {
  techInfo: TechInfo[];
  month: number;
  isLoading?: boolean;
}

const MonthlyTechCard: React.FC<MonthlyTechCardProps> = ({
  techInfo,
  month,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>농업기술 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (!techInfo || techInfo.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 {month}월 농작업 정보</Text>
      </View>

      {techInfo.map((info, index) => (
        <View key={index} style={styles.techItem}>
          <View style={styles.bullet}>
            <Text style={styles.bulletText}>•</Text>
          </View>
          <View style={styles.techContent}>
            <Text style={styles.techTitle}>{info.title}</Text>
            <Text style={styles.techDescription}>{info.content}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: FarmSenseColors.card.background,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FarmSenseColors.text.primary,
  },
  techItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bullet: {
    width: 20,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 20,
    color: FarmSenseColors.primary,
    fontWeight: 'bold',
  },
  techContent: {
    flex: 1,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.primary,
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: FarmSenseColors.text.secondary,
  },
  loadingText: {
    fontSize: 16,
    color: FarmSenseColors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default MonthlyTechCard;










