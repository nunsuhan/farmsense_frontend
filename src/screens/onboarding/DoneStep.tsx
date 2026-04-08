import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';

interface Props { onFinish: () => void; }

const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_xKxkxkx';

export default function DoneStep({ onFinish }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>

      <Text style={styles.title}>가입 완료!</Text>
      <Text style={styles.desc}>2개월 무료 체험이 시작되었습니다</Text>

      <View style={styles.steps}>
        <Step n={1} text="카카오 채널 추가" />
        <Step n={2} text="농장 정보 등록" />
        <Step n={3} text="포도밭 사진 보내기" />
      </View>

      <TouchableOpacity style={styles.kakaoBtn} onPress={() => Linking.openURL(KAKAO_CHANNEL_URL)} activeOpacity={0.85}>
        <Text style={styles.kakaoText}>💬  KakaoTalk 채널 추가하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onFinish} activeOpacity={0.85}>
        <Text style={styles.btnText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={s2.row}>
      <View style={s2.num}><Text style={s2.numText}>{n}</Text></View>
      <Text style={s2.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: ONBOARDING.spacing.cardPadding, paddingTop: 100, backgroundColor: ONBOARDING.colors.bg, alignItems: 'center' },
  checkCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: ONBOARDING.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 44, fontWeight: '900' },
  title: { fontSize: 28, fontWeight: '800', color: ONBOARDING.colors.text, marginTop: 24 },
  desc: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 8 },
  steps: { marginTop: 36, alignSelf: 'stretch', gap: 12 },
  kakaoBtn: {
    marginTop: 32, alignSelf: 'stretch',
    backgroundColor: '#FEE500', borderRadius: ONBOARDING.radius.button,
    paddingVertical: 16, alignItems: 'center',
  },
  kakaoText: { color: '#3C1E1E', fontSize: 15, fontWeight: '700' },
  btn: {
    marginTop: 12, alignSelf: 'stretch',
    backgroundColor: ONBOARDING.colors.primary,
    borderRadius: ONBOARDING.radius.button, paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

const s2 = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: ONBOARDING.colors.card, borderWidth: 1, borderColor: ONBOARDING.colors.border },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: ONBOARDING.colors.primary, alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#fff', fontWeight: '800' },
  text: { fontSize: 14, color: ONBOARDING.colors.text },
});
