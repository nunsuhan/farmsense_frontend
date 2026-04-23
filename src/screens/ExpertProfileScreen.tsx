import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Text } from '../components/common/Text';
import { colors } from '../theme/colors';

export const ExpertProfileScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { expert } = route.params || {};

    // Mock Fee Calculation
    const CONSULTING_FEE = expert?.price || 50000;
    const PLATFORM_FEE_RATE = 0.20;
    const PLATFORM_FEE = CONSULTING_FEE * PLATFORM_FEE_RATE;
    const EXPERT_NET_PAY = CONSULTING_FEE - PLATFORM_FEE;

    const handlePaymentRequest = () => {
        Alert.alert(
            '상담 신청',
            '전문가에게 상담 신청을 전송할까요?\n\n시범 기간 동안은 무료로 제공됩니다.',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '신청하기',
                    onPress: () => {
                        Alert.alert('완료', '전문가에게 상담 신청이 전송되었습니다.');
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    if (!expert) return <View><Text>Error loading expert info</Text></View>;

    return (
        <ScreenWrapper title="전문가 프로필">
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Image source={{ uri: expert.image }} style={styles.profileImage} />
                    <Text variant="h3" style={{ marginTop: 16 }}>{expert.name}</Text>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{expert.badge}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text variant="h5">{expert.reputation}</Text>
                        <Text variant="caption" color="gray">평판 점수</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="h5">98%</Text>
                        <Text variant="caption" color="gray">만족도</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="h5">150회</Text>
                        <Text variant="caption" color="gray">상담 진행</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="h5" style={{ marginBottom: 8 }}>자기소개</Text>
                    <Text variant="body1" color="gray" style={{ lineHeight: 24 }}>
                        안녕하세요, 샤인머스캣과 포도 농사 20년 경력의 {expert.name}입니다.
                        초기 식재부터 병해충 관리, 수확 후 관리까지 전 과정을 컨설팅해드립니다.
                        특히 전지/전정과 토양 관리에 강점이 있습니다.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text variant="h5" style={{ marginBottom: 8 }}>상담 서비스</Text>
                    <View style={styles.serviceCard}>
                        <Text variant="h6">1:1 화상 컨설팅 (30분)</Text>
                        <Text variant="body2" color="gray" style={{ marginTop: 4 }}>
                            실시간 영상통화로 농장 상태를 보여주며 진단받으세요.
                        </Text>
                        <Text variant="h5" color="primary" style={{ marginTop: 12 }}>
                            {CONSULTING_FEE.toLocaleString()}원
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.payButton} onPress={handlePaymentRequest}>
                    <Text style={styles.payButtonText}>상담 신청하기</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 24 },
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
    badgeContainer: { backgroundColor: '#FFF9C4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
    badgeText: { color: '#FBC02D', fontWeight: 'bold' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 24 },
    statItem: { alignItems: 'center' },

    section: { marginBottom: 30 },
    serviceCard: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white',
    },
    payButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    payButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
