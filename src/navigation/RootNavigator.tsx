/**
 * v3 RootNavigator
 * 로그인 필수: 미로그인 → Login, 로그인 완료 → MainTab
 * 하드웨어 백 버튼 처리 추가
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BackHandler, Alert, Platform } from 'react-native';
import { RootStackParamList } from './types';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Onboarding
import OnboardingSlidesScreen from '../screens/onboarding/OnboardingSlidesScreen';
import SplashScreen from '../screens/SplashScreen';

// Main
import { MainTabNavigator } from './MainTabNavigator';

// Store
import { useStore } from '../store/useStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  // 하드웨어 백 버튼 처리 (Android)
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    const backAction = () => {
      // 로그인 상태에 따른 백 버튼 동작
      if (isLoggedIn) {
        // 메인 앱에서는 일반적인 백 버튼 동작 허용
        return false; // 기본 동작 수행
      } else {
        // 로그인/온보딩 화면에서의 백 버튼 처리
        if (!hasSeenOnboarding) {
          // 온보딩 중에는 앱 종료 확인
          Alert.alert(
            '앱 종료',
            '앱을 종료하시겠습니까?',
            [
              { text: '취소', style: 'cancel', onPress: () => {} },
              { text: '종료', style: 'destructive', onPress: () => BackHandler.exitApp() }
            ]
          );
          return true; // 기본 동작 방지
        } else {
          // 로그인 화면에서는 앱 종료
          Alert.alert(
            '앱 종료',
            '로그인 화면에서 나가시겠습니까?',
            [
              { text: '취소', style: 'cancel', onPress: () => {} },
              { text: '종료', style: 'destructive', onPress: () => BackHandler.exitApp() }
            ]
          );
          return true;
        }
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isLoggedIn, hasSeenOnboarding]);
  const user = useStore((state) => state.user);
  const isInitialized = useStore((state) => state.isInitialized);
  const hasSeenOnboarding = useStore((state) => state.hasSeenOnboarding);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  // v3: 로그인 필수 - user가 있어야만 메인 진입
  const isLoggedIn = !!user;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
        {isLoggedIn ? (
          // 로그인 완료 → 메인 앱
          <Stack.Group>
            <Stack.Screen name="MainTab" component={MainTabNavigator} />
          </Stack.Group>
        ) : !hasSeenOnboarding ? (
          // 첫 실행 → 온보딩 → 로그인
          <Stack.Group>
            <Stack.Screen name="OnboardingSlides" component={OnboardingSlidesScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Group>
        ) : (
          // 온보딩 완료했지만 미로그인 → 로그인 화면
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
