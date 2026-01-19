import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import FarmBasicInfoScreen from '../screens/settings/FarmBasicInfoScreen';
import FarmDetailInfoScreen from '../screens/settings/FarmDetailInfoScreen';
import AlertSettingsScreen from '../screens/settings/AlertSettingsScreen';
import SensorRegistrationScreen from '../screens/settings/SensorRegistrationScreen';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// New Settings Features
import FarmDetailScreen from '../screens/settings/FarmDetailScreen';
import SoilEnvironmentScreen from '../screens/settings/SoilEnvironmentScreen';
import SectorManageScreen from '../screens/settings/SectorManagementScreen';
import SensorManageScreen from '../screens/settings/SensorManageScreen';
import NotificationScreen from '../screens/settings/NotificationScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import AppInfoScreen from '../screens/settings/AppInfoScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';
import TermsScreen from '../screens/settings/TermsScreen';

import YearlyReportScreen from '../screens/YearlyReportScreen';
import FertilizerPrescriptionScreen from '../screens/settings/FertilizerPrescriptionScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const SettingsStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
            <Stack.Screen name="Settings" component={SettingsMainScreen} />

            <Stack.Screen name="FarmBasicInfo" component={FarmBasicInfoScreen} />
            <Stack.Screen name="FarmDetailInfo" component={FarmDetailInfoScreen} />
            <Stack.Screen name="AlertSettings" component={AlertSettingsScreen} />
            <Stack.Screen name="SensorRegistration" component={SensorRegistrationScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />

            <Stack.Screen name="FarmDetail" component={FarmDetailScreen} />
            <Stack.Screen name="SoilEnvironment" component={SoilEnvironmentScreen} />
            <Stack.Screen name="SectorManage" component={SectorManageScreen} />
            <Stack.Screen name="SensorManage" component={SensorManageScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="AppInfo" component={AppInfoScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="YearlyReport" component={YearlyReportScreen} />
            <Stack.Screen name="FertilizerPrescription" component={FertilizerPrescriptionScreen} />
        </Stack.Navigator>
    );
};
