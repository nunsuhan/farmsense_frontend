import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthTokens } from '../../utils/secureStorage';

import { useOnboarding } from '../../hooks/useOnboarding';
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
  const [tossPayload, setTossPayload] = useState<{
    checkoutUrl: string; successUrl: string; failUrl: string; customerKey: string;
  } | null>(null);

  const finish = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      if (state.token) {
        // Save the access token; refresh handled by backend on next call
        await setAuthTokens(state.token, state.token);
      }
    } catch {}
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
          onNext={(token) => { update({ token }); goto('PLAN'); }}
        />
      )}
      {state.step === 'PLAN' && <PlanStep onNext={next} />}
      {state.step === 'CARD' && (
        <CardStep
          onCheckout={(checkoutUrl, successUrl, failUrl, customerKey) => {
            update({ customerKey });
            setTossPayload({ checkoutUrl, successUrl, failUrl, customerKey });
          }}
        />
      )}
      {state.step === 'DONE' && <DoneStep onFinish={finish} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F0' },
});
