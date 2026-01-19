// src/components/common/HelpModal.tsx

import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface HelpPoint {
    title: string;
    description: string;
}

interface HelpModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    points: HelpPoint[];
}

const { width, height } = Dimensions.get('window');

const HelpModal: React.FC<HelpModalProps> = ({
    visible,
    onClose,
    title,
    subtitle,
    points,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Dimmed Background */}
                <BlurView intensity={20} tint="dark" style={styles.blurBackground}>
                    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
                </BlurView>

                {/* Modal Card */}
                <View style={styles.modalCard}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color="#F59E0B" />
                        </View>
                        <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Title & Subtitle */}
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    <View style={styles.divider} />

                    {/* Content Points */}
                    <ScrollView
                        style={styles.contentScroll}
                        showsVerticalScrollIndicator={false}
                    >
                        {points.map((point, index) => (
                            <View key={index} style={styles.pointContainer}>
                                <View style={styles.bulletPoint} />
                                <View style={styles.textContainer}>
                                    <Text style={styles.pointTitle}>{point.title}</Text>
                                    <Text style={styles.pointDesc}>{point.description}</Text>
                                </View>
                            </View>
                        ))}
                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* Action Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalCard: {
        width: width * 0.85,
        maxHeight: height * 0.7,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        padding: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    contentScroll: {
        maxHeight: 300,
    },
    pointContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginTop: 7,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    pointTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
    },
    pointDesc: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    closeButton: {
        backgroundColor: '#111827',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default HelpModal;
