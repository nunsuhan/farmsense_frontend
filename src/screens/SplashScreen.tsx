// src/screens/SplashScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';

const SplashScreen: React.FC = () => (
    <View style={styles.splash}>
        <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
        />
        <Text style={styles.splashTitle}>FarmSense</Text>
        <Text style={styles.splashSubtitle}>포도 농가를 위한 스마트 파트너</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.splashLoader} />
    </View>
);

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    splashTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    splashSubtitle: {
        fontSize: 16,
        color: colors.textSub,
        marginBottom: 40,
    },
    splashLoader: {
        marginTop: 20,
    },
});

export default SplashScreen;
