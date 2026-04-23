/**
 * v2.2 MainTabNavigator - 6탭 구조
 * 홈 | AI상담 | 진단 | 영농일지 | 내농장 | 더보기
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { colors } from '../theme/colors';

import { HomeStackNavigator } from './HomeStackNavigator';
import { FarmingLogStackNavigator } from './FarmingLogStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import FarmDoctorScreen from '../screens/farmDoctor/FarmDoctorScreen';
import ConsultScreen from '../screens/consult/ConsultScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  ConsultTab: { focused: 'chatbubble', unfocused: 'chatbubble-outline' },
  DiagnosisTab: { focused: 'camera', unfocused: 'camera-outline' },
  LogTab: { focused: 'create', unfocused: 'create-outline' },
  MyFarmTab: { focused: 'leaf', unfocused: 'leaf-outline' },
  MoreTab: { focused: 'ellipsis-horizontal', unfocused: 'ellipsis-horizontal-outline' },
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: '홈' }} />
      <Tab.Screen name="ConsultTab" component={ConsultScreen} options={{ title: 'AI상담' }} />
      <Tab.Screen name="DiagnosisTab" component={FarmDoctorScreen} options={{ title: '건강 체크' }} />
      <Tab.Screen name="LogTab" component={FarmingLogStackNavigator} options={{ title: '영농일지' }} />
      <Tab.Screen name="MyFarmTab" component={SettingsStackNavigator} options={{ title: '내농장' }} />
      <Tab.Screen name="MoreTab" component={MoreScreen} options={{ title: '더보기' }} />
    </Tab.Navigator>
  );
};
