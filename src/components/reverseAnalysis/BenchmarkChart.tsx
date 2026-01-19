// src/components/reverseAnalysis/BenchmarkChart.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BenchmarkChartProps {
    userValue: number;         // 4200 (내 작년 생산량 or 현재?) - The prompt chart implies this is "current goal" vs bench
    goalValue: number;         // 5000 (Target)
    avgValue: number;          // 4500 (Regional Avg)
    topValue: number;          // 5500 (Top 10%)
    percentile: number;        // User percentile rank
}

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({
    userValue, goalValue, avgValue, topValue, percentile
}) => {
    // Scale calculation
    // Find min/max to set chart boundaries
    const values = [userValue, goalValue, avgValue, topValue];
    const minValue = Math.min(...values) * 0.8;
    const maxValue = Math.max(...values) * 1.1;
    const range = maxValue - minValue;

    const getPosition = (val: number) => {
        return ((val - minValue) / range) * 100;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>내 농장 위치 비교</Text>

            <View style={styles.chartArea}>
                {/* Horizontal Line */}
                <View style={styles.line} />

                {/* Markers */}
                <View style={[styles.markerContainer, { left: `${getPosition(userValue)}%` }]}>
                    <Text style={styles.markerLabel}>작년</Text>
                    <View style={[styles.dot, { backgroundColor: '#9CA3AF' }]} />
                    <Text style={styles.markerValue}>{userValue.toLocaleString()}</Text>
                </View>

                <View style={[styles.markerContainer, { left: `${getPosition(avgValue)}%` }]}>
                    <Text style={styles.markerLabel}>평균</Text>
                    <View style={[styles.dot, { backgroundColor: '#60A5FA' }]} />
                    <Text style={styles.markerValue}>{avgValue.toLocaleString()}</Text>
                </View>

                <View style={[styles.markerContainer, { left: `${getPosition(topValue)}%` }]}>
                    <Text style={styles.markerLabel}>상위10%</Text>
                    <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={styles.markerValue}>{topValue.toLocaleString()}</Text>
                </View>

                {/* Goal Marker (User Arrow) */}
                <View style={[styles.goalContainer, { left: `${getPosition(goalValue)}%` }]}>
                    <Text style={styles.goalLabel}>목표</Text>
                    <Text style={styles.goalArrow}>▼</Text>
                    <View style={styles.goalDot} />
                    <Text style={styles.goalValue}>{goalValue.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    📈 당신의 목표는 상위 <Text style={styles.highlight}>{percentile}%</Text> 수준입니다.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 24,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    chartArea: {
        height: 80,
        position: 'relative',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    line: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#E5E7EB',
    },
    markerContainer: {
        position: 'absolute',
        alignItems: 'center',
        top: 10,
        marginLeft: -20, // rough center alignment
        width: 40,
    },
    markerLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    markerValue: {
        fontSize: 10,
        fontWeight: '600',
        color: '#4B5563',
    },
    goalContainer: {
        position: 'absolute',
        alignItems: 'center',
        top: 0,
        marginLeft: -25, // center
        width: 50,
        zIndex: 10,
    },
    goalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10B981',
    },
    goalArrow: {
        fontSize: 14,
        color: '#10B981',
        lineHeight: 14,
    },
    goalDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: 'white',
        marginTop: -2,
    },
    goalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10B981',
        marginTop: 4,
    },
    footer: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#374151',
    },
    highlight: {
        color: '#8B5CF6',
        fontWeight: 'bold',
    },
});
