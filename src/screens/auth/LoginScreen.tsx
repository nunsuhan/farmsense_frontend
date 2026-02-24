/**
 * v5 LoginScreen - 이메일 로그인 + 구글/카카오 소셜 로그인
 * 소셜 로그인: Linking(Primary) + WebBrowser(Secondary) 이중 처리
 *
 * Fix: Chrome Custom Tab이 커스텀 스킴 리다이렉트를 감지 못하는 문제 해결
 * - Linking 이벤트 핸들러가 Primary로 딥링크 콜백 처리
 * - WebBrowser 결과는 Secondary로 처리 (Chrome Custom Tab이 잡아주면 bonus)
 * - socialLoginHandledRef로 이중 처리 방지
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// WebBrowser 제거 - Android에서 openAuthSessionAsync가 커스텀 스킴 콜백 못 잡음
// Linking.openURL + intent:// URL 방식으로 전환
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../store/useStore';
import { authApi, saveTokens } from '../../services/authApi';
import { colors } from '../../theme/colors';
import { API_CONFIG } from '../../constants/config';
import { GoogleLogo, KakaoLogo } from '../../components/icons/SocialLoginIcons';

const REDIRECT_URI = 'farmsense://auth/callback';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const setUser = useStore((s) => s.setUser);
  const setHasSeenOnboarding = useStore((s) => s.setHasSeenOnboarding);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  // 소셜 로그인 콜백 이중 처리 방지용 ref
  const socialLoginHandledRef = useRef(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetLoading = useCallback((val: boolean) => {
    if (mountedRef.current) setLoading(val);
  }, []);

  /**
   * 로그인 완료 후 프로필 로딩 → setUser로 RootNavigator가 자동으로 MainTab 전환
   */
  const completeLogin = async () => {
    console.log('[Login] completeLogin 시작 - 프로필 로딩 중...');
    const profile = await authApi.getFullProfile();
    console.log('[Login] 프로필 로딩 성공:', profile?.email || profile?.username);
    await setUser(profile as any);
    await setHasSeenOnboarding(true);
    console.log('[Login] setUser 완료 - RootNavigator가 MainTab으로 전환');
  };

  // URL에서 파라미터 파싱 헬퍼
  const parseCallbackUrl = useCallback((url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    try {
      // farmsense:// 스킴은 URL 파서가 잘 못 다룰 수 있으므로 ? 기준으로 분리
      const queryPart = url.split('?')[1];
      if (queryPart) {
        queryPart.split('&').forEach((pair) => {
          const eqIdx = pair.indexOf('=');
          if (eqIdx > 0) {
            const key = decodeURIComponent(pair.substring(0, eqIdx));
            const value = decodeURIComponent(pair.substring(eqIdx + 1));
            params[key] = value;
          }
        });
      }
      // 해시 파라미터도 처리
      const hashPart = url.split('#')[1];
      if (hashPart) {
        hashPart.split('&').forEach((pair) => {
          const eqIdx = pair.indexOf('=');
          if (eqIdx > 0) {
            const key = decodeURIComponent(pair.substring(0, eqIdx));
            const value = decodeURIComponent(pair.substring(eqIdx + 1));
            params[key] = value;
          }
        });
      }
    } catch (error) {
      console.warn('[Login] URL 파싱 실패:', error);
    }
    return params;
  }, []);

  /**
   * 소셜 로그인 토큰 처리 (Linking 핸들러와 WebBrowser 결과에서 공통 사용)
   */
  const processSocialCallback = useCallback(async (url: string): Promise<boolean> => {
    // 이미 처리된 콜백이면 무시
    if (socialLoginHandledRef.current) {
      console.log('[Login] 소셜 콜백 이미 처리됨, 무시');
      return false;
    }

    if (!url.startsWith('farmsense://auth/callback')) return false;

    socialLoginHandledRef.current = true;
    safeSetLoading(true);

    try {
      const params = parseCallbackUrl(url);
      console.log('[Login] 소셜 콜백 파라미터:', Object.keys(params));

      if (params.error) {
        const errorMap: Record<string, string> = {
          'kakao_denied': '카카오 로그인이 거부되었습니다.',
          'google_denied': 'Google 로그인이 거부되었습니다.',
          'token_failed': '인증 토큰 교환에 실패했습니다.',
          'server_error': '서버에서 오류가 발생했습니다.',
          'no_code': '인증 코드를 받지 못했습니다.',
          'access_denied': '로그인이 거부되었습니다.',
        };
        throw new Error(errorMap[params.error] || params.error_description || '소셜 로그인에 실패했습니다.');
      }

      // 토큰 확인 (access/access_token 둘 다 지원)
      const accessToken = params.access || params.access_token;
      const refreshToken = params.refresh || params.refresh_token;

      if (accessToken && refreshToken) {
        console.log('[Login] 소셜 로그인 토큰 수신 성공');
        await saveTokens(accessToken, refreshToken);
        await completeLogin();
        return true;
      } else if (accessToken) {
        // refresh 없이 access만 있는 경우에도 처리
        console.log('[Login] access 토큰만 수신 (refresh 없음)');
        await saveTokens(accessToken, '');
        await completeLogin();
        return true;
      } else {
        console.error('[Login] 토큰 없음. params:', JSON.stringify(params));
        throw new Error('인증 토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('[Login] 소셜 로그인 처리 에러:', error);
      if (mountedRef.current) {
        Alert.alert('소셜 로그인 오류', error.message || '소셜 로그인 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      safeSetLoading(false);
    }
  }, [parseCallbackUrl, safeSetLoading]);

  // Linking 이벤트 핸들러 - 소셜 로그인 딥링크 콜백 (Primary)
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('[Login] Linking 딥링크 수신:', event.url);
      processSocialCallback(event.url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 앱이 cold start로 열린 경우 초기 URL 처리
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('farmsense://auth/callback')) {
        console.log('[Login] 초기 URL 처리:', url);
        processSocialCallback(url);
      }
    });

    return () => subscription.remove();
  }, [processSocialCallback]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('알림', '이메일과 비밀번호를 입력하세요.');
      return;
    }

    safeSetLoading(true);
    console.log('[Login] 이메일 로그인 시도:', trimmedEmail);

    try {
      await authApi.login({ email: trimmedEmail, password: trimmedPassword });
      console.log('[Login] authApi.login 성공');
      await completeLogin();
    } catch (error: any) {
      console.error('[Login] 로그인 실패:', error?.message);
      const msg = error?.message || '이메일 또는 비밀번호를 확인해주세요.';
      if (mountedRef.current) {
        Alert.alert('로그인 실패', msg);
      }
    } finally {
      safeSetLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    // 이중 처리 방지 ref 초기화
    socialLoginHandledRef.current = false;
    safeSetLoading(true);

    try {
      // API_CONFIG.BASE_URL = 'https://api.farmsense.kr/api'
      // 끝의 /api만 제거 (도메인의 api. 는 유지)
      const baseUrl = API_CONFIG.BASE_URL.replace(/\/api$/, '');
      const oauthPath = provider === 'google'
        ? '/api/auth/google/'
        : '/api/auth/kakao/';
      const authUrl = `${baseUrl}${oauthPath}?redirect_to=${encodeURIComponent(REDIRECT_URI)}`;

      console.log('[Login] OAuth URL:', authUrl);

      // URL 열기
      await Linking.openURL(authUrl);

      // Linking 핸들러가 콜백을 처리할 때까지 대기
      // 60초 후에도 처리 안 되면 로딩 해제 (사용자가 브라우저에서 취소한 경우)
      setTimeout(() => {
        if (!socialLoginHandledRef.current && mountedRef.current) {
          console.log('[Login] 소셜 로그인 타임아웃 - 로딩 해제');
          safeSetLoading(false);
        }
      }, 60000);
    } catch (error: any) {
      console.error('[Login] 소셜 로그인 에러:', error);
      const name = provider === 'google' ? 'Google' : '카카오';
      Alert.alert(`${name} 로그인 오류`, error.message || '소셜 로그인 중 오류가 발생했습니다.');
      safeSetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>FarmSense</Text>
          <Text style={styles.tagline}>스마트 포도 농장 관리</Text>
        </View>

        {/* Email/Password */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textDisabled} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={colors.textDisabled}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textDisabled} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={colors.textDisabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              autoCorrect={false}
              autoCapitalize="none"
              editable={!loading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textDisabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>로그인</Text>
          )}
        </TouchableOpacity>

        {/* Sign up + Forgot password */}
        <View style={styles.signUpRow}>
          <Text style={styles.signUpLabel}>계정이 없으신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { email: email.trim() })} style={styles.forgotRow}>
          <Text style={styles.forgotText}>비밀번호 찾기 / 아이디 찾기</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => handleSocialLogin('google')} disabled={loading}>
          <View style={styles.socialIconWrap}>
            <GoogleLogo size={22} />
          </View>
          <Text style={[styles.socialText, { color: colors.text.primary }]}>Google로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.kakaoButton]} onPress={() => handleSocialLogin('kakao')} disabled={loading}>
          <View style={styles.socialIconWrap}>
            <KakaoLogo size={22} />
          </View>
          <Text style={[styles.socialText, { color: '#191919' }]}>카카오로 로그인</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 28, fontWeight: '800', color: colors.text.primary, marginTop: 12 },
  tagline: { fontSize: 14, color: colors.textSub, marginTop: 4 },
  inputSection: { gap: 12, marginBottom: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, fontSize: 16, color: colors.text.primary, marginLeft: 10 },
  loginButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  forgotRow: { alignItems: 'center', paddingVertical: 12 },
  forgotText: { fontSize: 14, color: colors.primary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: colors.textDisabled },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 14, marginBottom: 10, height: 52 },
  googleButton: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1 },
  kakaoButton: { backgroundColor: '#FEE500' },
  socialIconWrap: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  socialText: { fontSize: 15, fontWeight: '600' },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  signUpLabel: { fontSize: 14, color: colors.textSub },
  signUpLink: { fontSize: 14, fontWeight: '600', color: colors.primary },
});

export default LoginScreen;
