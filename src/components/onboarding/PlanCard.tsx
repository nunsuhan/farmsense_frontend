import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';

const FEATURES = [
  'AI 이미지 분석 무제한',
  '실시간 생육·병해 판단',
  '주간 영농 리포트',
  '센서 데이터 자동 연동',
  '시즌 종합 보고서',
];

export default function PlanCard() {
  return (
    <View style={styles.card}>
      <View style={styles.badge}><Text style={styles.badgeText}>추천</Text></View>
      <Text style={styles.name}>프로 플랜</Text>
      <Text style={styles.price}>9,900원<Text style={styles.unit}>/월</Text></Text>
      <View style={{ height: 16 }} />
      {FEATURES.map((f) => (
        <View key={f} style={styles.featRow}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.featText}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2, borderColor: ONBOARDING.colors.primary,
    backgroundColor: ONBOARDING.colors.primaryLight + '55',
    borderRadius: ONBOARDING.radius.card, padding: 24, position: 'relative',
  },
  badge: {
    position: 'absolute', top: -12, right: 20,
    backgroundColor: ONBOARDING.colors.primary,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: ONBOARDING.radius.badge,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: ONBOARDING.colors.primaryDark },
  price: { fontSize: 32, fontWeight: '800', color: ONBOARDING.colors.text, marginTop: 4 },
  unit: { fontSize: 16, fontWeight: '500', color: ONBOARDING.colors.textSub },
  featRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, gap: 10 },
  check: { color: ONBOARDING.colors.primary, fontWeight: '800', fontSize: 16 },
  featText: { fontSize: 14, color: ONBOARDING.colors.text },
});
