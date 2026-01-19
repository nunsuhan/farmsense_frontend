import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../components/common/Text';
import { colors, shadows, spacing } from '../../../theme/colors';

const { width } = Dimensions.get('window');

const SERVICES = [
    { id: '1', title: 'AI 병해 진단', icon: 'camera-iris', color: '#10B981', route: 'SmartLens' },
    { id: '2', title: 'AI 상담소', icon: 'robot', color: '#8B5CF6', route: 'QnAScreen' },
    { id: '3', title: '영농 일지', icon: 'notebook', color: '#F59E0B', route: 'FarmingLog' },
    { id: '4', title: '농약 안전', icon: 'bottle-tonic-plus', color: '#EF4444', route: 'PesticideManagement' }, // This route needs to be added to MainTab or Root
];

export const ServiceGrid: React.FC = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {SERVICES.map((service) => (
                <TouchableOpacity
                    key={service.id}
                    style={styles.gridItem}
                    activeOpacity={0.7}
                    onPress={() => {
                        if (service.route) {
                            navigation.navigate(service.route);
                        }
                    }}
                >
                    <View style={[styles.iconContainer, { backgroundColor: service.color + '15' }]}>
                        <MaterialCommunityIcons name={service.icon} size={32} color={service.color} />
                    </View>
                    <Text variant="body2" weight="medium" style={{ marginTop: spacing.s }}>
                        {service.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: spacing.m,
    },
    gridItem: {
        width: (width - 40 - spacing.m) / 2 - 5, // half width minus padding
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: spacing.m,
        ...shadows.small,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
});
