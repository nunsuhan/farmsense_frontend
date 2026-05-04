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
// OnboardingScreen (결제 6스텝) dead code화 — RootNavigator가 단일 진입 담당
// import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const isInitialized = useStore((state) => state.isInitialized);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 [App] Initializing Store...');
        await initializeStore();
        console.log('✅ [App] Store initialized');
        // RootNavigator가 flowMode(intro/setup/main)로 단일 진입 담당.
        // OnboardingScreen(결제 6스텝)은 dead code화.

        // 인증된 사용자인데 농장 목록 비어있으면 fetch (앱 재시작 케이스)
        const currentState = useStore.getState();
        if (currentState.user && currentState.farmList.length === 0) {
          try {
            const result = await currentState.loadFarms();
            console.log('[App] loadFarms result:', result);
          } catch (e) {
            console.warn('[App] loadFarms failed (non-blocking):', e);
          }
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

  // OnboardingScreen (결제 6스텝) 제거 — RootNavigator가 flowMode(intro/setup/main)로 단일 진입 담당
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator />
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
