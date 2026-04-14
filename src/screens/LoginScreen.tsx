console.log('### LoginScreen loaded ###');

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { authApi } from '../services/authApi';
import authService from '../services/authService';
import { setAuthTokens } from '../utils/secureStorage';

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function fmtTimer(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

// SMS 인증 단계
type PhoneStep = 'INPUT' | 'VERIFY';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setUser = useStore((state) => state.setUser);

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 휴대폰 인증 상태
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('INPUT');
  const [verifyCode, setVerifyCode] = useState('');
  const [seconds, setSeconds] = useState(0);

  // 인증 타이머
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  // 탭 전환 시 초기화
  const switchTab = (method: 'phone' | 'email') => {
    setLoginMethod(method);
    setPhoneStep('INPUT');
    setVerifyCode('');
    setSeconds(0);
  };

  // 이메일 로그인
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await authApi.login({ email, password });
      await new Promise(resolve => setTimeout(resolve, 300));
      const profile = await authApi.getFullProfile();
      await setUser(profile as any);
      navigation.reset({ index: 0, routes: [{ name: 'MainTab' }] });
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '이메일 또는 비밀번호를 확인해주세요.');
    }
    setLoading(false);
  };

  // 인증번호 전송 (알리고 SMS)
  const handleSendCode = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('알림', '휴대폰 번호를 정확히 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.sendPhoneCode(digits);
      if (res.success) {
        setPhoneStep('VERIFY');
        setSeconds(180);
        setVerifyCode('');
      } else {
        Alert.alert('전송 실패', res.error || '잠시 후 다시 시도해주세요.');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.error || e?.message || 'SMS 전송 실패');
    }
    setLoading(false);
  };

  // 인증번호 확인 & 로그인
  const handleVerifyCode = async () => {
    if (verifyCode.length !== 6) {
      Alert.alert('알림', '6자리 인증번호를 입력해주세요.');
      return;
    }
    const digits = phoneNumber.replace(/\D/g, '');
    setLoading(true);
    try {
      const res = await authService.verifyPhoneCode(digits, verifyCode);
      // 토큰 저장
      await setAuthTokens(res.token, res.token);
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        const profile = await authApi.getFullProfile();
        await setUser(profile as any);
      } catch {
        // 프로필 로드 실패해도 로그인은 진행
      }

      navigation.reset({ index: 0, routes: [{ name: 'MainTab' }] });
    } catch (e: any) {
      Alert.alert('인증 실패', e?.response?.data?.error || e?.message || '인증번호를 확인해주세요.');
    }
    setLoading(false);
  };

  // 인증번호 재전송
  const handleResend = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    try {
      await authService.sendPhoneCode(digits);
      setSeconds(180);
      setVerifyCode('');
      Alert.alert('알림', '인증번호를 재전송했습니다.');
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.error || '재전송 실패');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled">
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconPlaceholder}>🌱</Text>
          </View>
          <Text style={styles.title}>FarmSense</Text>
          <Text style={styles.subtitle}>스마트한 농장 관리의 시작</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'email' && styles.tabActive]}
            onPress={() => switchTab('email')}
          >
            <Text style={[styles.tabText, loginMethod === 'email' && styles.tabTextActive]}>이메일 로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'phone' && styles.tabActive]}
            onPress={() => switchTab('phone')}
          >
            <Text style={[styles.tabText, loginMethod === 'phone' && styles.tabTextActive]}>휴대폰 번호</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {loginMethod === 'email' ? (
            <>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="example@farmsense.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호 입력"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#1a1a2e" /> : (
                  <Text style={styles.primaryButtonText}>로그인</Text>
                )}
              </TouchableOpacity>
            </>
          ) : phoneStep === 'INPUT' ? (
            <>
              <Text style={styles.label}>휴대폰 번호</Text>
              <TextInput
                style={styles.input}
                placeholder="010-0000-0000"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                value={phoneNumber}
                onChangeText={(t) => setPhoneNumber(formatPhone(t))}
                maxLength={13}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#1a1a2e" /> : (
                  <Text style={styles.primaryButtonText}>인증번호 받기</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.phoneDisplay}>{phoneNumber}</Text>
              <Text style={styles.verifyDesc}>으로 전송된 인증번호를 입력해주세요</Text>

              {seconds > 0 && <Text style={styles.timer}>{fmtTimer(seconds)}</Text>}

              <Text style={styles.label}>인증번호 (6자리)</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                value={verifyCode}
                onChangeText={(t) => setVerifyCode(t.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.primaryButton, seconds <= 0 && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading || seconds <= 0}
              >
                {loading ? <ActivityIndicator color="#1a1a2e" /> : (
                  <Text style={styles.primaryButtonText}>확인</Text>
                )}
              </TouchableOpacity>

              <View style={styles.verifyActions}>
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>인증번호 재전송</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setPhoneStep('INPUT'); setVerifyCode(''); setSeconds(0); }}>
                  <Text style={styles.resendText}>번호 변경</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Signup & Forgot Password */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>처음이신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.signupSection}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.signupText, { textDecorationLine: 'underline', fontSize: 13 }]}>비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  innerContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  // 로고 섹션
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#252542',
    marginBottom: 16,
  },
  iconPlaceholder: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#252542',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#3B3B58',
  },
  tabText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // 폼 섹션
  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#252542',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  // 휴대폰 인증
  phoneDisplay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 4,
  },
  verifyDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  resendText: {
    color: '#9CA3AF',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  // 회원가입
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  signupText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  signupLink: {
    color: '#FFD700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
