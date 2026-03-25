import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackNavigator } from './HomeStackNavigator';
import { FarmingLogStackNavigator } from './FarmingLogStackNavigator';
import { CommunityStackNavigator } from './CommunityStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import BottomTabBar from '../components/common/BottomTabBar';
import { colors } from '../theme/colors';

// Placeholder screens for now
const PlaceholderScreen = (name: string) => () => (
    <React.Fragment></React.Fragment> // Empty for now
);

const Tab = createBottomTabNavigator();

import FarmDoctorScreen from '../screens/farmDoctor/FarmDoctorScreen';

// ... (imports)

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: '홈' }} />
            <Tab.Screen name="FarmingLog" component={FarmingLogStackNavigator} options={{ title: '영농일지' }} />
            <Tab.Screen name="Community" component={CommunityStackNavigator} options={{ title: '커뮤니티' }} />
            <Tab.Screen name="MyFarm" component={SettingsStackNavigator} options={{ title: '내 농장' }} />
        </Tab.Navigator>
    );
};
