/**
 * 센서 타일 컴포넌트
 * Week 6 Day 4
 * 
 * 센서 데이터를 카드 형태로 표시하는 재사용 가능한 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FarmSenseColors, softShadow } from '../../theme/colors';

interface SensorTileProps {
  icon: string;
  title: string;
  value: number | null;
  unit: string;
  status?: 'normal' | 'warning' | 'danger';
  lastUpdate?: string;
}

const SensorTile: React.FC<SensorTileProps> = ({
  icon,
  title,
  value,
  unit,
  status = 'normal',
  lastUpdate,
}) => {
  // 상태별 색상
  const getStatusColor = () => {
    switch (status) {
      case 'danger':
        return FarmSenseColors.risk.high;    // 빨강
      case 'warning':
        return FarmSenseColors.risk.medium;  // 주황
      case 'normal':
      default:
        return FarmSenseColors.primary;      // 초록
    }
  };

  // 상태별 배경색
  const getStatusBackground = () => {
    switch (status) {
      case 'danger':
        return '#FEE2E2';  // 연한 빨강
      case 'warning':
        return '#FEF3C7';  // 연한 주황
      case 'normal':
      default:
        return '#D1FAE5';  // 연한 초록
    }
  };

  // 마지막 업데이트 시간 포맷
  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 초 단위
      
      if (diff < 60) return `${diff}초 전`;
      if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return '';
    }
  };

  return (
    <View style={[styles.container, softShadow]}>
      {/* 상태 표시 바 */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: getStatusColor() },
        ]}
      />

      {/* 아이콘 */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getStatusBackground() },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* 값 */}
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: getStatusColor() }]}>
          {value !== null ? value.toFixed(1) : '--'}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {/* 제목 */}
      <Text style={styles.title}>{title}</Text>

      {/* 마지막 업데이트 */}
      {lastUpdate && (
        <Text style={styles.lastUpdate}>
          {formatLastUpdate(lastUpdate)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
    position: 'relative',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unit: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
  },
  title: {
    fontSize: 14,
    color: FarmSenseColors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 11,
    color: FarmSenseColors.text.light,
  },
});

export default SensorTile;










