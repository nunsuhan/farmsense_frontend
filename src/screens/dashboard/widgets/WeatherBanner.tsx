import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../../components/common/Card';
import { Text } from '../../../components/common/Text';
import { colors, spacing } from '../../../theme/colors';

export const WeatherBanner: React.FC = () => {
    // Mock Data
    const weather = { temp: 24, humidity: 65, condition: '맑음', icon: 'weather-sunny' };
    const pmi = { score: 85, status: '안전', disease: '노균병 위험 낮음', color: colors.success };

    return (
        <Card style={styles.container}>
            {/* 1. Left: Weather Info */}
            <View style={styles.weatherSection}>
                <View style={styles.weatherHeader}>
                    <MaterialCommunityIcons name={weather.icon} size={40} color="#FDB813" />
                    <View style={{ marginLeft: spacing.s }}>
                        <Text variant="h2">{weather.temp}°C</Text>
                        <Text variant="caption">{weather.condition} | 습도 {weather.humidity}%</Text>
                    </View>
                </View>
                <Text variant="caption" style={{ marginTop: spacing.s, opacity: 0.8 }}>
                    김천시 대항면 기준
                </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* 2. Right: PMI Info */}
            <View style={styles.pmiSection}>
                <View style={styles.pmiHeader}>
                    <Text variant="caption" weight="bold" color={colors.textSub}>병해충 예찰 (PMI)</Text>
                    <View style={[styles.badge, { backgroundColor: pmi.color }]}>
                        <Text variant="caption" color="white" weight="bold">{pmi.status}</Text>
                    </View>
                </View>
                <Text variant="h3" color={pmi.color} style={{ marginVertical: 4 }}>
                    {pmi.score}점
                </Text>
                <Text variant="caption" color={colors.textSub} numberOfLines={1}>
                    {pmi.disease}
                </Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: spacing.m,
    },
    weatherSection: {
        flex: 1.2,
        justifyContent: 'center',
    },
    weatherHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.m,
        height: '80%',
        alignSelf: 'center',
    },
    pmiSection: {
        flex: 1,
        justifyContent: 'center',
    },
    pmiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
});
