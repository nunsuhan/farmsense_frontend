/**
 * 위험도 게이지 컴포넌트 (Circular Gauge)
 * Week 6 Day 1: 간단한 버전 (애니메이션 제거)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FarmSenseColors, getRiskColor, getRiskText, neumorphismShadow } from '../../theme/colors';

interface RiskGaugeProps {
  title: string;
  score: number;
  subtitle?: string;
  size?: 'small' | 'large';
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ 
  title, 
  score, 
  subtitle,
  size = 'large' 
}) => {
  const riskColor = getRiskColor(score);
  const riskText = getRiskText(score);
  const gaugeSize = size === 'large' ? 180 : 120;
  const fontSize = size === 'large' ? 48 : 32;

  return (
    <View style={[styles.container, neumorphismShadow]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {/* 간단한 원형 게이지 */}
      <View style={[
        styles.gauge,
        { 
          width: gaugeSize, 
          height: gaugeSize,
          borderColor: riskColor,
          borderWidth: 8
        }
      ]}>
        <Text style={[styles.score, { fontSize, color: riskColor }]}>
          {Math.round(score)}
        </Text>
        <Text style={styles.unit}>점</Text>
      </View>

      <Text style={[styles.status, { color: riskColor }]}>
        {riskText}
      </Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: FarmSenseColors.textPrimary,
  },
  gauge: {
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FarmSenseColors.background,
    marginBottom: 16,
  },
  score: {
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    color: FarmSenseColors.textSecondary,
    marginTop: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: FarmSenseColors.textSecondary,
    textAlign: 'center',
  },
});

export default RiskGauge;
