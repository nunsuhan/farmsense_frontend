import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';
import PlanCard from '../../components/onboarding/PlanCard';

interface Props { onNext: () => void; }

export default function PlanStep({ onNext }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>무료 체험 시작</Text>
      <Text style={styles.desc}>2개월 동안 모든 기능을 무료로 사용해보세요</Text>

      <View style={{ marginTop: 24 }}><PlanCard /></View>

      <View style={styles.payInfo}>
        <View style={styles.row}><Text style={styles.payLabel}>오늘 결제</Text><Text style={styles.payValue}>0원</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.payLabel}>2개월 후</Text><Text style={styles.payValue2}>월 9,900원 자동결제</Text></View>
      </View>

      <Text style={styles.note}>• 체험 종료 3일 전 알림을 보내드립니다{'\n'}• 체험 중 해지 시 요금이 청구되지 않습니다</Text>

      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>카드 등록하고 무료 체험 시작</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: ONBOARDING.spacing.cardPadding, paddingTop: 60, backgroundColor: ONBOARDING.colors.bg, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: ONBOARDING.colors.text },
  desc: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 8 },
  payInfo: {
    marginTop: 24, padding: 18, borderRadius: 16,
    backgroundColor: ONBOARDING.colors.card,
    borderWidth: 1, borderColor: ONBOARDING.colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  payLabel: { fontSize: 14, color: ONBOARDING.colors.textSub },
  payValue: { fontSize: 18, fontWeight: '800', color: ONBOARDING.colors.primary },
  payValue2: { fontSize: 14, fontWeight: '600', color: ONBOARDING.colors.text },
  divider: { height: 1, backgroundColor: ONBOARDING.colors.border, marginVertical: 4 },
  note: { fontSize: 12, color: ONBOARDING.colors.textSub, marginTop: 16, lineHeight: 18 },
  btn: {
    marginTop: 28, backgroundColor: ONBOARDING.colors.primary,
    borderRadius: ONBOARDING.radius.button, paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
