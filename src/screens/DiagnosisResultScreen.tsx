/**
 * DiagnosisResultScreen.tsx
 * 병해 진단 결과 화면
 * 
 * SDK 52 규격 준수
 * severity 기반 동적 UI 컬러
 * 노균병 vs 약해 비교 카드
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ComparisonCard from '../../components/common/ComparisonCard';

const { width } = Dimensions.get('window');

// ============================================
// Type Definitions
// ============================================

interface DiagnosisResult {
    id: string;
    imageUrl: string;
    disease: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
    timestamp: string;
}

// ============================================
// Severity 기반 UI 컬러 함수
// ============================================

const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'low':
            return '#10B981'; // Green
        case 'medium':
            return '#F59E0B'; // Yellow/Orange
        case 'high':
            return '#EF4444'; // Red
        default:
            return '#6B7280'; // Gray
    }
};

const getSeverityGradient = (
    severity: 'low' | 'medium' | 'high'
): string[] => {
    switch (severity) {
        case 'low':
            return ['#ECFDF5', '#D1FAE5'];
        case 'medium':
            return ['#FEF3C7', '#FDE68A'];
        case 'high':
            return ['#FEE2E2', '#FECACA'];
        default:
            return ['#F3F4F6', '#E5E7EB'];
    }
};

const getSeverityLabel = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'low':
            return '낮음';
        case 'medium':
            return '보통';
        case 'high':
            return '높음';
        default:
            return '알 수 없음';
    }
};

const getSeverityIcon = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'low':
            return 'checkmark-circle';
        case 'medium':
            return 'alert-circle';
        case 'high':
            return 'warning';
        default:
            return 'help-circle';
    }
};

// ============================================
// Main Component
// ============================================

const DiagnosisResultScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    // Route params에서 진단 결과 가져오기
    const result: DiagnosisResult = route.params?.result || {
        id: 'test-1',
        imageUrl: '',
        disease: '노균병',
        confidence: 85,
        severity: 'medium',
        recommendations: [
            '환기를 강화하여 습도를 낮추세요',
            '다이센엠-45 1000배 희석액을 살포하세요',
            '병든 잎은 즉시 제거하세요',
        ],
        timestamp: new Date().toISOString(),
    };

    const severityColor = getSeverityColor(result.severity);
    const severityGradient = getSeverityGradient(result.severity);

    return (
        <ScreenWrapper title="진단 결과" showBack>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 진단 이미지 */}
                {result.imageUrl && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: result.imageUrl }}
                            style={styles.diagnosisImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Severity 기반 결과 카드 */}
                <LinearGradient
                    colors={severityGradient}
                    style={styles.resultCard}
                >
                    <View style={styles.resultHeader}>
                        <View
                            style={[
                                styles.severityBadge,
                                { backgroundColor: severityColor },
                            ]}
                        >
                            <Ionicons
                                name={getSeverityIcon(result.severity)}
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.severityText}>
                                {getSeverityLabel(result.severity)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.diseaseTitle}>{result.disease}</Text>

                    <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceLabel}>신뢰도</Text>
                        <View style={styles.confidenceBar}>
                            <View
                                style={[
                                    styles.confidenceFill,
                                    {
                                        width: `${result.confidence}%`,
                                        backgroundColor: severityColor,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.confidenceValue}>{result.confidence}%</Text>
                    </View>
                </LinearGradient>

                {/* 처방 권장사항 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="medical-outline" size={24} color="#10B981" />
                        <Text style={styles.sectionTitle}>처방 권장사항</Text>
                    </View>

                    <View style={styles.recommendationsList}>
                        {result.recommendations.map((recommendation, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.recommendationItem,
                                    { borderLeftColor: severityColor },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.recommendationNumber,
                                        { backgroundColor: severityColor },
                                    ]}
                                >
                                    <Text style={styles.recommendationNumberText}>
                                        {index + 1}
                                    </Text>
                                </View>
                                <Text style={styles.recommendationText}>{recommendation}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 노균병 vs 약해 비교 카드 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="school-outline" size={24} color="#10B981" />
                        <Text style={styles.sectionTitle}>헷갈리기 쉬운 증상 구분</Text>
                    </View>

                    <ComparisonCard
                        title="노균병 vs 약해"
                        leftItem={{
                            label: '노균병',
                            symptoms: [
                                '잎 뒷면에 흰색 곰팡이',
                                '불규칙한 황색 반점',
                                '습한 날씨에 악화',
                                '잎이 말라 떨어짐',
                            ],
                            color: '#FEF3C7',
                        }}
                        rightItem={{
                            label: '약해',
                            symptoms: [
                                '잎 전체가 균일하게 변색',
                                '약제 살포 후 2-3일 내 발생',
                                '날씨와 무관',
                                '새 잎은 정상',
                            ],
                            color: '#DBEAFE',
                        }}
                    />
                </View>

                {/* 추가 도움말 */}
                <View style={styles.helpCard}>
                    <Ionicons name="information-circle" size={24} color="#3B82F6" />
                    <View style={styles.helpContent}>
                        <Text style={styles.helpTitle}>확실하지 않을 때는?</Text>
                        <Text style={styles.helpText}>
                            AI 상담소에서 전문가에게 물어보세요!
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.helpButton}
                        onPress={() => navigation.navigate('QnAScreen')}
                    >
                        <Text style={styles.helpButtonText}>상담하기</Text>
                        <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
    },
    imageContainer: {
        width: '100%',
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    diagnosisImage: {
        width: '100%',
        height: '100%',
    },
    resultCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    severityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    severityText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    diseaseTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 16,
    },
    confidenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    confidenceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    confidenceBar: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        borderRadius: 4,
    },
    confidenceValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    recommendationsList: {
        gap: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recommendationNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recommendationNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    recommendationText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 4,
    },
    helpText: {
        fontSize: 13,
        color: '#3B82F6',
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    helpButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
});

export default DiagnosisResultScreen;
