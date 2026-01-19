console.log('### LoginScreen loaded ###');

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { authApi } from '../services/authApi';
import { API_CONFIG } from '../constants/config';

// 소셜 로그인 아이콘 URL (CDN)
const SOCIAL_ICONS = {
  KAKAO: 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png', // 카카오
  NAVER: 'https://static.nid.naver.com/oauth/button_g.PNG', // 네이버 (대체)
  GOOGLE: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png', // 구글
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setUser = useStore((state) => state.setUser);

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = async () => {
    if (loginMethod === 'phone') {
      Alert.alert('알림', '휴대폰 번호 로그인은 준비 중입니다.\n이메일 로그인을 이용해주세요.');
      setLoginMethod('email');
      return;
    }

    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await authApi.login({ email, password });
      console.log('✅ [Login] 성공:', response);

      // 토큰 저장 완료 대기
      await new Promise(resolve => setTimeout(resolve, 300));

      const profile = await authApi.getFullProfile();
      await setUser(profile as any);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      });
    } catch (error: any) {
      console.error('❌ [Login] 실패:', error);
      Alert.alert('로그인 실패', error.message || '이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  /**
   * 소셜 로그인 핸들러
   * 웹 브라우저를 통해 백엔드 인증 엔드포인트로 이동합니다.
   * 백엔드는 인증 후 'farmsense://auth/callback?access=...' 형태로 리다이렉트 해야 합니다.
   * (현재 서버는 리다이렉트 설정이 되어있지 않을 수 있어, 브라우저에서 멈출 수 있습니다)
   */
  const handleSocialLogin = async (provider: 'kakao' | 'naver' | 'google') => {
    const backendUrl = `${API_CONFIG.BASE_URL}/auth/${provider}/login/`;

    // 알림: 실제 앱 연동을 위해서는 서버의 Redirect URI가 앱 스킴(farmsense://)으로 설정되어야 함
    console.log(`🔗 [Social] ${provider} 로그인 시도: ${backendUrl}`);

    try {
      const supported = await Linking.canOpenURL(backendUrl);
      if (supported) {
        await Linking.openURL(backendUrl);
      } else {
        Alert.alert('오류', '브라우저를 열 수 없습니다.');
      }
    } catch (err) {
      console.error('An error occurred', err);
      Alert.alert('오류', '로그인 페이지 이동 중 문제가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
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
            onPress={() => setLoginMethod('email')}
          >
            <Text style={[styles.tabText, loginMethod === 'email' && styles.tabTextActive]}>이메일 로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'phone' && styles.tabActive]}
            onPress={() => setLoginMethod('phone')}
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
            </>
          ) : (
            <>
              <Text style={styles.label}>휴대폰 번호</Text>
              <TextInput
                style={styles.input}
                placeholder="010-0000-0000"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>
              {loginMethod === 'email' ? '로그인' : '인증번호 받기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Social Login Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialDividerText}>또는 소셜 계정으로 로그인</Text>
          <View style={styles.socialButtonsContainer}>
            {/* Kakao */}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FEE500' }]}
              onPress={() => handleSocialLogin('kakao')}
            >
              <Image
                source={{ uri: SOCIAL_ICONS.KAKAO }}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Naver */}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#03C75A' }]}
              onPress={() => handleSocialLogin('naver')}
            >
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Naver_Logotype.svg' }} // SVG might not work with Image, using text N for now or finding PNG
              // Using a text 'N' fallback if image fails or replacing with a PNG url
              />
              <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>N</Text>
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
              onPress={() => handleSocialLogin('google')}
            >
              <Image
                source={{ uri: SOCIAL_ICONS.GOOGLE }}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Signup Link */}
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
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  innerContainer: {
    flex: 1,
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
    marginBottom: 24,
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
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  // 회원가입
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
  // 소셜 로그인 아이콘 버튼
  socialSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialDividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20, // React Native 0.71+ support gap
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  socialButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
