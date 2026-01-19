// src/components/reverseAnalysis/RecommendationCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Recommendation } from '../../services/reverseAnalysisApi';

interface RecommendationCardProps {
    item: Recommendation;
    onPress?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item, onPress }) => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
            case 'MEDIUM': return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
            case 'LOW': return { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' };
            default: return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'HIGH': return '높음';
            case 'MEDIUM': return '중간';
            case 'LOW': return '낮음';
            default: return '보통';
        }
    };

    const colors = getPriorityColor(item.priority);

    return (
        <View style={[styles.container, { borderColor: colors.border }]}>
            <View style={styles.header}>
                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                        {getPriorityLabel(item.priority)}
                    </Text>
                </View>
                <Text style={styles.category}>{item.category}</Text>
            </View>

            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.method}>{item.method}</Text>

            {onPress && (
                <TouchableOpacity style={styles.button} onPress={onPress}>
                    <Text style={styles.buttonText}>상세보기</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    category: {
        fontSize: 12,
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    action: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    method: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
    },
    button: {
        alignSelf: 'flex-end',
    },
    buttonText: {
        fontSize: 13,
        color: '#6B7280',
        textDecorationLine: 'underline',
    },
});
