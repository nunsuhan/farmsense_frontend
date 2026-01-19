/**
 * ComparisonCard.tsx
 * 병해 비교 카드 컴포넌트
 * 
 * "노균병 vs 약해" 등의 증상 비교
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ComparisonItem {
    label: string;
    symptoms: string[];
    image?: any;
    color?: string;
}

interface ComparisonCardProps {
    title: string;
    leftItem: ComparisonItem;
    rightItem: ComparisonItem;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
    title,
    leftItem,
    rightItem,
}) => {
    return (
        <View style={styles.container}>
            {/* 제목 */}
            <View style={styles.header}>
                <Ionicons name="git-compare-outline" size={24} color="#10B981" />
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* 비교 컨텐츠 */}
            <View style={styles.comparisonContainer}>
                {/* 왼쪽 항목 */}
                <View style={styles.item}>
                    <View
                        style={[
                            styles.itemHeader,
                            { backgroundColor: leftItem.color || '#FEF3C7' },
                        ]}
                    >
                        <Text style={styles.itemLabel}>{leftItem.label}</Text>
                    </View>

                    {leftItem.image && (
                        <Image source={leftItem.image} style={styles.itemImage} />
                    )}

                    <View style={styles.symptomsList}>
                        {leftItem.symptoms.map((symptom, index) => (
                            <View key={index} style={styles.symptomItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.symptomText}>{symptom}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 구분선 */}
                <View style={styles.divider}>
                    <Text style={styles.vsText}>VS</Text>
                </View>

                {/* 오른쪽 항목 */}
                <View style={styles.item}>
                    <View
                        style={[
                            styles.itemHeader,
                            { backgroundColor: rightItem.color || '#DBEAFE' },
                        ]}
                    >
                        <Text style={styles.itemLabel}>{rightItem.label}</Text>
                    </View>

                    {rightItem.image && (
                        <Image source={rightItem.image} style={styles.itemImage} />
                    )}

                    <View style={styles.symptomsList}>
                        {rightItem.symptoms.map((symptom, index) => (
                            <View key={index} style={styles.symptomItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.symptomText}>{symptom}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    comparisonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    item: {
        flex: 1,
    },
    itemHeader: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    itemImage: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        marginBottom: 12,
    },
    symptomsList: {
        gap: 8,
    },
    symptomItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginTop: 6,
    },
    symptomText: {
        flex: 1,
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
    },
    divider: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vsText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#9CA3AF',
    },
});

export default ComparisonCard;
