import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeRouter from '../screens/home/HomeRouter';
import { PesticideManagementScreen } from '../screens/pesticide/PesticideManagementScreen';
import FarmMapScreen from '../screens/FarmMapScreen';
import FarmMapAdvancedScreen from '../screens/FarmMapAdvancedScreen';
import QnAScreen from '../screens/QnAScreen';
import DailyPrescriptionScreen from '../screens/DailyPrescriptionScreen';
import GrowthDiaryScreen from '../screens/GrowthDiaryScreen';
// FacilityInfoScreen 삭제됨 - 농장기본정보(FarmBasicInfoScreen)로 통합
import ReverseAnalysisScreen from '../screens/ReverseAnalysisScreen';
import PesticideRecordScreen from '../screens/PesticideRecordScreen';
import CanopyCameraScreen from '../screens/CanopyCameraScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { RootStackParamList } from './types';

import BenchmarkScreen from '../screens/BenchmarkScreen';

const HomeStack = createNativeStackNavigator<RootStackParamList>();

export const HomeStackNavigator = () => {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
            <HomeStack.Screen name="Home" component={HomeRouter} />
            <HomeStack.Screen name="Benchmark" component={BenchmarkScreen} />
            <HomeStack.Screen name="PesticideManagement" component={PesticideManagementScreen} />
            <HomeStack.Screen name="FarmMap" component={FarmMapScreen} />
            <HomeStack.Screen name="FarmMapAdvanced" component={FarmMapAdvancedScreen} />
            <HomeStack.Screen name="QnAScreen" component={QnAScreen} />
            <HomeStack.Screen name="DailyPrescription" component={DailyPrescriptionScreen} />
            <HomeStack.Screen name="GrowthDiary" component={GrowthDiaryScreen} />
            <HomeStack.Screen name="ReverseAnalysis" component={ReverseAnalysisScreen} />
            <HomeStack.Screen name="PesticideRecord" component={PesticideRecordScreen} />
            <HomeStack.Screen name="CanopyCamera" component={CanopyCameraScreen} />
            <HomeStack.Screen name="NotificationList" component={NotificationsScreen} />
            <HomeStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        </HomeStack.Navigator>
    );
};
