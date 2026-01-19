// src/components/reverseAnalysis/GapProgressBar.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GapProgressBarProps {
    label: string;
    icon: string;
    current: number;
    optimal: number;
    min: number;
    max: number;
    unit: string;
    gap: number;
}

export const GapProgressBar: React.FC<GapProgressBarProps> = ({
    label, icon, current, optimal, min, max, unit, gap
}) => {
    // 위치 계산 (0-100%)
    const range = max - min;
    // Prevent division by zero
    const safeRange = range === 0 ? 1 : range;

    const currentPos = Math.max(0, Math.min(100, ((current - min) / safeRange) * 100));
    const optimalPos = Math.max(0, Math.min(100, ((optimal - min) / safeRange) * 100));

    // 상태 색상
    const getStatusColor = () => {
        const absGap = Math.abs(current - optimal);
        const tolerance = safeRange * 0.1; // 10% tolerance

        if (absGap < tolerance * 0.5) return '#4CAF50'; // 녹색: 5% 이내
        if (absGap < tolerance * 1.5) return '#FFC107'; // 노랑
        return '#F44336'; // 빨강
    };

    const getGapText = () => {
        // Round for display
        const displayGap = Math.round(Math.abs(current - optimal) * 10) / 10;

        if (current < optimal) return `🔼 ${displayGap}${unit} 높여야 함`;
        if (current > optimal) return `🔽 ${displayGap}${unit} 낮춰야 함`;
        return '✅ 최적 범위 내';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>

            <Text style={styles.values}>
                현재 {current}{unit} → 목표 {optimal}{unit}
            </Text>

            <View style={styles.barContainer}>
                {/* 배경 바 */}
                <View style={styles.barBackground} />

                {/* 적정 범위 표시 (Approximately +/- 10% from optimal) */}
                <View style={[
                    styles.optimalRange,
                    {
                        left: `${Math.max(0, ((optimal - (safeRange * 0.1)) - min) / safeRange * 100)}%`,
                        width: `${((safeRange * 0.2) / safeRange) * 100}%`
                    }
                ]} />

                {/* 최적 위치 마커 (Target line) */}
                <View style={[
                    styles.optimalMarker,
                    { left: `${optimalPos}%` }
                ]} />

                {/* 현재 위치 마커 (Circle) */}
                <View style={[
                    styles.currentMarker,
                    { left: `${currentPos}%`, backgroundColor: getStatusColor() }
                ]} />
            </View>

            <Text style={[styles.gapText, { color: getStatusColor() }]}>
                {getGapText()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    values: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    barContainer: {
        height: 30,
        position: 'relative',
        marginBottom: 8,
        justifyContent: 'center',
    },
    barBackground: {
        position: 'absolute',
        height: 8,
        left: 0,
        right: 0,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    optimalRange: {
        position: 'absolute',
        height: 8,
        backgroundColor: '#C8E6C9', // Light green range
        borderRadius: 4,
    },
    currentMarker: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        marginLeft: -10, // Center it
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        top: 5, // Vertically center on the 30px container (bar is 8px high) - actually needs manual alignment
        marginTop: -5, // Adjust based on height vs bar
    },
    optimalMarker: {
        position: 'absolute',
        width: 2,
        height: 24,
        backgroundColor: '#2E7D32', // Dark green target line
        marginLeft: -1,
        top: 3,
    },
    gapText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
    },
});
