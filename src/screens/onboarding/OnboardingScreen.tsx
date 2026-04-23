import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthTokens } from '../../utils/secureStorage';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useStore } from '../../store/useStore';
import { authApi } from '../../services/authApi';
import WelcomeStep from './WelcomeStep';
import PhoneStep from './PhoneStep';
import VerifyStep from './VerifyStep';
import PlanStep from './PlanStep';
import CardStep from './CardStep';
import TossWebView from './TossWebView';
import DoneStep from './DoneStep';
interface Props {
  onComplete: () => void;
}
export default function OnboardingScreen({ onComplete }: Props) {
  const { state, next, update, goto } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [tossPayload, setTossPayload] = useState<{
    checkoutUrl: string; successUrl: string; failUrl: string; customerKey: string;
  } | null>(null);
  const setUser = useStore((s) => s.setUser);
  const finish = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
    } catch {}
    // 회원가입 직후 서버 프로필을 가져와서 store에 반영.
    // onboarding_completed=false일 것이므로 RootNavigator가 'setup' 모드로 분기.
    try {
      const profile = await authApi.getFullProfile();
      await setUser(profile as any);
    } catch (e) {
      console.log('[Onboarding] profile fetch after signup failed', e);
    }
    onComplete();
  };
  // Toss WebView overlay
  if (tossPayload) {
    return (
      <TossWebView
        {...tossPayload}
        onSuccess={() => { setTossPayload(null); goto('DONE'); }}
        onCancel={() => setTossPayload(null)}
      />
    );
  }
  return (
    <View style={styles.root}>
      {state.step === 'WELCOME' && <WelcomeStep onNext={next} />}
      {state.step === 'PHONE' && (
        <PhoneStep onNext={(phone) => { update({ phone }); goto('VERIFY'); }} />
      )}
      {state.step === 'VERIFY' && (
        <VerifyStep
          phone={state.phone}
          onNext={async (token, refresh) => {
            // 인증 직후 즉시 토큰 저장 (이후 API 호출에 인증 필수)
            await setAuthTokens(token, refresh);
            update({ token });
            // Play Store 옵션 C: 시범 기간 동안 결제 단계 스킵 (PLAN/CARD 건너뛰고 DONE으로 직행)
            goto('DONE');
          }}
        />
      )}
      {state.step === 'PLAN' && (
        <PlanStep onNext={(plan) => { setSelectedPlan(plan); next(); }} />
      )}
      {state.step === 'CARD' && (
        <CardStep
          plan={selectedPlan}
          onCheckout={(checkoutUrl, successUrl, failUrl, customerKey) => {
            update({ customerKey });
            setTossPayload({ checkoutUrl, successUrl, failUrl, customerKey });
          }}
        />
      )}
      {state.step === 'DONE' && <DoneStep plan={selectedPlan} onFinish={finish} />}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F0' },
});
