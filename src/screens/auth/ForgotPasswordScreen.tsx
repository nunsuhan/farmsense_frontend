/**
 * v2 ForgotPasswordScreen - 비밀번호 재설정 / 아이디 찾기 이중 탭
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApi } from '../../services/authApi';
import { colors } from '../../theme/colors';

type Tab = 'password' | 'findId';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [tab, setTab] = useState<Tab>('password');
  const [email, setEmail] = useState(route.params?.email || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) { Alert.alert('알림', '이메일을 입력하세요.'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim());
      Alert.alert('성공', '비밀번호 재설정 링크를 이메일로 발송했습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '비밀번호 재설정 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
    return `${visible}***@${domain}`;
  };

  const handleFindId = async () => {
    if (!name || !phone) { Alert.alert('알림', '이름과 휴대폰 번호를 입력하세요.'); return; }
    setLoading(true);
    try {
      const result = await authApi.findId(name.trim(), phone.trim());
      Alert.alert('아이디 찾기', `등록된 아이디는\n${maskEmail(result.email)}\n입니다.`);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        Alert.alert('알림', '등록된 계정을 찾을 수 없습니다.');
      } else {
        Alert.alert('오류', error.message || '등록된 계정을 찾을 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>계정 찾기</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'password' && styles.tabActive]} onPress={() => setTab('password')}>
          <Text style={[styles.tabText, tab === 'password' && styles.tabTextActive]}>비밀번호 재설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'findId' && styles.tabActive]} onPress={() => setTab('findId')}>
          <Text style={[styles.tabText, tab === 'findId' && styles.tabTextActive]}>아이디 찾기</Text>
        </TouchableOpacity>
      </View>

      {tab === 'password' ? (
        <View style={styles.form}>
          <Text style={styles.desc}>가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다.</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textDisabled} />
            <TextInput style={styles.input} placeholder="이메일" placeholderTextColor={colors.textDisabled} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleResetPassword} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>재설정 링크 발송</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.desc}>가입 시 등록한 이름과 휴대폰 번호를 입력하세요.</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.textDisabled} />
            <TextInput style={styles.input} placeholder="이름" placeholderTextColor={colors.textDisabled} value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.textDisabled} />
            <TextInput style={styles.input} placeholder="휴대폰 번호" placeholderTextColor={colors.textDisabled} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleFindId} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>아이디 찾기</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.goBack()}>
        <Text style={styles.backToLoginText}>로그인으로 돌아가기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  backBtn: { paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 20 },
  tabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSub },
  tabTextActive: { color: colors.primary },
  form: { gap: 12 },
  desc: { fontSize: 14, color: colors.textSub, lineHeight: 20, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, fontSize: 16, color: colors.text.primary, marginLeft: 10 },
  submitButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  backToLogin: { alignItems: 'center', marginTop: 32 },
  backToLoginText: { fontSize: 14, color: colors.textSub, textDecorationLine: 'underline' },
});

export default ForgotPasswordScreen;
