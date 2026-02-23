/**
 * v2.2 MainTabNavigator - 6탭 구조
 * 홈 | AI상담 | 진단 | 영농일지 | 내농장 | 더보기
 * 메인 페이지(Home)에서는 푸터(탭바) 숨김
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { colors } from '../theme/colors';

import { HomeStackNavigator } from './HomeStackNavigator2';
import { ConsultStackNavigator } from './ConsultStackNavigator';
import { DiagnosisStackNavigator } from './DiagnosisStackNavigator';
import { LogStackNavigator } from './LogStackNavigator';
import { MyFarmStackNavigator } from './MyFarmStackNavigator';
import { MoreStackNavigator } from './MoreStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  ConsultTab: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  DiagnosisTab: { active: 'camera', inactive: 'camera-outline' },
  LogTab: { active: 'pencil', inactive: 'pencil-outline' },
  MyFarmTab: { active: 'leaf', inactive: 'leaf-outline' },
  MoreTab: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' },
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 56,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        unmountOnBlur: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
          return {
            tabBarLabel: '홈',
            tabBarStyle: routeName === 'Home'
              ? { display: 'none' }
              : {
                  backgroundColor: '#FFFFFF',
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  height: 56,
                  paddingBottom: 4,
                  paddingTop: 4,
                },
          };
        }}
      />
      <Tab.Screen name="ConsultTab" component={ConsultStackNavigator} options={{ tabBarLabel: 'AI상담' }} />
      <Tab.Screen name="DiagnosisTab" component={DiagnosisStackNavigator} options={{ tabBarLabel: '진단' }} />
      <Tab.Screen name="LogTab" component={LogStackNavigator} options={{ tabBarLabel: '영농일지' }} />
      <Tab.Screen
        name="MyFarmTab"
        component={MyFarmStackNavigator}
        options={{ tabBarLabel: '내농장' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('MyFarmTab', { screen: 'MyFarmHub' });
          },
        })}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{ tabBarLabel: '더보기' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('MoreTab', { screen: 'MoreMenu' });
          },
        })}
      />
    </Tab.Navigator>
  );
};
