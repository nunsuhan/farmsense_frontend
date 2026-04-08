import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';
import OnboardingLogo from '../../components/onboarding/OnboardingLogo';

interface Props { onNext: () => void; }

const SAMPLES = [
  { icon: '🍇', title: '오늘 오후 봉지 제거하세요', sub: '만코제브 건조 완료, 내일 맑음' },
  { icon: '💧', title: '관수량 50% 감량', sub: '착색률 38%, 당도 목표 근접' },
  { icon: '⚠️', title: '노균병 주의', sub: '연속 고습 8시간 감지' },
];

export default function WelcomeStep({ onNext }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ marginBottom: 32 }}><OnboardingLogo /></View>

      <Text style={styles.title}>내 포도밭 전담{'\n'}AI 농업 비서</Text>
      <Text style={styles.desc}>
        사진 한 장이면 생육 진단부터{'\n'}봉지 제거, 관수, 방제 타이밍까지{'\n'}구체적으로 알려드립니다
      </Text>

      <View style={{ marginTop: 28, gap: 12 }}>
        {SAMPLES.map((s) => (
          <View key={s.title} style={styles.sample}>
            <Text style={styles.sampleIcon}>{s.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sampleTitle}>{s.title}</Text>
              <Text style={styles.sampleSub}>{s.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>시작하기</Text>
      </TouchableOpacity>

      <Text style={styles.trial}>2개월 무료 체험</Text>
      <Text style={styles.trialSub}>이후 월 9,900원</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: ONBOARDING.spacing.cardPadding, paddingTop: 60, backgroundColor: ONBOARDING.colors.bg, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', color: ONBOARDING.colors.text, lineHeight: 36 },
  desc: { fontSize: 15, color: ONBOARDING.colors.textSub, marginTop: 12, lineHeight: 22 },
  sample: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: ONBOARDING.colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: ONBOARDING.colors.border,
  },
  sampleIcon: { fontSize: 24 },
  sampleTitle: { fontSize: 14, fontWeight: '700', color: ONBOARDING.colors.text },
  sampleSub: { fontSize: 12, color: ONBOARDING.colors.textSub, marginTop: 2 },
  btn: {
    marginTop: 32, backgroundColor: ONBOARDING.colors.primary,
    borderRadius: ONBOARDING.radius.button, paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  trial: { textAlign: 'center', marginTop: 20, color: ONBOARDING.colors.accent, fontWeight: '700' },
  trialSub: { textAlign: 'center', color: ONBOARDING.colors.textSub, fontSize: 12, marginTop: 4 },
});
