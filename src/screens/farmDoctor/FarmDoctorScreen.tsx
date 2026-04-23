import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

const FarmDoctorScreen = () => {
    const navigation = useNavigation<any>();

    const MenuCard = ({ title, desc, icon, onPress, color, iconColor = '#374151' }: any) => (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper title="건강 체크" showBack={false} showMenu={false}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.subtitle}>포도 건강을 지키는 AI 체크</Text>
                </View>

                {/* 관찰 서비스 */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>관찰 서비스</Text>
                    <MenuCard
                        title="잎/과실 체크"
                        desc="사진으로 이상 증상 확인"
                        icon="camera"
                        color="#E0F2FE"
                        iconColor="#0284C7"
                        onPress={() => navigation.navigate('Diagnosis')}
                    />
                    <MenuCard
                        title="예방 체크"
                        desc="실시간 위험도 분석"
                        icon="shield-checkmark"
                        color="#ECFDF5"
                        iconColor="#059669"
                        onPress={() => navigation.navigate('Prevention')}
                    />
                </View>

                {/* 이력 및 가이드 */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>이력 및 가이드</Text>
                    <MenuCard
                        title="관찰 이력"
                        desc="나의 관찰 기록"
                        icon="time"
                        color="#EFF6FF"
                        iconColor="#2563EB"
                        onPress={() => navigation.navigate('DiagnosisHistory')}
                    />
                    <MenuCard
                        title="처방 가이드"
                        desc="증상별 약제 검색"
                        icon="book"
                        color="#FAF5FF"
                        iconColor="#9333EA"
                        onPress={() => navigation.navigate('PrescriptionGuide')}
                    />
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    headerSection: {
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
});

export default FarmDoctorScreen;
