import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

const GlobalErrorBar = () => {
    const error = useStore((state) => state.error);
    const setError = useStore((state) => state.setError);
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (error) {
            // Fade In
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto Dismiss after 3 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            // Reset if error is cleared externally
            opacity.setValue(0);
        }
    }, [error]);

    const handleDismiss = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setError(null);
        });
    };

    if (!error) return null;

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.content}>
                    <Ionicons name="alert-circle" size={24} color="#FFF" style={styles.icon} />
                    <Text style={styles.text} numberOfLines={2}>
                        {error}
                    </Text>
                    <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20, // Bottom of screen (safe area handled inside or via SafeView)
        left: 20,
        right: 20,
        backgroundColor: '#EF4444', // Red
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        marginRight: 12,
    },
    text: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default GlobalErrorBar;
