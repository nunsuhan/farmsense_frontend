import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityScreen } from '../screens/CommunityScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { PostWriteScreen } from '../screens/community/PostWriteScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CommunityStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="PostWrite" component={PostWriteScreen} />
        </Stack.Navigator>
    );
};
