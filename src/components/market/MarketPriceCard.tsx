/**
 * MarketPriceCard - 시장 가격 정보 카드
 * Week 7 Day 4
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FarmSenseColors } from '../../theme/colors';

interface MarketPriceCardProps {
  wholesalePrice: number;
  wholesaleChange: number;
  retailPrice: number;
  retailChange: number;
  trend: 'rising' | 'falling' | 'stable';
  recommendation: string;
  isLoading?: boolean;
}

const MarketPriceCard: React.FC<MarketPriceCardProps> = ({
  wholesalePrice,
  wholesaleChange,
  retailPrice,
  retailChange,
  trend,
  recommendation,
  isLoading = false,
}) => {
  // 가격 변동 아이콘
  const getPriceIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  // 가격 변동 색상
  const getPriceColor = (change: number) => {
    if (change > 0) return FarmSenseColors.success;
    if (change < 0) return FarmSenseColors.error;
    return FarmSenseColors.text.secondary;
  };

  // 트렌드 아이콘
  const getTrendIcon = () => {
    switch (trend) {
      case 'rising':
        return '📈';
      case 'falling':
        return '📉';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>시장 정보 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 오늘의 포도 시세</Text>
        <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
      </View>

      <View style={styles.pricesContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>도매</Text>
          <View style={styles.priceValue}>
            <Text style={styles.priceAmount}>
              {wholesalePrice.toLocaleString()}원
            </Text>
            <Text style={[styles.priceChange, { color: getPriceColor(wholesaleChange) }]}>
              {getPriceIcon(wholesaleChange)} {Math.abs(wholesaleChange).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>소매</Text>
          <View style={styles.priceValue}>
            <Text style={styles.priceAmount}>
              {retailPrice.toLocaleString()}원
            </Text>
            <Text style={[styles.priceChange, { color: getPriceColor(retailChange) }]}>
              {getPriceIcon(retailChange)} {Math.abs(retailChange).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationIcon}>💡</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FarmSenseColors.text.primary,
  },
  trendIcon: {
    fontSize: 24,
  },
  pricesContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FarmSenseColors.card.border,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: FarmSenseColors.text.secondary,
  },
  priceValue: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FarmSenseColors.text.primary,
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationContainer: {
    flexDirection: 'row',
    backgroundColor: FarmSenseColors.info + '15',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: FarmSenseColors.text.primary,
  },
  loadingText: {
    fontSize: 16,
    color: FarmSenseColors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default MarketPriceCard;










