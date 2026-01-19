/**
 * 센서 값 그리드 컴포넌트
 * Week 6 Day 1 (Day 4에서 센서 연동 예정)
 * 
 * 핵심: 실시간 센서 데이터를 컴팩트 카드로 표시
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FarmSenseColors, softShadow } from '../../theme/colors';

interface SensorData {
  type: string;
  icon: string;
  value: number | null;
  unit: string;
  color: string;
}

interface SensorValueGridProps {
  sensors: SensorData[];
}

const SensorValueGrid: React.FC<SensorValueGridProps> = ({ sensors }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🌡️ 실시간 센서</Text>
      
      <View style={styles.grid}>
        {sensors.map((sensor, index) => (
          <View key={index} style={[styles.card, softShadow]}>
            {/* 아이콘 */}
            <Text style={styles.icon}>{sensor.icon}</Text>
            
            {/* 값 */}
            <Text style={[styles.value, { color: sensor.color }]}>
              {sensor.value !== null ? sensor.value.toFixed(1) : '--'}
            </Text>
            
            {/* 단위 */}
            <Text style={styles.unit}>{sensor.unit}</Text>
            
            {/* 타입 */}
            <Text style={styles.type}>{sensor.type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FarmSenseColors.text.primary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unit: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    color: FarmSenseColors.text.light,
  },
});

export default SensorValueGrid;










