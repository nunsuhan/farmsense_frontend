import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';
import authService from '../../services/authService';

interface Props {
  plan: 'monthly' | 'yearly';
  onCheckout: (checkoutUrl: string, successUrl: string, failUrl: string, customerKey: string) => void;
}

export default function CardStep({ plan, onCheckout }: Props) {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const priceText = plan === 'monthly' ? '월 10,000원' : '년 100,000원';

  const start = async () => {
    if (!agree) {
      Alert.alert('알림', '이용약관에 동의해주세요');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.createCheckout(plan);
      onCheckout(res.checkout_url, res.success_url, res.fail_url, res.customer_key);
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.error || '결제창 연결 실패');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>결제 카드 등록</Text>
      <Text style={styles.desc}>토스페이먼츠 보안 결제창에서{'\n'}카드를 안전하게 등록합니다</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLine}>• 2개월 무료 체험 후 {priceText} 자동 결제</Text>
        <Text style={styles.infoLine}>• 체험 중 해지 시 무료</Text>
        <Text style={styles.infoLine}>• 결제 정보는 토스페이먼츠가 안전 관리</Text>
      </View>

      <TouchableOpacity style={styles.checkRow} onPress={() => setAgree(!agree)}>
        <View style={[styles.check, agree && styles.checkOn]}>
          {agree && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.checkText}>이용약관 및 개인정보처리방침에 동의합니다</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, !agree && styles.btnDisabled]} onPress={start} disabled={loading || !agree} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>카드 등록하기</Text>}
      </TouchableOpacity>

      <Text style={styles.lock}>🔒  토스페이먼츠 보안 결제</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: ONBOARDING.spacing.cardPadding, paddingTop: 80, backgroundColor: ONBOARDING.colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: ONBOARDING.colors.text },
  desc: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 8, lineHeight: 20 },
  infoBox: {
    marginTop: 28, padding: 18, borderRadius: 16,
    backgroundColor: ONBOARDING.colors.primaryLight + '55',
    borderWidth: 1, borderColor: ONBOARDING.colors.primaryLight,
  },
  infoLine: { fontSize: 13, color: ONBOARDING.colors.primaryDark, marginVertical: 3 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 10 },
  check: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: ONBOARDING.colors.border, alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { backgroundColor: ONBOARDING.colors.primary, borderColor: ONBOARDING.colors.primary },
  checkMark: { color: '#fff', fontWeight: '800', fontSize: 14 },
  checkText: { fontSize: 13, color: ONBOARDING.colors.text, flex: 1 },
  btn: {
    marginTop: 24, backgroundColor: ONBOARDING.colors.primary,
    borderRadius: ONBOARDING.radius.button, paddingVertical: 16, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#B0B0B0' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  lock: { textAlign: 'center', marginTop: 16, color: ONBOARDING.colors.textSub, fontSize: 12 },
});
