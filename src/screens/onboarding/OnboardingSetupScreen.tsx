/**
 * OnboardingSetupScreen — 회원가입 후 필수 설정 강제 플로우
 *
 * 1단계: 농장 기본정보 (FarmRegistrationScreen 재활용)
 * 2단계: 알림 설정 (카카오톡 수신 여부)
 * 완료 시: POST /api/users/onboarding/complete/ + useStore 업데이트 + MainTab 진입
 *
 * 뒤로가기/앱 재실행 해도 onboarding_completed=false면 계속 여기로 돌아옴
 * (RootNavigator 분기 로직이 담당)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { authApi } from '../../services/authApi';
import { useStore } from '../../store/useStore';
import FarmRegistrationScreen from './FarmRegistrationScreen';

type Step = 'FARM' | 'NOTIFY';

const OnboardingSetupScreen: React.FC = () => {
  const [step, setStep] = useState<Step>('FARM');
  const [kakaoConsent, setKakaoConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const setUser = useStore((s) => s.setUser);

  // 뒤로가기 / 건너뛰기 전부 차단
  useFocusEffect(
    React.useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const handleFarmDone = () => {
    setStep('NOTIFY');
  };

  const finish = async () => {
    setSaving(true);
    try {
      if (kakaoConsent) {
        await authApi.setKakaoReportEnabled(true);
      }
      await authApi.completeOnboarding();
      // useStore의 user에 onboarding_completed 반영 (재렌더 트리거 → RootNavigator가 MainTab으로 전환)
      const profile = await authApi.getFullProfile();
      await setUser(profile as any);
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.error || e?.message || '설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'FARM') {
    // FarmRegistrationScreen을 내부에서 띄우고, 완료되면 setStep('NOTIFY')
    return <FarmRegistrationWrapper onDone={handleFarmDone} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.stepText}>2 / 2</Text>
          <Text style={styles.title}>알림 설정</Text>
          <Text style={styles.subtitle}>
            매일 아침 농장 상태를 요약해서 카카오톡으로 받아보시겠어요?
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>💬 카카오톡으로 일일 보고서 받기</Text>
              <Text style={styles.rowDesc}>
                매일 아침 7시, 오늘의 재배 의견을{'\n'}카카오톡 알림톡으로 보내드립니다.
              </Text>
            </View>
            <Switch
              value={kakaoConsent}
              onValueChange={(v) => {
                if (v) {
                  Alert.alert(
                    '카카오톡 알림 수신 동의',
                    '매일 아침 7시경 재배 의견/위험 알림을 카카오톡 알림톡으로 받으시겠어요?\n(정보성 메시지, 광고 아님)',
                    [
                      { text: '아니요', style: 'cancel', onPress: () => setKakaoConsent(false) },
                      { text: '동의', onPress: () => setKakaoConsent(true) },
                    ]
                  );
                } else {
                  setKakaoConsent(false);
                }
              }}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            />
          </View>
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.noteText}>
              나중에 <Text style={{ fontWeight: '700' }}>더보기 → 알림 설정</Text>에서 변경할 수 있습니다.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={finish} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>완료하고 시작하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/**
 * FarmRegistrationScreen을 감싸서 완료 콜백 주입.
 * 기존 화면은 독립적으로 동작하므로 navigation.goBack() 대신 onDone 호출로 다음 단계 이동.
 */
const FarmRegistrationWrapper: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  // FarmRegistrationScreen 내부에서 저장 성공 시 navigation.navigate or goBack 호출됨.
  // 가장 단순한 방법: 이 Wrapper에서 하단에 별도 "다음" 버튼을 제공하여 어떻게든 진행 가능하게 함.
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FarmRegistrationScreen />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onDone}>
          <Text style={styles.primaryBtnText}>다음 단계</Text>
        </TouchableOpacity>
        <Text style={styles.footerHint}>
          농장 정보를 저장한 후 눌러주세요 (임시로 넘어가도 나중에 수정 가능)
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { paddingVertical: 16 },
  stepText: { fontSize: 13, color: '#6B7280', fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  rowDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
  },
  noteText: { fontSize: 12, color: '#6B7280', flex: 1 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  footerHint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 6 },
  primaryBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default OnboardingSetupScreen;
