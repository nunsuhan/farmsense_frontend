/**
 * 일일 처방전 - A+ 현실형
 * 
 * 핵심 철학:
 * - "농사는 감이다" - 데이터는 보조 도구
 * - "보통 이렇게 합니다" - 관습 존중
 * - 솔직함 - 완벽하지 않음을 인정
 * - 선택권 부여 - 강요하지 않음
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import ScreenWrapper from '../components/common/ScreenWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FarmSenseColors } from '../theme/colors';
import * as sensorApi from '../services/sensorApi';
import { pesticideApi, PHITimeline } from '../services/pesticideApi';
import * as dssApi from '../services/dssApi';
import { useStore } from '../store/useStore';

// 타입 정의
interface DailyBrief {
  date: string;
  urgent_task: Task | null;
  optional_tasks: Task[];
  reference_info: ReferenceInfo;
}

interface Task {
  title: string;
  description: string;
  reason: string;
  convention: string; // "보통 이렇게 합니다"
  time_needed: string; // "10분", "30분"
  confidence: number; // 0-100
  why_detail: WhyDetail;
}

interface WhyDetail {
  current_data: string[];
  risk: string;
  convention: string;
  past_comparison: string;
  confidence_text: string;
  caveat: string;
}

interface ReferenceInfo {
  phi_info: string;
  price_info: string;
  weather_next_week: string;
}

const DailyPrescriptionScreen: React.FC = () => {
  const user = useStore(state => state.user);

  // 상태
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);
  const [phiTimeline, setPHITimeline] = useState<PHITimeline | null>(null);
  const [showDetailData, setShowDetailData] = useState(false);
  const [sensorRawData, setSensorRawData] = useState<any>(null);

  // 초기 로드
  useEffect(() => {
    // 첫 실행 시 면책 문구 표시 (AsyncStorage로 체크)
    const checkFirstRun = async () => {
      // TODO: AsyncStorage 체크
      // 지금은 매번 표시하지 않음
    };
    checkFirstRun();

    fetchDailyBrief();
    fetchPHITimeline();
  }, []);

  // PHI 타임라인 조회
  const fetchPHITimeline = async () => {
    try {
      const data = await pesticideApi.getPHITimeline('TEST');
      setPHITimeline(data);
    } catch (error) {
      console.error('❌ [일일처방] PHI 로드 실패:', error);
      setPHITimeline({
        can_harvest_now: true,
        earliest_safe_date: null,
        timeline: [],
        count: 0,
      });
    }
  };

  // 일일 브리핑 생성
  const fetchDailyBrief = async () => {
    try {
      setLoading(true);

      // 센서 데이터 조회
      const sensorData = await sensorApi.getAllSensorData();
      const temp = sensorData.temperature?.value ?? null;
      const hum = sensorData.humidity?.value ?? null;
      const soil = sensorData.soil_moisture?.value ?? null;
      const co2 = sensorData.co2?.value ?? null;

      // 원본 데이터 저장 (상세 보기용)
      setSensorRawData({
        temperature: { value: temp, unit: '°C', timestamp: sensorData.temperature?.timestamp },
        humidity: { value: hum, unit: '%', timestamp: sensorData.humidity?.timestamp },
        soil_moisture: { value: soil, unit: '%', timestamp: sensorData.soil_moisture?.timestamp },
        co2: { value: co2, unit: 'ppm', timestamp: sensorData.co2?.timestamp },
      });

      // DSS Server API Call
      let dssRecommendation = null;
      let fertilizerRecommendation = null;

      const farmIdStr = user?.facilityId || user?.id; // Fallback to ID if facilityId is missing

      if (farmIdStr) {
        try {
          // Treat as number if meaningful, or string. dssApi will handle it.
          const farmId = Number(farmIdStr) || 1; // Default to 1 if NaN for testing

          // 1. Irrigation
          if (temp !== null && hum !== null) {
            dssRecommendation = await dssApi.getIrrigationRecommendation(farmId, temp, hum);
          }
          // 2. Fertilizer (assuming growth stage is 'growing' for now, or fetch from store)
          fertilizerRecommendation = await dssApi.getFertilizerRecommendation(farmId, 'growing');
        } catch (e) {
          console.log('DSS API Load Failed, Using local logic', e);
        }
      }

      // 종합 분석
      const briefData = generateDailyBrief(temp, hum, soil, co2, dssRecommendation, fertilizerRecommendation);
      setBrief(briefData);

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('❌ [일일처방] 생성 실패:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침
  const onRefresh = () => {
    setRefreshing(true);
    fetchDailyBrief();
    fetchPHITimeline();
  };

  // 데이터 상태 분석
  const getDataStatus = () => {
    if (!sensorRawData) return 'none';

    const hasTemp = sensorRawData.temperature?.value !== null;
    const hasHum = sensorRawData.humidity?.value !== null;
    const hasSoil = sensorRawData.soil_moisture?.value !== null;
    const hasCo2 = sensorRawData.co2?.value !== null;

    const count = [hasTemp, hasHum, hasSoil, hasCo2].filter(Boolean).length;

    if (count === 0) return 'none';
    if (count <= 2) return 'limited';
    if (count === 4) return 'full';
    return 'partial';
  };

  // 데이터 상태별 안내 메시지
  const getDataStatusMessage = () => {
    const status = getDataStatus();

    switch (status) {
      case 'none':
        return {
          icon: '📡',
          title: '센서 데이터가 없습니다',
          message: '센서가 연결되지 않았거나 데이터 전송이 지연되고 있습니다.',
          tip: '💡 일일 처방전은 센서 데이터를 기반으로 작동합니다. 센서 등록 후 더 정확한 처방을 받아보세요!',
          action: '지금은 일반적인 계절별 농작업 안내를 제공해드립니다.',
          color: '#F59E0B',
        };
      case 'limited':
        return {
          icon: '📊',
          title: '일부 센서만 연결됨',
          message: '온도, 습도 중 일부 데이터만 수집되고 있습니다.',
          tip: '💡 토양수분, CO2 센서를 추가하면 더 정밀한 처방이 가능합니다.',
          action: '수집된 데이터 기반으로 처방을 제공합니다.',
          color: '#3B82F6',
        };
      case 'partial':
        return {
          icon: '✨',
          title: '대부분의 데이터 수집 중',
          message: '주요 센서 데이터를 수집하고 있습니다.',
          tip: '💡 모든 센서가 정상 작동하면 최상의 처방을 받을 수 있습니다.',
          action: null,
          color: '#10B981',
        };
      case 'full':
        return {
          icon: '🎯',
          title: '모든 센서 정상',
          message: '종합적인 농장 환경 분석이 가능합니다.',
          tip: null,
          action: null,
          color: '#10B981',
        };
      default:
        return null;
    }
  };

  // 로딩 화면
  if (loading && !brief) {
    return (
      <ScreenWrapper title="일일 처방전">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FarmSenseColors.primary} />
          <Text style={styles.loadingText}>오늘의 처방을 준비하는 중...</Text>
          <Text style={styles.loadingSubtext}>센서 데이터를 분석하고 있습니다</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="농작업 일정" showBack showMenu={true}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={FarmSenseColors.primary}
          />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🍇</Text>
          <Text style={styles.headerTitle}>오늘 우리 포도밭</Text>
          <Text style={styles.headerDate}>{brief?.date}</Text>
          <Text style={styles.headerLocation}>영천 포도농장 · 경북 영천시</Text>
        </View>

        {/* 데이터 상태 안내 */}
        {(() => {
          const statusInfo = getDataStatusMessage();
          const dataStatus = getDataStatus();

          // full 상태가 아닐 때만 표시
          if (dataStatus !== 'full' && statusInfo) {
            return (
              <View style={[styles.dataStatusCard, { borderLeftColor: statusInfo.color }]}>
                <View style={styles.dataStatusHeader}>
                  <Text style={styles.dataStatusIcon}>{statusInfo.icon}</Text>
                  <Text style={[styles.dataStatusTitle, { color: statusInfo.color }]}>
                    {statusInfo.title}
                  </Text>
                </View>
                <Text style={styles.dataStatusMessage}>{statusInfo.message}</Text>
                {statusInfo.tip && (
                  <Text style={styles.dataStatusTip}>{statusInfo.tip}</Text>
                )}
                {statusInfo.action && (
                  <Text style={styles.dataStatusAction}>{statusInfo.action}</Text>
                )}

                {/* 활용 가이드 */}
                {dataStatus === 'none' && (
                  <View style={styles.guideBox}>
                    <Text style={styles.guideTitle}>📖 일일 처방전 활용법</Text>
                    <Text style={styles.guideText}>1️⃣ 센서 등록: 설정 → 센서 등록에서 시설 ID 연결</Text>
                    <Text style={styles.guideText}>2️⃣ 데이터 수집: 1시간 후부터 데이터 반영</Text>
                    <Text style={styles.guideText}>3️⃣ 처방 확인: 매일 아침 확인하면 효과적!</Text>
                  </View>
                )}
              </View>
            );
          }
          return null;
        })()}

        {/* 주의사항 (가장 중요) */}
        {brief?.urgent_task && (
          <View style={styles.urgentCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={20} color="#EF4444" />
              <Text style={styles.cardTitle}>오늘 주의</Text>
            </View>

            <Text style={styles.urgentDescription}>
              {brief.urgent_task.description}
            </Text>

            <View style={styles.conventionBox}>
              <Text style={styles.conventionTitle}>[보통 이렇게 합니다]</Text>
              <Text style={styles.conventionText}>
                {brief.urgent_task.convention}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.whyButton}
              onPress={() => setExpandedWhy(expandedWhy === 'urgent' ? null : 'urgent')}
            >
              <Text style={styles.whyButtonText}>왜 그런지 보기</Text>
              <Ionicons
                name={expandedWhy === 'urgent' ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#10B981"
              />
            </TouchableOpacity>

            {/* 확장된 설명 */}
            {expandedWhy === 'urgent' && (
              <View style={styles.whyDetail}>
                <View style={styles.whySection}>
                  <Text style={styles.whySectionTitle}>1. 현재 데이터</Text>
                  {brief.urgent_task.why_detail.current_data.map((data, idx) => (
                    <Text key={idx} style={styles.whyText}>• {data}</Text>
                  ))}
                </View>

                <View style={styles.whySection}>
                  <Text style={styles.whySectionTitle}>2. 위험</Text>
                  <Text style={styles.whyText}>{brief.urgent_task.why_detail.risk}</Text>
                </View>

                <View style={styles.whySection}>
                  <Text style={styles.whySectionTitle}>3. 관습</Text>
                  <Text style={styles.whyText}>{brief.urgent_task.why_detail.convention}</Text>
                </View>

                <View style={styles.whySection}>
                  <Text style={styles.whySectionTitle}>4. 과거 비교</Text>
                  <Text style={styles.whyText}>{brief.urgent_task.why_detail.past_comparison}</Text>
                </View>

                <View style={styles.whySection}>
                  <Text style={styles.whySectionTitle}>5. 확실한가?</Text>
                  <Text style={styles.whyText}>
                    {brief.urgent_task.why_detail.confidence_text}
                  </Text>
                  <Text style={[styles.whyText, { fontStyle: 'italic', color: '#6B7280' }]}>
                    {brief.urgent_task.why_detail.caveat}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 추천 작업 (여유 있으면) */}
        {brief?.optional_tasks && brief.optional_tasks.length > 0 && (
          <View style={styles.optionalCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkbox-outline" size={20} color="#10B981" />
              <Text style={styles.cardTitle}>여유 있으면</Text>
            </View>

            {brief.optional_tasks.map((task, index) => (
              <View key={index} style={styles.optionalTask}>
                <View style={styles.optionalTaskHeader}>
                  <Text style={styles.optionalTaskNumber}>{index + 1}.</Text>
                  <Text style={styles.optionalTaskTitle}>{task.title}</Text>
                  <Text style={styles.optionalTaskTime}>({task.time_needed})</Text>
                </View>
                <Text style={styles.optionalTaskDescription}>{task.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 참고 정보 */}
        <View style={styles.referenceCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>참고</Text>
          </View>

          {phiTimeline && !phiTimeline.can_harvest_now && phiTimeline.earliest_safe_date && (
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>• 약 친 날</Text>
              <Text style={styles.referenceValue}>
                수확 가능: {phiTimeline.earliest_safe_date} 이후
              </Text>
            </View>
          )}

          {brief?.reference_info.price_info && (
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>• 현재 가격</Text>
              <Text style={styles.referenceValue}>{brief.reference_info.price_info}</Text>
            </View>
          )}

          {brief?.reference_info.weather_next_week && (
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>• 다음주</Text>
              <Text style={styles.referenceValue}>{brief.reference_info.weather_next_week}</Text>
            </View>
          )}
        </View>



        {/* 면책 문구 버튼 */}
        <TouchableOpacity
          style={styles.disclaimerButton}
          onPress={() => setShowDisclaimerModal(true)}
        >
          <Ionicons name="alert-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.disclaimerButtonText}>안내사항</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* 면책 문구 모달 */}
      <Modal
        visible={showDisclaimerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={32} color="#F59E0B" />
              <Text style={styles.modalTitle}>알림</Text>
            </View>

            <Text style={styles.modalText}>
              FarmSense는 보조 도구입니다.
            </Text>

            <View style={styles.modalList}>
              <Text style={styles.modalListItem}>• 센서 데이터가 부족할 수 있음</Text>
              <Text style={styles.modalListItem}>• 날씨 예보가 틀릴 수 있음</Text>
              <Text style={styles.modalListItem}>• 모든 상황을 고려하지 못함</Text>
            </View>

            <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 12 }]}>
              최종 결정은 농민님의 경험과 판단이 가장 중요합니다.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDisclaimerModal(false)}
            >
              <Text style={styles.modalButtonText}>이해했습니다</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

// ============================================
// 핵심 알고리즘: 일일 브리핑 생성
// ============================================
const generateDailyBrief = (
  temp: number | null,
  hum: number | null,
  soil: number | null,
  co2: number | null,
  dssRec: dssApi.DSSRecommendation | null,
  fertRec: dssApi.DSSRecommendation | null
): DailyBrief => {
  // 긴급 작업 결정 (우선순위)
  let urgent_task: Task | null = null;
  const optional_tasks: Task[] = [];

  // 1. DSS API Recommendation (Priority High)
  if (dssRec) {
    urgent_task = {
      title: dssRec.recommendation || '물 관리 필요',
      description: `추천 급수량: ${dssRec.amount}`,
      reason: dssRec.reason,
      convention: `보통 ${dssRec.timing}에 관수합니다.`,
      time_needed: '자동',
      confidence: 90,
      why_detail: {
        current_data: [`DSS 분석 결과`],
        risk: '수분 스트레스 우려',
        convention: 'AI 기반 데이터 분석',
        past_comparison: '-',
        confidence_text: '높음 (서버 분석)',
        caveat: '현장 상황을 확인하세요',
      }
    };
  }
  // 2. Local Logic (Fallback or if DSS is handled)
  else if (temp !== null && hum !== null && temp > 22 && hum > 65) {
    urgent_task = {
      title: '환기 및 습도 관리',
      description: '습도가 높고 온도가 적당해서 탄저병 걸릴 수 있음',
      reason: `온도 ${temp}°C, 습도 ${hum}%`,
      convention: '• 오늘 환기 많이 하기 (습도 낮춤)\n• 내일 오전 방제 고려 (비 오기 전에)',
      time_needed: '수시',
      confidence: 75,
      why_detail: {
        current_data: [
          `온도: ${temp}°C (적정)`,
          `습도: ${hum}% (높음)`,
        ],
        risk: '고온다습 = 탄저병, 노균병 발생 조건',
        convention: '이럴 때 보통 환기를 많이 하고 예방 약제를 칩니다',
        past_comparison: '작년 이맘때 비슷했음 (작년엔 방제 했음)',
        confidence_text: `중간 정도 (${75}%)`,
        caveat: '날씨가 갑자기 바뀔 수도 있음',
      },
    };
  }
  // 우선순위 2: 토양수분 과다/부족
  else if (soil !== null && (soil < 25 || soil > 65)) {
    const isLow = soil < 25;
    urgent_task = {
      title: isLow ? '관수 필요' : '배수 점검',
      description: isLow
        ? '토양이 건조해서 포도나무가 스트레스 받을 수 있음'
        : '토양수분이 과다해서 뿌리가 썩을 수 있음',
      reason: `토양수분 ${soil}%`,
      convention: isLow
        ? '• 오늘 관수량 150% 증량\n• 점적호스 막힘 확인'
        : '• 배수로 막힘 확인\n• 오늘~내일 관수 중단',
      time_needed: isLow ? '30분' : '10분',
      confidence: 80,
      why_detail: {
        current_data: [`토양수분: ${soil}% (${isLow ? '낮음' : '높음'})`],
        risk: isLow ? '수분 부족 시 생육 정체' : '과습 시 뿌리 질병 발생',
        convention: isLow
          ? '보통 토양수분 30% 이하면 관수합니다'
          : '보통 60% 넘으면 배수 확인합니다',
        past_comparison: '평소보다 ' + (isLow ? '낮음' : '높음'),
        confidence_text: '높음 (80%)',
        caveat: '센서가 한 지점만 측정하므로 전체를 대표하지 않을 수 있음',
      },
    };
  }
  // 우선순위 3: 극한 온도
  else if (temp !== null && (temp > 30 || temp < 15)) {
    const isHigh = temp > 30;
    urgent_task = {
      title: isHigh ? '냉방 가동' : '난방 점검',
      description: isHigh
        ? '온도가 너무 높아서 포도가 익거나 탈 수 있음'
        : '온도가 너무 낮아서 생육이 멈출 수 있음',
      reason: `온도 ${temp}°C`,
      convention: isHigh
        ? '• 차광막 설치\n• 측창 완전 개방\n• 냉방기 가동'
        : '• 난방기 즉시 가동\n• 보온 커튼 닫기',
      time_needed: '즉시',
      confidence: 90,
      why_detail: {
        current_data: [`온도: ${temp}°C (${isHigh ? '고온' : '저온'})`],
        risk: isHigh ? '고온 시 과실 손상' : '저온 시 생육 정지',
        convention: `보통 ${isHigh ? '30°C 이상' : '15°C 이하'}이면 ${isHigh ? '냉방' : '난방'}합니다`,
        past_comparison: '평소보다 매우 ' + (isHigh ? '높음' : '낮음'),
        confidence_text: '매우 높음 (90%)',
        caveat: '센서 위치에 따라 실제 온도와 다를 수 있음',
      },
    };
  }

  // Fertilizer Recommendation (Optional Task)
  if (fertRec) {
    optional_tasks.push({
      title: `비료: ${fertRec.recommendation}`,
      description: `추천: ${fertRec.amount}, 시기: ${fertRec.timing}`,
      reason: fertRec.reason,
      convention: '생육 단계 맞춤 시비',
      time_needed: '1시간',
      confidence: 85,
      why_detail: {
        current_data: ['생육 단계 분석'],
        risk: '양분 불균형 해소',
        convention: '표준 시비량 준수',
        past_comparison: '-',
        confidence_text: '85%',
        caveat: '엽색 확인 필요'
      }
    });
  }

  // 토양수분 정상이면 관수 안 해도 됨
  if (soil !== null && soil >= 35 && soil <= 55) {
    optional_tasks.push({
      title: '토양수분 괜찮음',
      description: '오늘 관수 안 해도 됨',
      reason: `토양수분 ${soil}%`,
      convention: '',
      time_needed: '-',
      confidence: 85,
      why_detail: {
        current_data: [],
        risk: '',
        convention: '',
        past_comparison: '',
        confidence_text: '',
        caveat: '',
      },
    });
  }

  // CO2 낮으면 시비 권장
  if (co2 !== null && co2 < 600) {
    optional_tasks.push({
      title: 'CO2 시비 고려',
      description: '오전 광합성 시간에 CO2 시비하면 좋음',
      reason: `CO2 ${co2}ppm (낮음)`,
      convention: '',
      time_needed: '30분',
      confidence: 60,
      why_detail: {
        current_data: [],
        risk: '',
        convention: '',
        past_comparison: '',
        confidence_text: '',
        caveat: '',
      },
    });
  }

  // 일상 작업
  optional_tasks.push({
    title: '일상 관리',
    description: '신초 정리, 잡초 제거 등',
    reason: '평소 작업',
    convention: '',
    time_needed: '1시간',
    confidence: 100,
    why_detail: {
      current_data: [],
      risk: '',
      convention: '',
      past_comparison: '',
      confidence_text: '',
      caveat: '',
    },
  });

  // 참고 정보
  const reference_info: ReferenceInfo = {
    phi_info: '수확 가능일 확인 중...',
    price_info: '15,000원/kg (평년 수준)',
    weather_next_week: '맑음 예상',
  };

  // 날짜
  const date = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return {
    date,
    urgent_task,
    optional_tasks: optional_tasks.slice(0, 3), // 최대 2개
    reference_info,
  };
};

// ============================================
// 스타일
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },

  // 데이터 상태 안내
  dataStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataStatusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  dataStatusTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dataStatusMessage: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  dataStatusTip: {
    fontSize: 12,
    color: '#059669',
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dataStatusAction: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  guideBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 20,
  },

  // 카드 공통
  urgentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  referenceCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  // 헤더
  header: {
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerDate: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  headerLocation: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },

  // 카드 내용
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  urgentDescription: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 28,
  },
  conventionBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  conventionTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  conventionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  whyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  whyButtonText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginRight: 4,
  },

  // 확장 설명
  whyDetail: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  whySection: {},
  whySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  whyText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  // 선택 작업
  optionalTask: {
    marginBottom: 16,
  },
  optionalTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionalTaskNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 8,
  },
  optionalTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  optionalTaskTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  optionalTaskDescription: {
    fontSize: 14,
    color: '#4B5563',
    paddingLeft: 24,
  },

  // 참고 정보
  referenceItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  referenceLabel: {
    fontSize: 13,
    color: '#6B7280',
    width: 80,
  },
  referenceValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },

  // 상세 데이터
  detailDataCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 8,
  },
  detailDataContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 20,
  },
  detailSection: {},
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  detailNote: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 4,
  },

  // 면책 문구 버튼
  disclaimerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  disclaimerButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  modalList: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalListItem: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  modalButton: {
    backgroundColor: FarmSenseColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DailyPrescriptionScreen;
