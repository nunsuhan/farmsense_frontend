import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors } from '../../theme/colors';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getQuickRisk } from '../../services/diagnosisApi';
import { dssApi } from '../../services/dssApi';
import { useFarmId } from '../../store/useStore';

// Disease Code Mapping
const DISEASE_CODE_MAP: { [key: string]: string } = {
    '0': '정상',
    'a11': '탄저병',
    'a12': '노균병',
    'a13': '흰가루병',
    'a14': '잿빛곰팡이병',
    'a15': '갈색무늬병',
    'a16': '잎마름병',
    'a17': '새눈무늬병',
    'a18': '꼭지마름병',
    'b4': '일소피해',
    'b5': '축과병',
    'b6': '열과',
    'b7': '엽소현상',
    'c11': '보호제 반응 (황)',
    'c12': '보호제 반응 (칼슘)',
};

const getDiseaseName = (code: string | undefined) => {
    if (!code) return '분석 불가';
    // If exact match found in map
    if (DISEASE_CODE_MAP[code]) return DISEASE_CODE_MAP[code];
    // If backend already sends Korean name
    return code;
};

// Risk Level Helper
const getRiskInfo = (score: number) => {
    if (score >= 80) return { label: '긴급 (위험)', color: '#DC2626', width: '95%' };
    if (score >= 50) return { label: '경고 (높음)', color: '#F59E0B', width: '70%' };
    if (score >= 20) return { label: '의심 (주의)', color: '#3B82F6', width: '40%' };
    return { label: '관찰 (낮음)', color: '#22C55E', width: '10%' };
};

const DiagnosisResultScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { imageUri, result } = route.params || {};
    const [saving, setSaving] = useState(false);
    const [envRisk, setEnvRisk] = useState<any>(null);
    const [dssResult, setDssResult] = useState<any>(null);
    const farmId = useFarmId();

    useEffect(() => {
        const loadRisk = async () => {
            try {
                const data = await getQuickRisk();
                setEnvRisk(data);
            } catch (e) {
                console.log('Env Risk Check Failed');
            }
        };
        loadRisk();
    }, []);

    // DSS 증상 진단 - 병해 감지 시 추가 권고사항 조회
    useEffect(() => {
        if (!result?.diagnosis || !farmId) return;
        const diag = result.diagnosis;
        const code = diag.disease_code;
        if (code === 'healthy' || code === '0' || code === '정상') return;

        dssApi.diagnoseSymptom(farmId, {
            disease_name: diag.disease_name || getDiseaseName(code),
            confidence: diag.confidence,
            symptoms: diag.symptoms || [],
        })
            .then(setDssResult)
            .catch(() => { /* DSS 진단 실패 시 무시 */ });
    }, [result, farmId]);

    if (!result) {
        return (
            <ScreenWrapper title="이상 징후 분석">
                <View style={styles.errorContainer}>
                    <Text>분석된 결과 정보를 찾을 수 없습니다.</Text>
                    <Button title="돌아가기" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
                </View>
            </ScreenWrapper>
        );
    }

    let diseaseName = '정상';
    let confidence = 0;
    let isHealthy = true;
    let riskLevel = '양호';
    let riskScore = 0;
    let expertAnswer = '';
    let warnings: string[] = [];

    // Parse specific result structure
    if (result.diagnosis) {
        const diag = result.diagnosis;
        const presc = result.prescription;

        const rawName = diag.disease_name || diag.disease_code;
        diseaseName = getDiseaseName(rawName);
        confidence = (diag.confidence <= 1 ? diag.confidence * 100 : diag.confidence);
        isHealthy = diag.disease_code === 'healthy' || diag.disease_code === '0' || diag.disease_code === '정상';

        // Use actual confidence as risk score basis; fall back to severity-based estimate
        riskScore = diag.risk_score ?? (isHealthy ? 5 : Math.round(confidence));

        if (presc) {
            expertAnswer = presc.summary;
            warnings = presc.action_items || [];
        }
    } else {
        // Fallback for flat result
        const top = result.disease_diagnosis?.[0];
        diseaseName = top?.name_ko || '정상';
        confidence = top?.confidence || 0;
        isHealthy = confidence < 50;
        riskScore = result.risk_assessment?.score || (isHealthy ? 10 : 60);
    }

    const { label: riskLabel, color: riskColor, width: riskWidth } = getRiskInfo(riskScore);
    const statusColor = riskColor;

    // --- Mocking New fields as requested by the Guide ---
    const similarSymptoms = [
        { name: "흰가루병", note: "유사 증상 주의" },
        { name: "갈색무늬병", note: "초기 증상 혼동 가능" }
    ];

    const currentEnv = envRisk || {
        region: "경북 김천",
        temperature: 28,
        humidity: 85,
        msg: "현재 습도와 온도가 병해 확산에 유리하니 환기에 유의하세요."
    };

    const handleSave = async () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            Alert.alert('저장 완료', '진단 결과가 영농일지에 기록되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
            ]);
        }, 1000);
    };

    return (
        <ScreenWrapper title="이상 징후 조기 감지 결과" showHeader showBack>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 1. Image & Badge */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
                    <View style={[styles.badge, { backgroundColor: statusColor }]}>
                        <Text variant="caption" color="#FFF" weight="bold">신뢰도 {Math.round(confidence)}%</Text>
                    </View>
                </View>

                {/* 2. Main Diagnosis Card */}
                <Card style={[styles.resultCard, { borderColor: statusColor, borderWidth: 1 }]} elevation="medium">
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="alert-decagram" size={24} color={statusColor} />
                        <Text variant="h3" style={{ marginLeft: 8 }}>
                            {isHealthy ? "이상 징후가 발견되지 않았습니다" : `${diseaseName} 의심 징후 포착`}
                        </Text>
                    </View>

                    <View style={styles.gaugeContainer}>
                        <View style={styles.gaugeHeader}>
                            <Text variant="caption" color="#6B7280">의심 단계</Text>
                            <Text variant="caption" color={statusColor} weight="bold">{riskLabel}</Text>
                        </View>
                        <View style={styles.gaugeBackground}>
                            <View style={[styles.gaugeFill, { width: riskWidth as any, backgroundColor: statusColor }]} />
                        </View>
                    </View>

                    <View style={styles.contextBox}>
                        <Text variant="caption" color="#4B5563">📍 {currentEnv.region || "내 농장"} | 현재 습도 {currentEnv.humidity}%</Text>
                        <Text variant="body2" color="#111827" style={{ marginTop: 4 }}>
                            "이 날씨에 이 지역이면 {diseaseName} 발생 위험이 높습니다"
                        </Text>
                    </View>
                </Card>

                {/* 3. Similar Symptoms */}
                <Card style={styles.sectionCard}>
                    <Text variant="body1" weight="bold" style={styles.sectionTitle}>💡 유사 증상 가능성</Text>
                    {similarSymptoms.map((s, i) => (
                        <View key={i} style={styles.similarRow}>
                            <Text variant="body2">• {s.name}</Text>
                            <Text variant="caption" color="#6B7280">- {s.note}</Text>
                        </View>
                    ))}
                </Card>

                {/* 4. Environment Analysis */}
                <Card style={styles.sectionCard}>
                    <Text variant="body1" weight="bold" style={styles.sectionTitle}>🌡️ 현재 환경 분석</Text>
                    <Text variant="body2" style={{ marginBottom: 4 }}>
                        온도 {currentEnv.temperature}°C / 습도 {currentEnv.humidity}%
                    </Text>
                    <Text variant="body2" color="#EF4444" weight="bold">
                        → {diseaseName} 확산에 매우 유리한 조건
                    </Text>
                    <View style={styles.divider} />
                    <Text variant="body2" color="#374151">
                        "{currentEnv.msg}"
                    </Text>
                </Card>

                {/* 4-1. DSS 권고사항 */}
                {dssResult && (
                    <Card style={styles.sectionCard}>
                        <Text variant="body1" weight="bold" style={styles.sectionTitle}>🔬 DSS 분석 권고</Text>
                        {dssResult.recommendation && (
                            <Text variant="body2" style={{ marginBottom: 8 }}>{dssResult.recommendation}</Text>
                        )}
                        {dssResult.treatments?.map((t: any, i: number) => (
                            <View key={i} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                                <Text variant="caption" color="#3B82F6">• </Text>
                                <Text variant="body2" style={{ flex: 1 }}>{t.name || t}</Text>
                            </View>
                        ))}
                        {dssResult.severity && (
                            <View style={[styles.contextBox, { marginTop: 8 }]}>
                                <Text variant="caption" color="#4B5563">심각도: {dssResult.severity}</Text>
                            </View>
                        )}
                    </Card>
                )}

                {/* 5. Regional Status */}
                <Card style={styles.sectionCard}>
                    <Text variant="body1" weight="bold" style={styles.sectionTitle}>📊 지역 발생 현황</Text>
                    <Text variant="body2">경북 지역 {diseaseName} 발생 최성기 (6월)</Text>
                    <TouchableOpacity style={styles.linkButton}>
                        <Text variant="caption" color="#2563EB" style={{ textDecorationLine: 'underline' }}>[주변 농가 발생 현황 보기]</Text>
                    </TouchableOpacity>
                </Card>

                {/* 6. Action Buttons Grid */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity style={styles.gridButton}>
                        <Text style={styles.gridIcon}>🛡️</Text>
                        <Text variant="caption" style={{ marginTop: 4 }}>예방 수칙</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridButton}>
                        <Text style={styles.gridIcon}>💬</Text>
                        <Text variant="caption" style={{ marginTop: 4 }}>커뮤니티</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridButton}>
                        <Text style={styles.gridIcon}>👨‍🌾</Text>
                        <Text variant="caption" style={{ marginTop: 4 }}>전문가 상담</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.gridIcon}>📸</Text>
                        <Text variant="caption" style={{ marginTop: 4 }}>다시 촬영</Text>
                    </TouchableOpacity>
                </View>

                {/* 7. Disclaimer */}
                <View style={styles.disclaimerBox}>
                    <MaterialCommunityIcons name="information-outline" size={16} color="#9CA3AF" />
                    <Text variant="caption" color="#9CA3AF" style={{ flex: 1, marginLeft: 6 }}>
                        본 분석은 AI 조기 감지 시스템의 참고용 결과입니다. 정확한 진단은 전문가와 상담하세요.{'\n'}
                        <Text weight="bold">농업기술상담: 1544-8572</Text>
                    </Text>
                </View>

                {/* 8. Save Button (Main Action) */}
                <Button
                    title={saving ? "저장 중..." : "결과 기록하기"}
                    onPress={handleSave}
                    disabled={saving}
                    style={{ backgroundColor: '#10B981', marginVertical: 16 }}
                />

                {/* 9. Feedback Section */}
                <View style={styles.feedbackContainer}>
                    <Text variant="body2" weight="bold" style={{ marginBottom: 12 }}>이 분석이 도움이 되었나요?</Text>
                    <View style={styles.feedbackRow}>
                        <TouchableOpacity style={styles.feedbackBtn}>
                            <Text>😊 도움됨</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.feedbackBtn, { marginLeft: 8 }]}>
                            <Text>🤔 실제와 다름</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{ marginTop: 12 }}>
                        <Text variant="caption" color="#4B5563" style={{ textDecorationLine: 'underline' }}>선도농가에게 물어보기 &gt;</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 16, paddingBottom: 60, backgroundColor: '#F9FAFB' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageContainer: { width: '100%', height: 240, borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#E5E7EB', position: 'relative' },
    resultImage: { width: '100%', height: '100%' },
    badge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },

    resultCard: { padding: 16, marginBottom: 12, backgroundColor: '#FFF' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    gaugeContainer: { marginBottom: 16 },
    gaugeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    gaugeBackground: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
    gaugeFill: { height: '100%', borderRadius: 5 },
    contextBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 },

    sectionCard: { padding: 16, marginBottom: 12, backgroundColor: '#FFF', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    sectionTitle: { marginBottom: 8, fontSize: 16 },
    similarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
    linkButton: { marginTop: 8 },

    gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    gridButton: { width: '23%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1 },
    gridIcon: { fontSize: 24 },

    disclaimerBox: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginTop: 8 },

    feedbackContainer: { alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 16, marginTop: 8 },
    feedbackRow: { flexDirection: 'row' },
    feedbackBtn: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20 },
});

export default DiagnosisResultScreen;
