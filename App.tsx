/**
 * App.tsx
 * FarmSense 앱 진입점
 * 
 * AsyncStorage 초기화 완료 후 화면 렌더링
 */

import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Suppress all logs for demo/production readiness
LogBox.ignoreAllLogs(true);


// Navigation & Store
import { RootNavigator } from './src/navigation/RootNavigator';
import { initializeStore, useStore } from './src/store/useStore';
import GlobalErrorBar from './src/components/common/GlobalErrorBar';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isInitialized = useStore((state) => state.isInitialized);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 [App] Initializing Store...');
        await initializeStore();
        console.log('✅ [App] Store initialized');

        // 자동 로그인 판정 우선순위:
        //  1) store에 user 복원됨 → OnboardingScreen 완전 스킵 (RootNavigator가 분기 담당)
        //  2) AsyncStorage 'onboarding_complete' = 'true' → 스킵
        //  3) 둘 다 아니면 회원가입 화면 표시
        const flag = await AsyncStorage.getItem('onboarding_complete');
        const hasUser = !!useStore.getState().user;
        setShowOnboarding(!hasUser && flag !== 'true');

        // ✅ farmInfo 전파 확인
        const currentState = useStore.getState();
        console.log('📊 [App] Current farmInfo:', currentState.farmInfo);
        console.log('🆔 [App] farmId:', currentState.farmInfo?.id);

        if (!currentState.farmInfo?.id) {
          console.error('❌ [App] farmInfo.id is missing!');
        } else if (currentState.farmInfo.id === 'farm-123') {
          console.log('✅ [App] Default farmId (farm-123) confirmed');
        } else {
          console.log('✅ [App] Custom farmId confirmed:', currentState.farmInfo.id);
        }

        setIsReady(true);
      } catch (error) {
        console.error('❌ [App] Store initialization failed:', error);
        // 초기화 실패해도 앱은 실행 (빈 상태로)
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  // 초기화 완료될 때까지 로딩 화면 표시
  if (!isReady || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {showOnboarding ? (
          <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
        ) : (
          <RootNavigator />
        )}
        <GlobalErrorBar />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
