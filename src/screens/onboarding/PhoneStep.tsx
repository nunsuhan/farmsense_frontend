import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';
import authService from '../../services/authService';

interface Props {
  onNext: (phone: string) => void;
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function PhoneStep({ onNext }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('알림', '휴대폰 번호를 정확히 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.sendPhoneCode(digits);
      if (res.success) onNext(digits);
      else Alert.alert('전송 실패', res.error || '잠시 후 다시 시도해주세요');
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.error || '서버 연결 실패');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>휴대폰 번호 입력</Text>
      <Text style={styles.desc}>본인 확인을 위해 인증번호를 보내드립니다</Text>

      <TextInput
        style={styles.input}
        placeholder="010-0000-0000"
        placeholderTextColor="#B0B0B0"
        keyboardType="number-pad"
        value={phone}
        onChangeText={(t) => setPhone(formatPhone(t))}
        maxLength={13}
      />

      <TouchableOpacity style={styles.btn} onPress={send} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>인증번호 받기</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: ONBOARDING.spacing.cardPadding, paddingTop: 80, backgroundColor: ONBOARDING.colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: ONBOARDING.colors.text },
  desc: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 8 },
  input: {
    marginTop: 32, backgroundColor: ONBOARDING.colors.inputBg,
    borderWidth: 1.5, borderColor: ONBOARDING.colors.border,
    borderRadius: ONBOARDING.radius.input, paddingVertical: 18,
    fontSize: 20, textAlign: 'center', color: ONBOARDING.colors.text,
  },
  btn: {
    marginTop: 24, backgroundColor: ONBOARDING.colors.primary,
    borderRadius: ONBOARDING.radius.button, paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
