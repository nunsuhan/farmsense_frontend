import React, { useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { colors, shadows, spacing } from '../../theme/colors';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode;
    gradient?: boolean; // enable gradient background
    gradientColors?: [string, string]; // optional custom gradient colors
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    style,
    icon,
    gradient = false,
    gradientColors,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };
    const getBackgroundColor = () => {
        if (disabled) return colors.textDisabled;
        if (variant === 'primary') return colors.primary;
        if (variant === 'secondary') return colors.secondary;
        return 'transparent';
    };

    const getTextColor = () => {
        if (variant === 'outline') return colors.primary;
        if (variant === 'ghost') return colors.textSub;
        if (disabled) return '#FFFFFF';
        return '#FFFFFF';
    };

    const getHeight = () => {
        if (size === 'small') return 32;
        if (size === 'large') return 56;
        return 48; // medium
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || isLoading}
                activeOpacity={0.8}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.container,
                    {
                        backgroundColor: gradient ? 'transparent' : getBackgroundColor(),
                        height: getHeight(),
                        borderColor: variant === 'outline' ? colors.primary : 'transparent',
                        borderWidth: variant === 'outline' ? 1 : 0,
                    },
                    variant === 'primary' && shadows.small,
                    style,
                ]}
            >
                {gradient && (
                    <LinearGradient
                        colors={gradientColors ?? [colors.accentPrimary, colors.accentSecondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                {isLoading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <>
                        {icon}
                        <Text
                            variant="button"
                            color={getTextColor()}
                            style={icon ? { marginLeft: spacing.s } : undefined}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingHorizontal: spacing.m,
    },
});
