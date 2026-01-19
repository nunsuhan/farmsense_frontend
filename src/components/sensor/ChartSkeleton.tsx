/**
 * 차트 스켈레톤 로딩 컴포넌트
 * - 데이터 로딩 중 표시
 * - 애니메이션 효과
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ChartSkeletonProps {
  height?: number;
}

export default function ChartSkeleton({ height = 220 }: ChartSkeletonProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 반짝이는 애니메이션 효과
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* 차트 영역 스켈레톤 */}
      <Animated.View style={[styles.chartArea, { opacity }]} />

      {/* 통계 카드들 스켈레톤 */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statCard, { opacity }]} />
        <Animated.View style={[styles.statCard, { opacity }]} />
        <Animated.View style={[styles.statCard, { opacity }]} />
        <Animated.View style={[styles.statCard, { opacity }]} />
      </View>

      {/* 기간 선택 버튼들 스켈레톤 */}
      <View style={styles.periodButtonsContainer}>
        {[1, 2, 3, 4].map((index) => (
          <Animated.View
            key={index}
            style={[styles.periodButton, { opacity }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartArea: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    height: 180,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: '23%',
    height: 50,
  },
  periodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    width: 70,
    height: 32,
  },
});









