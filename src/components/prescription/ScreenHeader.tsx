/**
 * 화면 헤더 컴포넌트 (Minimalist)
 * Week 6 Day 1
 * 
 * 기능:
 * - 농장 이름/위치 표시
 * - 알림 아이콘 (Phase 9 구현 예정)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FarmSenseColors } from '../../theme/colors';

interface ScreenHeaderProps {
  farmName?: string;
  location?: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  farmName = '영천 포도농장',
  location = '경북 영천시',
}) => {
  return (
    <View style={styles.container}>
      {/* 농장 정보 */}
      <View style={styles.leftSection}>
        <Text style={styles.farmName}>{farmName}</Text>
        <Text style={styles.location}>📍 {location}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: FarmSenseColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FarmSenseColors.card.border,
  },
  leftSection: {
    flex: 1,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FarmSenseColors.primaryDark,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
  },
});

export default ScreenHeader;






