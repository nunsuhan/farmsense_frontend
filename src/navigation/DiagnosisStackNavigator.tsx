/**
 * v2.1 DiagnosisStackNavigator - 진단 탭
 * 진단허브 → 촬영/성장기록/캐노피
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiagnosisStackParamList } from './types';

import DiagnosisHubScreen from '../screens/diagnosis/DiagnosisHubScreen';
import DiagnosisCameraScreen from '../screens/diagnosis/DiagnosisCameraScreen';
import DiagnosisResultScreen2 from '../screens/diagnosis/DiagnosisResultScreen2';
import GrowthRecordScreen from '../screens/diagnosis/GrowthRecordScreen';
import CanopyGuideScreen from '../screens/diagnosis/CanopyGuideScreen';
import CanopyCameraScreen from '../screens/CanopyCameraScreen';


const Stack = createNativeStackNavigator<DiagnosisStackParamList>();

export const DiagnosisStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      id={undefined}
    >
      <Stack.Screen name="DiagnosisHub" component={DiagnosisHubScreen} />
      <Stack.Screen name="DiagnosisCamera" component={DiagnosisCameraScreen} />
      <Stack.Screen name="DiagnosisResult" component={DiagnosisResultScreen2} />
      <Stack.Screen name="GrowthRecord" component={GrowthRecordScreen} />
      <Stack.Screen name="CanopyGuide" component={CanopyGuideScreen} />
      <Stack.Screen name="CanopyCamera" component={CanopyCameraScreen} />
    </Stack.Navigator>
  );
};
