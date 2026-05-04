console.log('### LoginScreen source version A loaded ###');

// SignUpScreen - 회원가입 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../services/authApi';
import AddressSearchModal from '../components/AddressSearchModal';

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  // 입력 필드 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 검증 (8자 이상)
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // 회원가입 처리
  const handleSignUp = async () => {
    console.log('🚀 [SignUp] 회원가입 버튼 클릭됨');
    console.log('📝 [SignUp] 입력 데이터:', {
      name: formData.name,
      email: formData.email,
      password: '***',
      phone: formData.phone,
      address: formData.address,
      agreeTerms,
      agreePrivacy
    });

    // 입력값 검증
    if (!formData.name.trim()) {
      console.log('❌ [SignUp] 검증 실패: 이름 없음');
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (!validateEmail(formData.email)) {
      console.log('❌ [SignUp] 검증 실패: 이메일 형식 오류');
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!validatePassword(formData.password)) {
      console.log('❌ [SignUp] 검증 실패: 비밀번호 8자 미만');
      Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      console.log('❌ [SignUp] 검증 실패: 비밀번호 불일치');
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      console.log('❌ [SignUp] 검증 실패: 약관 미동의');
      Alert.alert('알림', '필수 약관에 동의해주세요.');
      return;
    }

    console.log('✅ [SignUp] 모든 검증 통과, API 호출 시작');
    setIsLoading(true);

    try {
      console.log('📡 [SignUp] authApi.register() 호출 중...');
      const result = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        phone: formData.phone,
        address: formData.address,
      });

      console.log('✅ [SignUp] 회원가입 성공:', result);

      // 회원가입 성공 - 자동으로 로그인 화면으로 이동
      Alert.alert(
        '🎉 회원가입 완료',
        '회원가입이 완료되었습니다.\n이제 로그인해주세요!',
        [
          {
            text: '로그인하러 가기',
            onPress: () => {
              console.log('🔄 [SignUp] 로그인 화면으로 이동');
              navigation.navigate('Login');  // navigate로 변경 (기존 스택 활용)
            }
          }
        ],
        { cancelable: false }  // 외부 클릭으로 닫기 방지
      );
    } catch (error: any) {
      console.error('❌ [SignUp] 회원가입 실패:', error);
      console.error('❌ [SignUp] 에러 상세:', {
        message: error.message,
        status: error.status,
        details: error.details
      });

      Alert.alert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.'
      );
    } finally {
      console.log('🏁 [SignUp] 회원가입 프로세스 종료');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 헤더 */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.logoEmoji}>🍇</Text>
                <Text style={styles.headerTitle}>회원가입</Text>
              </View>
            </View>

            {/* 입력 폼 */}
            <View style={styles.formSection}>
              {/* 이름 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이름 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="홍길동"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
              </View>

              {/* 이메일 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* 비밀번호 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="8자 이상 입력"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                />
                <Text style={styles.inputHint}>영문, 숫자 조합 8자 이상</Text>
              </View>

              {/* 비밀번호 확인 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 재입력"
                  placeholderTextColor="#9CA3AF"
                  value={formData.passwordConfirm}
                  onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                  secureTextEntry
                />
              </View>

              {/* 휴대폰 번호 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>휴대폰 번호 (선택)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="010-1234-5678"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* 주소 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>주소 (선택)</Text>
                <TouchableOpacity onPress={() => setShowAddressSearch(true)}>
                  <TextInput
                    style={styles.input}
                    placeholder="탭하여 주소 검색 (도로명 / 건물명 / 지번)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.address}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 약관 동의 */}
            <View style={styles.termsSection}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Text style={styles.checkboxIcon}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  <Text style={styles.required}>(필수)</Text> 서비스 이용약관 동의
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreePrivacy(!agreePrivacy)}
              >
                <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked]}>
                  {agreePrivacy && <Text style={styles.checkboxIcon}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  <Text style={styles.required}>(필수)</Text> 개인정보 처리방침 동의
                </Text>
              </TouchableOpacity>
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? '처리 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>

            {/* 로그인 링크 */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>로그인</Text>
              </TouchableOpacity>
            </View>

            {/* 하단 여백 */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <AddressSearchModal
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelectAddress={(addr) => {
          handleInputChange('address', addr.roadAddr || addr.jibunAddr);
          setShowAddressSearch(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#374151',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40, // backButton 너비만큼 오프셋
  },
  logoEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  // 폼 섹션
  formSection: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  // 약관 동의
  termsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
  },
  required: {
    color: '#EF4444',
    fontWeight: '600',
  },
  // 회원가입 버튼
  signUpButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // 로그인 링크
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
});

export default SignUpScreen;

