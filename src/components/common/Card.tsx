// src/components/common/Card.tsx
import React from 'react';

import { colors, shadows, spacing } from '../../theme/colors';

import { View, TouchableOpacity, StyleSheet, GestureResponderEvent, ViewStyle, StyleProp } from 'react-native';
interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: (event: GestureResponderEvent) => void;
    elevation?: 'small' | 'medium' | 'large';
    icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevation = 'small', icon }) => {
    const shadowStyle = elevation === 'small' ? shadows.small : elevation === 'medium' ? shadows.medium : shadows.large;
    const Container = onPress ? TouchableOpacity : View;
    return (
        <Container
            onPress={onPress}
            style={[styles.container, shadowStyle, { backgroundColor: colors.surface }, style]}
        >
            {icon && <View style={{ marginRight: spacing.s }}>{icon}</View>}
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: spacing.m,
        marginVertical: spacing.s,
    },
});
