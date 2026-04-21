import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';
import CodeInput from '../../components/onboarding/CodeInput';
import authService from '../../services/authService';
interface Props {
  phone: string;
  onNext: (token: string, refresh: string) => void;
}
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
export default function VerifyStep({ phone, onNext }: Props) {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(180);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const verify = async () => {
    if (code.length !== 6) {
      Alert.alert('알림', '6자리 인증번호를 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyPhoneCode(phone, code);
      onNext(res.token, res.refresh);
    } catch (e: any) {
      Alert.alert('인증 실패', e?.response?.data?.error || '인증번호를 확인해주세요');
    }
    setLoading(false);
  };
  const resend = async () => {
    try {
      await authService.sendPhoneCode(phone);
      setSeconds(180);
      setCode('');
      Alert.alert('알림', '인증번호를 재전송했습니다');
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.error || '재전송 실패');
    }
  };
  const display = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>인증번호 입력</Text>
      <Text style={styles.desc}>{display}으로{'\n'}전송된 6자리 번호를 입력해주세요</Text>
      <Text style={styles.timer}>{fmt(seconds)}</Text>
      <View style={{ marginTop: 8 }}>
        <CodeInput value={code} onChange={setCode} />
      </View>
      <TouchableOpacity style={styles.btn} onPress={verify} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>확인</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={resend}>
        <Text style={styles.resend}>인증번호 재전송</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: ONBOARDING.spacing.cardPadding, paddingTop: 80, backgroundColor: ONBOARDING.colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: ONBOARDING.colors.text },
  desc: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 8, lineHeight: 20 },
  timer: { fontSize: 20, fontWeight: '700', color: ONBOARDING.colors.primary, marginTop: 28, textAlign: 'center' },
  btn: {
    marginTop: 32, backgroundColor: ONBOARDING.colors.primary,
    borderRadius: ONBOARDING.radius.button, paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resend: { textAlign: 'center', marginTop: 16, color: ONBOARDING.colors.textSub, textDecorationLine: 'underline' },
});
