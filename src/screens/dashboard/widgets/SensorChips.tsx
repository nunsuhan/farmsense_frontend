import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from '../../../components/common/Text';
import { colors, spacing } from '../../../theme/colors';

const SENSORS = [
    { id: '1', label: '외부기온', value: '24.5°C', icon: 'thermometer', status: 'normal' },
    { id: '2', label: '하우스', value: '26.2°C', icon: 'home-thermometer', status: 'warning' },
    { id: '3', label: '습도', value: '65%', icon: 'water-percent', status: 'normal' },
    { id: '4', label: 'CO2', value: '450ppm', icon: 'cloud', status: 'normal' },
    { id: '5', label: '일사량', value: '600W', icon: 'weather-sunny', status: 'good' },
];

export const SensorChips: React.FC = () => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {SENSORS.map((sensor) => (
                <View key={sensor.id} style={styles.chip}>
                    <MaterialCommunityIcons
                        name={sensor.icon}
                        size={16}
                        color={sensor.status === 'warning' ? colors.warning : colors.primary}
                    />
                    <Text variant="caption" style={{ marginLeft: 4, marginRight: 8 }}>{sensor.label}</Text>
                    <Text variant="caption" weight="bold">{sensor.value}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingBottom: spacing.m,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
