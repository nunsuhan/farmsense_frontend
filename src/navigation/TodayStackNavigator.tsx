/**
 * v2 TodayStackNavigator - 오늘의 보고서 + 7개 상세 리포트
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayStackParamList } from './types';

import TodayReportScreen from '../screens/today/TodayReportScreen';
import IrrigationDetailScreen from '../screens/today/reports/IrrigationDetailScreen';
import DiagnosisDetailScreen from '../screens/today/reports/DiagnosisDetailScreen';
import PredictionDetailScreen from '../screens/today/reports/PredictionDetailScreen';
import DSSDetailScreen from '../screens/today/reports/DSSDetailScreen';
import SensorDetailScreen from '../screens/today/reports/SensorDetailScreen';
import RealtimeDetailScreen from '../screens/today/reports/RealtimeDetailScreen';
import SprayDetailScreen from '../screens/today/reports/SprayDetailScreen';
import FertilizerDetailScreen from '../screens/today/reports/FertilizerDetailScreen';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export const TodayStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      id={undefined}
    >
      <Stack.Screen name="TodayReport" component={TodayReportScreen} />
      <Stack.Screen name="IrrigationDetail" component={IrrigationDetailScreen} />
      <Stack.Screen name="DiagnosisDetail" component={DiagnosisDetailScreen} />
      <Stack.Screen name="PredictionDetail" component={PredictionDetailScreen} />
      <Stack.Screen name="DSSDetail" component={DSSDetailScreen} />
      <Stack.Screen name="SensorDetail" component={SensorDetailScreen} />
      <Stack.Screen name="RealtimeDetail" component={RealtimeDetailScreen} />
      <Stack.Screen name="SprayDetail" component={SprayDetailScreen} />
      <Stack.Screen name="FertilizerDetail" component={FertilizerDetailScreen} />
    </Stack.Navigator>
  );
};
