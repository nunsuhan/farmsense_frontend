import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmingLogScreen } from '../screens/farming-log/FarmingLogScreen';
import { LogWriteScreen } from '../screens/farming-log/LogWriteScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const FarmingLogStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
            <Stack.Screen name="FarmingLogTab" component={FarmingLogScreen} />
            <Stack.Screen name="LogWrite" component={LogWriteScreen} />
        </Stack.Navigator>
    );
};
