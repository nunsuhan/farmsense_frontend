import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';
import { BUSINESS_INFO } from '../../constants/config';
import PlanCard from '../../components/onboarding/PlanCard';

type PlanType = 'monthly' | 'yearly';

interface Props { onNext: (plan: PlanType) => void; }

export default function PlanStep({ onNext }: Props) {
  const [plan, setPlan] = useState<PlanType>('monthly');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>무료 체험 시작</Text>
      <Text style={styles.desc}>2개월 동안 모든 기능을 무료로 사용해보세요</Text>

      {/* 요금제 선택 탭 */}
      <View style={styles.planToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, plan === 'monthly' && styles.toggleBtnActive]}
          onPress={() => setPlan('monthly')}
        >
          <Text style={[styles.toggleText, plan === 'monthly' && styles.toggleTextActive]}>월간</Text>
          <Text style={[styles.togglePrice, plan === 'monthly' && styles.toggleTextActive]}>10,000원/월</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, plan === 'yearly' && styles.toggleBtnActive]}
          onPress={() => setPlan('yearly')}
        >
          <Text style={[styles.toggleText, plan === 'yearly' && styles.toggleTextActive]}>연간</Text>
          <Text style={[styles.togglePrice, plan === 'yearly' && styles.toggleTextActive]}>100,000원/년</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}><PlanCard plan={plan} /></View>

      <View style={styles.payInfo}>
        <View style={styles.row}><Text style={styles.payLabel}>오늘 결제</Text><Text style={styles.payValue}>0원</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.payLabel}>2개월 후</Text>
          <Text style={styles.payValue2}>
            {plan === 'monthly' ? '월 10,000원 자동결제' : '년 100,000원 자동결제'}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>
        • 체험 종료 3일 전 알림을 보내드립니다{'\n'}
        • 체험 중 해지 시 요금이 청구되지 않습니다
      </Text>

      <TouchableOpacity style={styles.btn} onPress={() => onNext(plan)} activeOpacity={0.85}>
        <Text style={styles.btnText}>카드 등록하고 무료 체험 시작</Text>
      </TouchableOpacity>

      {/* 사업자 정보 (카드사 등록 심사 필수) */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>상호: {BUSINESS_INFO.COMPANY_NAME}</Text>
        <Text style={styles.footerText}>대표자: {BUSINESS_INFO.REPRESENTATIVE}</Text>
        {BUSINESS_INFO.BUSINESS_NUMBER ? (
          <Text style={styles.footerText}>사업자등록번호: {BUSINESS_INFO.BUSINESS_NUMBER}</Text>
        ) : null}
        {BUSINESS_INFO.ADDRESS ? (
          <Text style={styles.footerText}>주소: {BUSINESS_INFO.ADDRESS}</Text>
        ) : null}
        <Text style={styles.footerText}>전화: {BUSINESS_INFO.PHONE}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: ONBOARDING.spacing.cardPadding, paddingTop: 60, backgroundColor: ONBOARDING.colors.bg, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: ONBOARDING.colors.text },
  desc: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 8 },
  planToggle: {
    flexDirection: 'row', marginTop: 24, gap: 10,
    backgroundColor: ONBOARDING.colors.card,
    borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: ONBOARDING.colors.border,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: ONBOARDING.colors.primary,
  },
  toggleText: { fontSize: 14, fontWeight: '700', color: ONBOARDING.colors.textSub },
  togglePrice: { fontSize: 12, color: ONBOARDING.colors.textSub, marginTop: 2 },
  toggleTextActive: { color: '#fff' },
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
  footer: {
    marginTop: 32, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: ONBOARDING.colors.border,
  },
  footerText: { fontSize: 11, color: ONBOARDING.colors.textSub, lineHeight: 18 },
});
