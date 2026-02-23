/**
 * v2.3 MyFarmStackNavigator - 내 농장 허브 + GAP 인증 관리
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyFarmStackParamList } from './types';

import MyFarmScreen from '../screens/myfarm/MyFarmScreen';
import UnifiedFarmSettingsScreen from '../screens/myfarm/UnifiedFarmSettingsScreen';
import SensorRegistrationScreen from '../screens/myfarm/SensorRegistrationScreen';
import SensorManageScreen from '../screens/settings/SensorManageScreen';
import SensorDashboardScreen from '../screens/myfarm/SensorDashboardScreen';
import ExternalSensorScreen from '../screens/settings/ExternalSensorScreen';
import FarmMapScreen from '../screens/myfarm/FarmMapScreen';
import ProductHistoryScreen from '../screens/myfarm/ProductHistoryScreen';
import CertificatesScreen from '../screens/myfarm/CertificatesScreen';

// GAP 인증 관리
import GAPHubScreen from '../screens/gap/GAPHubScreen';
import GAPChecklistScreen from '../screens/gap/GAPChecklistScreen';
import SoilTestFormScreen from '../screens/gap/SoilTestFormScreen';
import WaterTestFormScreen from '../screens/gap/WaterTestFormScreen';
import FertilizerFormScreen from '../screens/gap/FertilizerFormScreen';
import HarvestFormScreen from '../screens/gap/HarvestFormScreen';
import TrainingFormScreen from '../screens/gap/TrainingFormScreen';
import ExportDashboardScreen from '../screens/gap/ExportDashboardScreen';
import SealingScreen from '../screens/gap/SealingScreen';
import SmartGreenhouseScreen from '../screens/myfarm/SmartGreenhouseScreen';
import IrrigationDashboardScreen from '../screens/irrigation/IrrigationDashboardScreen';

const Stack = createNativeStackNavigator<MyFarmStackParamList>();

export const MyFarmStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      id={undefined}
    >
      <Stack.Screen name="MyFarmHub" component={MyFarmScreen} />
      <Stack.Screen name="UnifiedFarmSettings" component={UnifiedFarmSettingsScreen} />
      <Stack.Screen name="SensorManage" component={SensorManageScreen} />
      <Stack.Screen name="SensorDashboard" component={SensorDashboardScreen} />
      <Stack.Screen name="SensorRegistration" component={SensorRegistrationScreen} />
      <Stack.Screen name="ExternalSensor" component={ExternalSensorScreen} />
      <Stack.Screen name="FarmMap" component={FarmMapScreen} />
      <Stack.Screen name="ProductHistory" component={ProductHistoryScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      {/* GAP 인증 관리 */}
      <Stack.Screen name="GAPHub" component={GAPHubScreen} />
      <Stack.Screen name="GAPChecklist" component={GAPChecklistScreen} />
      <Stack.Screen name="SoilTestForm" component={SoilTestFormScreen} />
      <Stack.Screen name="WaterTestForm" component={WaterTestFormScreen} />
      <Stack.Screen name="FertilizerForm" component={FertilizerFormScreen} />
      <Stack.Screen name="HarvestForm" component={HarvestFormScreen} />
      <Stack.Screen name="TrainingForm" component={TrainingFormScreen} />
      <Stack.Screen name="ExportDashboard" component={ExportDashboardScreen} />
      <Stack.Screen name="Sealing" component={SealingScreen} />
      <Stack.Screen name="SmartGreenhouse" component={SmartGreenhouseScreen} />
      <Stack.Screen name="IrrigationDashboard" component={IrrigationDashboardScreen} />
    </Stack.Navigator>
  );
};
