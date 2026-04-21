import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigators
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './types';

// Auth
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// Core Screens
import MenuScreen from '../screens/MenuScreen';
import SplashScreen from '../screens/SplashScreen';

// Onboarding
import OnboardingSlidesScreen from '../screens/onboarding/OnboardingSlidesScreen';
import PermissionRequestScreen from '../screens/onboarding/PermissionRequestScreen';
import FarmRegistrationScreen from '../screens/onboarding/FarmRegistrationScreen';

// Core Features
import { SmartScannerScreen } from '../screens/smart-lens/SmartScannerScreen';
import DiagnosisScreen from '../screens/DiagnosisScreen';
import DiagnosisResultScreen from '../screens/diagnosis/DiagnosisResultScreen';
import QnAScreen from '../screens/QnAScreen';
import { LogWriteScreen } from '../screens/farming-log/LogWriteScreen';
import { PostWriteScreen } from '../screens/community/PostWriteScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { PesticideManagementScreen } from '../screens/pesticide/PesticideManagementScreen';
import BarcodeScannerScreen from '../screens/pesticide/BarcodeScannerScreen';
import ReceiptOCRScreen from '../screens/fieldbook/ReceiptOCRScreen';
import DailyPrescriptionScreen from '../screens/DailyPrescriptionScreen';
import GrowthDiaryScreen from '../screens/GrowthDiaryScreen';
import FarmMapScreen from '../screens/FarmMapScreen';
import FarmMapAdvancedScreen from '../screens/FarmMapAdvancedScreen';
// FacilityInfoScreen 삭제됨 - FarmBasicInfoScreen으로 통합
import ReverseAnalysisScreen from '../screens/ReverseAnalysisScreen';
import PesticideRecordScreen from '../screens/PesticideRecordScreen';
import CanopyCameraScreen from '../screens/CanopyCameraScreen';

// Settings - Main
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';

// Settings - Details
import FarmBasicInfoScreen from '../screens/settings/FarmBasicInfoScreen';
import FarmDetailInfoScreen from '../screens/settings/FarmDetailInfoScreen';
import AlertSettingsScreen from '../screens/settings/AlertSettingsScreen';
import SensorRegistrationScreen from '../screens/settings/SensorRegistrationScreen';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// Settings - New Features
import FarmDetailScreen from '../screens/settings/FarmDetailScreen';
import SoilEnvironmentScreen from '../screens/settings/SoilEnvironmentScreen';
import SectorManageScreen from '../screens/settings/SectorManagementScreen';
import SensorManageScreen from '../screens/settings/SensorManageScreen';
import NotificationScreen from '../screens/settings/NotificationScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import AppInfoScreen from '../screens/settings/AppInfoScreen';

// Other
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TermsScreen from '../screens/TermsScreen';
import { ExpertProfileScreen } from '../screens/ExpertProfileScreen';
import FarmDoctorScreen from '../screens/farmDoctor/FarmDoctorScreen';
import SmartFarmScreen from '../screens/smartFarm/SmartFarmScreen';
import IrrigationScreen from '../screens/smartFarm/IrrigationScreen';
import FertilizerScreen from '../screens/smartFarm/FertilizerScreen';
import EnvironmentScreen from '../screens/smartFarm/EnvironmentScreen';
import HarvestPredictionScreen from '../screens/smartFarm/HarvestPredictionScreen';
import PreventionScreen from '../screens/farmDoctor/PreventionScreen';
import DiagnosisHistoryScreen from '../screens/farmDoctor/DiagnosisHistoryScreen';
import PrescriptionGuideScreen from '../screens/farmDoctor/PrescriptionGuideScreen';

// Store
import { useStore } from '../store/useStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const user = useStore(state => state.user);
    const isInitialized = useStore(state => state.isInitialized);
    const hasSeenOnboarding = useStore(state => state.hasSeenOnboarding);

    // Auth check is now only one factor. 
    // If user is logged in OR has seen onboarding, they go to main flow.
    // If they are strictly new and not logged in, they see onboarding.

    // [2026-01-18 Update] User Request: Skip Onboarding for Free Start Version.
    // Force main flow to ensure user goes straight to main screen on download.
    const showMainFlow = true; // !!user || hasSeenOnboarding;

    if (!isInitialized) {
        return <SplashScreen />;
    }

    console.log('🔄 [RootNavigator] Render.', 'User:', user ? user.name : 'Guest', 'HasSeenOnboarding:', hasSeenOnboarding);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
                {showMainFlow ? (
                    <Stack.Group>
                        {/* Main Tab (Guest or User) */}
                        <Stack.Screen name="MainTab" component={MainTabNavigator} />
                        <Stack.Screen name="FarmDoctor" component={FarmDoctorScreen} />
                        <Stack.Screen name="SmartFarm" component={SmartFarmScreen} />
                        <Stack.Screen name="Irrigation" component={IrrigationScreen} />
                        <Stack.Screen name="Fertilizer" component={FertilizerScreen} />
                        <Stack.Screen name="Environment" component={EnvironmentScreen} />
                        <Stack.Screen name="PesticideManagement" component={PesticideManagementScreen} />
                        <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
                        <Stack.Screen name="ReceiptOCR" component={ReceiptOCRScreen} />
                        <Stack.Screen name="HarvestPrediction" component={HarvestPredictionScreen} />
                        <Stack.Screen name="Prevention" component={PreventionScreen} />
                        <Stack.Screen name="DiagnosisHistory" component={DiagnosisHistoryScreen} />
                        <Stack.Screen name="PrescriptionGuide" component={PrescriptionGuideScreen} />

                        {/* Auth Screens (Accessible from MainTab now) */}
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

                        {/* Onboarding Flow (Post-Login or Post-Guest-Entry) */}
                        <Stack.Screen name="PermissionRequest" component={PermissionRequestScreen} />
                        <Stack.Screen name="FarmRegistration" component={FarmRegistrationScreen} />

                        {/* Other */}
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="NotificationList" component={NotificationsScreen} />
                        <Stack.Screen name="Terms" component={TermsScreen} />

                        {/* Settings & Profile Features */}
                        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
                        <Stack.Screen name="ReverseAnalysis" component={ReverseAnalysisScreen} />

                        {/* Menu Screen (Popup) */}
                        <Stack.Screen
                            name="Menu"
                            component={MenuScreen}
                            options={{
                                presentation: 'transparentModal',
                                animation: 'fade',
                                headerShown: false
                            }}
                        />

                        {/* Full Screen Modals */}
                        <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
                            <Stack.Screen name="SmartLens" component={SmartScannerScreen} />
                            <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
                            <Stack.Screen name="DiagnosisResult" component={DiagnosisResultScreen} />
                            <Stack.Screen name="LogWrite" component={LogWriteScreen} />
                            <Stack.Screen name="PostWrite" component={PostWriteScreen} />
                        </Stack.Group>
                    </Stack.Group>
                ) : (
                    <Stack.Group>
                        <Stack.Screen name="OnboardingSlides" component={OnboardingSlidesScreen} />
                        {/* Auth is also here if they want to login from Onboarding */}
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
