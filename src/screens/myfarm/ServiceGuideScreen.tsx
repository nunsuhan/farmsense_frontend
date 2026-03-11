/**
 * 센서 서비스 가이드 화면
 * FarmSenseServiceGuide.jsx → React Native 변환
 * 탭 1: 시기별 서비스 | 탭 2: 센서 구성·가격
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceGuide'>;

const SEASONS = [
  {
    id: 'winter', months: '11~2월', title: '휴면기·전정', icon: '❄️', color: '#90caf9',
    problem: '한파에 나무가 얼어죽을 수 있음. 겨울에도 토양이 마르면 봄 발아가 늦어짐',
    withoutFarmsense: '새벽에 직접 나가서 온도 확인. 감으로 물 줄지 말지 판단',
    alerts: [
      { sensor: '🌡️', text: '서리·한파 경보 — 영하 2℃ 이하면 즉시 푸시 알림', basic: true },
      { sensor: '💧', text: '겨울 관수 필요 여부 — 토양이 너무 마르면 알려줌', basic: true },
      { sensor: '📱', text: '전정 시기·강도 AI 추천', basic: true },
      { sensor: '📱', text: '석회유황합제 처리 적기 안내', basic: true },
    ],
  },
  {
    id: 'sprout', months: '3~4월', title: '발아·전엽기', icon: '🌱', color: '#a5d6a7',
    problem: '늦서리에 새순이 죽음. 발아가 불균일하면 수확량 떨어짐. 비가림 안 30℃ 넘으면 잎이 탐',
    withoutFarmsense: '일기예보만 보고 불안하게 기다림. 하우스 안 온도를 모르니 매번 가봐야 함',
    alerts: [
      { sensor: '🌡️', text: '냉해 경보 — 발아 후 6℃ 이하 3시간 노출 시 긴급 알림', basic: true },
      { sensor: '🌡️', text: '환기 타이밍 — "지금 옆면 열어주세요" (30℃ 넘기 전에)', basic: true },
      { sensor: '💧', text: '발아기 관수 — 균일 발아 유도, 과습 주의', basic: true },
      { sensor: '📱', text: 'GDD 적산온도 → 발아일·개화 예상일 자동 계산', basic: true },
      { sensor: '📱', text: '눈솎기·신초유인 작업 시기 알림', basic: true },
    ],
  },
  {
    id: 'bloom', months: '5~6월 초', title: '개화·착과기', icon: '🌸', color: '#f48fb1',
    problem: '꽃떨이(낙화)로 착과 실패. 노균병·회색곰팡이 첫 발생 시기. 수세가 너무 강하면 꽃이 떨어짐',
    withoutFarmsense: '비 온 다음날 약 쳐야 하나 말아야 하나 고민. 수세 판단은 경험에 의존',
    alerts: [
      { sensor: '🌡️', text: '꽃떨이 방지 — 고온·저습 조건 감지 시 알림', basic: true },
      { sensor: '🌡️', text: '노균병·회색곰팡이 경보 — 습도 85% 지속 시 "방제 시기입니다"', basic: true },
      { sensor: '💧', text: '지베렐린 처리 전 토양수분 가이드', basic: true },
      { sensor: '💧', text: '과관수 방지 — 수세 강할 때 "물 줄이세요"', basic: true },
      { sensor: '📱', text: '알솎기·봉지씌우기 시기 알림', basic: true },
      { sensor: '📱', text: '충해 예측 — 깍지벌레·응애 약충기 방제 적기', basic: true },
      { sensor: '💨', text: 'CO₂ 부족 경고 — 350ppm 이하면 광합성 저하', basic: false },
    ],
  },
  {
    id: 'summer', months: '6~7월', title: '비대기·장마', icon: '⛈️', color: '#ffb74d',
    problem: '6월 고온 지속 → 일소·열과. 장마 50일 비 → 노균병·탄저병 폭발. 비 그치는 틈에 뭘 해야 하는지 모름',
    withoutFarmsense: '비 오는 날 하우스에 못 가고 걱정만. 약 칠 타이밍을 놓침. 비 그쳐도 뭘 먼저 해야 할지 모름',
    alerts: [
      { sensor: '🌡️', text: '고온 스트레스 경보 — 35℃ 이상 "차광·환기 필요"', basic: true },
      { sensor: '🌡️', text: '장마철 병해 집중 경보 — 탄저병·노균병 위험도 매일 계산', basic: true },
      { sensor: '🌡️', text: '비 그친 틈새 환기 — "오후 2~4시 비 멈춤, 지금 열어주세요"', basic: true },
      { sensor: '💧', text: '장마 중 과습 경보 — "배수 상태 확인하세요"', basic: true },
      { sensor: '💧', text: '장마 후 관수 재개 타이밍 — "오늘부터 다시 물 주세요"', basic: true },
      { sensor: '📱', text: '사진 찍으면 병 이름 + 약 + 희석배수 즉시 추천', basic: true },
      { sensor: '☀️', text: '광량 부족 경고 — 차광 해제 추천', basic: false },
    ],
  },
  {
    id: 'harvest', months: '8~9월', title: '착색·수확기', icon: '🍇', color: '#ce93d8',
    problem: '열과(과실 터짐) — 건습차가 크면 발생. 당도가 안 올라감. 수확 시기를 놓치면 품질 하락',
    withoutFarmsense: '당도계 들고 매일 측정. 물을 끊어야 하는데 언제까지 끊을지 감으로 판단. 비 오면 열과 걱정',
    alerts: [
      { sensor: '🌡️', text: '일교차 모니터링 — 착색·당도 향상에 필요한 주야간 온도차 추적', basic: true },
      { sensor: '💧', text: '열과 방지 — "3일 간격 소량 관수"로 건습차 줄이기', basic: true },
      { sensor: '💧', text: '당도 올리기 — 수확 2주 전 "지금 관수 멈추세요"', basic: true },
      { sensor: '📱', text: '수확 적기 예측 — 온도·습도 패턴 기반 예상 수확일', basic: true },
      { sensor: '📱', text: '후기 탄저·갈색무늬병 경보', basic: true },
      { sensor: '🧂', text: 'EC 감시 — 비료 과다로 인한 당도 저하 방지', basic: false },
    ],
  },
  {
    id: 'after', months: '10~11월', title: '수확 후·낙엽', icon: '🍂', color: '#bcaaa4',
    problem: '저온 요구도를 못 채우면 내년 발아가 불균일. 밑거름 후 관수를 잘못하면 비료 유실',
    withoutFarmsense: '내년을 위한 데이터가 없음. 올해 뭘 잘했고 뭘 못했는지 기억에 의존',
    alerts: [
      { sensor: '🌡️', text: '저온 요구도 추적 — 7.2℃ 이하 누적시간 자동 계산', basic: true },
      { sensor: '💧', text: '밑거름 후 관수 가이드 — 퇴비 후 적정 수분 유지', basic: true },
      { sensor: '📱', text: '연간 데이터 리포트 — 올해 병해일수, 관수총량, 수확 비교', basic: true },
      { sensor: '📱', text: '내년 재배 계획 AI 추천', basic: true },
      { sensor: '📱', text: '월동 병해충 방제 시기 알림', basic: true },
    ],
  },
];

const SENSOR_PACKAGES = [
  {
    id: 'basic', name: '기본 세트', tag: '이것만 있어도 90% 커버',
    sensors: ['🌡️ 대기 온·습도 센서', '💧 토양수분 센서 × 2'],
    services: '환기 알림, 관수 추천, 병해 경보, 서리·한파 경보, 사진 AI 진단, 포도 AI 상담',
    price: { base: '33만원', perDong: '18.5만원', monthly: '1만원' },
    example3: '88.5만원 + 월 1만원',
  },
  {
    id: 'standard', name: '표준 세트', tag: '병해 예측 정밀도 UP',
    sensors: ['🌡️ 대기 온·습도 센서', '💧 토양수분 센서 × 2', '☀️ 일사량 센서'],
    services: '기본 전부 + 광합성 진단, 차광 타이밍, 관수 정확도 30% 향상, VPD 계산',
    price: { base: '33만원', perDong: '28.5만원', monthly: '1만원' },
    example3: '118.5만원 + 월 1만원',
  },
  {
    id: 'premium', name: '프리미엄 세트', tag: '수출 농가·기술센터용',
    sensors: ['🌡️ 대기 온·습도 센서', '💧 토양수분 센서 × 2', '☀️ 일사량 센서', '🧂 토양 EC 센서', '🌤️ 바깥 기상스테이션'],
    services: '표준 전부 + 비료 관리, 풍속·강우 예측, ET₀ 증발산 자동계산, 서리 정밀 예보',
    price: { base: '33만원', perDong: '51.5만원', monthly: '1만원' },
    example3: '187.5만원 + 월 1만원',
  },
];

const ADDON_SENSORS = [
  { icon: '☀️', name: '일사량 센서', what: '해 밝기 → 광합성·차광 판단', price: '10만원' },
  { icon: '💨', name: 'CO₂+온습도 센서', what: '하우스 환기 타이밍 정밀화', price: '22만원' },
  { icon: '🧂', name: '토양수분+온도+EC', what: '비료 과다·소금기 축적 방지', price: '23만원' },
  { icon: '🧪', name: '토양 pH 센서', what: '흙 산도 (포도 적정 5.5~6.5)', price: '46만원' },
  { icon: '🌡️', name: '정밀온도 3채널', what: '과실·토양·대기 동시 측정', price: '13만원' },
  { icon: '🌤️', name: '기상스테이션 8종', what: '풍속·강우·UV까지 한번에', price: '50만원' },
];

const COMMON_SPECS = [
  'LoRa 무선 내장 (전선 없이 게이트웨이에 전송)',
  '방수 IP66 (비·눈·먼지 OK)',
  '배터리 최대 10년 (교체 가능)',
  '블루투스 앱 설정 (1분 셋업)',
  '사용 온도: -40°C ~ 85°C',
];

function getCurrentSeasonId(): string {
  const m = new Date().getMonth() + 1;
  if (m <= 2 || m === 11 || m === 12) return 'winter';
  if (m <= 4) return 'sprout';
  if (m <= 6) return 'bloom';
  if (m <= 7) return 'summer';
  if (m <= 9) return 'harvest';
  return 'after';
}

export default function ServiceGuideScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'season' | 'package'>('season');
  const [activeSeason, setActiveSeason] = useState<string | null>(getCurrentSeasonId());
  const [activePkg, setActivePkg] = useState('basic');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1a0f' }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#c8e6c9" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>센서 서비스 가이드</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Title */}
      <View style={s.titleBar}>
        <Text style={s.titleMain}>🍇 센서 설치하면 뭘 알려주나요?</Text>
        <Text style={s.titleSub}>기본 센서 3개만으로 연중 35가지 이상 알림</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {([['season', '📅 시기별 서비스'], ['package', '💰 센서 구성·가격']] as const).map(([id, label]) => (
          <TouchableOpacity
            key={id}
            style={[s.tabBtn, activeTab === id && s.tabBtnActive]}
            onPress={() => setActiveTab(id)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabLabel, activeTab === id && s.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* ===== 시기별 서비스 ===== */}
        {activeTab === 'season' && (
          <View style={{ gap: 10 }}>
            {/* 시기 선택 버튼 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.seasonBtnRow}>
              {SEASONS.map((season) => (
                <TouchableOpacity
                  key={season.id}
                  style={[s.seasonBtn, activeSeason === season.id && { borderColor: season.color, backgroundColor: 'rgba(255,255,255,0.06)' }]}
                  onPress={() => setActiveSeason(activeSeason === season.id ? null : season.id)}
                  activeOpacity={0.7}
                >
                  <Text style={s.seasonBtnText}>{season.icon} {season.months}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 시기 카드 */}
            {(activeSeason ? SEASONS.filter(s => s.id === activeSeason) : SEASONS).map((season) => (
              <View key={season.id} style={[s.seasonCard, { borderColor: season.color + '40' }]}>
                <View style={s.seasonCardHeader}>
                  <Text style={s.seasonIcon}>{season.icon}</Text>
                  <Text style={[s.seasonTitle, { color: season.color }]}>{season.months} — {season.title}</Text>
                </View>

                {/* 걱정 */}
                <View style={s.problemBox}>
                  <Text style={s.problemLabel}>😰 이 시기의 걱정</Text>
                  <Text style={s.problemText}>{season.problem}</Text>
                </View>

                {/* 센서 없으면 */}
                <View style={s.withoutBox}>
                  <Text style={s.withoutLabel}>🚫 센서 없으면</Text>
                  <Text style={s.withoutText}>{season.withoutFarmsense}</Text>
                </View>

                {/* 알림 목록 */}
                <Text style={s.alertsLabel}>✅ FarmSense가 알려주는 것</Text>
                {season.alerts.map((a, i) => (
                  <View key={i} style={[s.alertRow, i < season.alerts.length - 1 && s.alertRowBorder, !a.basic && { opacity: 0.7 }]}>
                    <Text style={s.alertSensor}>{a.sensor}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.alertText}>{a.text}</Text>
                      {!a.basic && <Text style={s.alertExtra}>(추가 센서)</Text>}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {/* 연중 공통 */}
            <View style={s.yearRoundCard}>
              <Text style={s.yearRoundTitle}>🎯 연중 언제나 받는 서비스</Text>
              {[
                { icon: '📸', text: '사진 한 장으로 병해 이름 + 약 + 희석배수 즉시 추천' },
                { icon: '🤖', text: '포도 전문 AI 상담 — 12만건 데이터 학습, 24시간' },
                { icon: '⚠️', text: '결로 위험도 — "새벽 4~7시 결로 주의" (비가림 특화)' },
                { icon: '📊', text: '월간·연간 리포트 — 센서 데이터 그래프' },
                { icon: '🏕️', text: '비가림 특화 — 강수량은 관수 판단에 반영하지 않음 (비가림 안에 비가 안 들어오므로 토양수분 센서 값만으로 관수 결정)' },
              ].map((item, i) => (
                <View key={i} style={s.yearRoundItem}>
                  <Text style={s.yearRoundIcon}>{item.icon}</Text>
                  <Text style={s.yearRoundText}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* 핵심 메시지 */}
            <LinearGradient colors={['#2e7d32', '#388e3c']} style={s.coreMsg}>
              <Text style={s.coreMsgTitle}>센서 파는 게 아닙니다</Text>
              <Text style={s.coreMsgBody}>
                환기 <Text style={{ color: '#fff', fontWeight: '800' }}>언제</Text> 열지 알려주고{'\n'}
                물 <Text style={{ color: '#fff', fontWeight: '800' }}>언제</Text> 줄지 알려주고{'\n'}
                병 오기 <Text style={{ color: '#fff', fontWeight: '800' }}>전에</Text> 알려주고{'\n'}
                데이터를 <Text style={{ color: '#fff', fontWeight: '800' }}>계속</Text> 기록합니다
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* ===== 센서 구성·가격 ===== */}
        {activeTab === 'package' && (
          <View style={{ gap: 10 }}>
            <Text style={s.pkgIntro}>SenseCAP LoRaWAN 산업용 센서 (IP66 방수, 배터리 최대 10년, 블루투스 1분 셋업)</Text>

            {SENSOR_PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[s.pkgBtn, activePkg === pkg.id && s.pkgBtnActive]}
                onPress={() => setActivePkg(pkg.id)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.pkgBtnName}>{pkg.name}</Text>
                  <Text style={s.pkgBtnTag}>{pkg.tag}</Text>
                </View>
                {activePkg === pkg.id && (
                  <View style={s.pkgCheck}><Text style={{ color: '#fff', fontSize: 14 }}>✓</Text></View>
                )}
              </TouchableOpacity>
            ))}

            {/* 선택된 패키지 상세 */}
            {SENSOR_PACKAGES.filter(p => p.id === activePkg).map((pkg) => (
              <View key={pkg.id} style={s.pkgDetail}>
                <Text style={s.pkgDetailTitle}>📦 {pkg.name} 구성</Text>
                {pkg.sensors.map((sensor, i) => (
                  <Text key={i} style={s.pkgSensor}>{sensor}</Text>
                ))}
                <View style={s.pkgServiceBox}>
                  <Text style={s.pkgServiceLabel}>이 구성으로 받는 서비스:</Text>
                  <Text style={s.pkgServiceText}>{pkg.services}</Text>
                </View>
                <View style={s.pkgPriceSection}>
                  {[
                    ['📡 기본 세트 (게이트웨이+LTE)', pkg.price.base],
                    ['🔋 하우스 1동 추가', pkg.price.perDong],
                    ['📶 월 유지비', pkg.price.monthly],
                  ].map(([label, val], i) => (
                    <View key={i} style={s.pkgPriceLine}>
                      <Text style={s.pkgPriceLabel}>{label}</Text>
                      <Text style={s.pkgPriceVal}>{val}</Text>
                    </View>
                  ))}
                </View>
                <LinearGradient colors={['#2e7d32', '#388e3c']} style={s.example3Box}>
                  <Text style={s.example3Sub}>예) 비가림 3동 설치 시</Text>
                  <Text style={s.example3Price}>{pkg.example3}</Text>
                  <Text style={s.example3Note}>시범 농가 50% 할인 적용 가격</Text>
                </LinearGradient>
              </View>
            ))}

            {/* 추가 센서 */}
            <View style={s.addonCard}>
              <Text style={s.addonTitle}>🛒 나중에 추가할 수 있는 센서</Text>
              {ADDON_SENSORS.map((sensor, i) => (
                <View key={i} style={[s.addonRow, i < ADDON_SENSORS.length - 1 && s.addonRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.addonName}>{sensor.icon} {sensor.name}</Text>
                    <Text style={s.addonWhat}>{sensor.what}</Text>
                  </View>
                  <Text style={s.addonPrice}>{sensor.price}</Text>
                </View>
              ))}
              <Text style={s.addonNote}>* 시범 농가 50% 할인 적용 가격 | 프로브만 꽂으면 바로 연결</Text>
            </View>

            {/* 공통 사양 */}
            <View style={s.specCard}>
              <Text style={s.specTitle}>모든 센서 공통 사양</Text>
              {COMMON_SPECS.map((spec, i) => (
                <Text key={i} style={s.specItem}>· {spec}</Text>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={s.cta}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('TrialApplication')}
        >
          <LinearGradient colors={['#e65100', '#f57c00']} style={s.ctaGradient}>
            <Text style={s.ctaTitle}>📞 시범 농가 신청</Text>
            <Text style={s.ctaSub}>10농가 모집 중 | 센서 50% 할인 + 설치비 무료</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(76,175,80,0.15)' },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#c8e6c9' },
  titleBar: { padding: 16, paddingBottom: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(76,175,80,0.1)' },
  titleMain: { fontSize: 18, fontWeight: '900', color: '#c8e6c9', textAlign: 'center' },
  titleSub: { fontSize: 12, color: '#81c784', marginTop: 4, textAlign: 'center' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(76,175,80,0.15)' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#66bb6a', backgroundColor: 'rgba(76,175,80,0.08)' },
  tabLabel: { fontSize: 13, fontWeight: '700', color: '#81c784' },
  tabLabelActive: { color: '#66bb6a' },
  scroll: { padding: 14 },

  seasonBtnRow: { gap: 6, paddingBottom: 4 },
  seasonBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  seasonBtnText: { fontSize: 12, color: '#a5d6a7', fontWeight: '600' },

  seasonCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16, borderWidth: 1, gap: 10 },
  seasonCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seasonIcon: { fontSize: 28 },
  seasonTitle: { fontSize: 15, fontWeight: '700' },
  problemBox: { backgroundColor: 'rgba(244,67,54,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(244,67,54,0.15)' },
  problemLabel: { fontSize: 11, fontWeight: '700', color: '#ef9a9a', marginBottom: 4 },
  problemText: { fontSize: 12, color: '#ffcdd2', lineHeight: 18 },
  withoutBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  withoutLabel: { fontSize: 11, fontWeight: '700', color: '#9e9e9e', marginBottom: 4 },
  withoutText: { fontSize: 12, color: '#bdbdbd', lineHeight: 18 },
  alertsLabel: { fontSize: 11, fontWeight: '700', color: '#81c784' },
  alertRow: { flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' },
  alertRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  alertSensor: { fontSize: 16 },
  alertText: { fontSize: 12, color: '#e8f0e8', lineHeight: 18 },
  alertExtra: { fontSize: 10, color: '#ffb74d', marginTop: 2 },

  yearRoundCard: { backgroundColor: 'rgba(76,175,80,0.08)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)', gap: 10 },
  yearRoundTitle: { fontSize: 15, fontWeight: '700', color: '#81c784' },
  yearRoundItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  yearRoundIcon: { fontSize: 16 },
  yearRoundText: { flex: 1, fontSize: 13, color: '#c8e6c9', lineHeight: 20 },

  coreMsg: { borderRadius: 18, padding: 20, alignItems: 'center', gap: 10 },
  coreMsgTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  coreMsgBody: { fontSize: 13, color: '#c8e6c9', lineHeight: 26, textAlign: 'center' },

  pkgIntro: { fontSize: 12, color: '#a5d6a7', lineHeight: 18 },
  pkgBtn: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)', flexDirection: 'row', alignItems: 'center' },
  pkgBtnActive: { borderColor: '#66bb6a', backgroundColor: 'rgba(46,125,50,0.15)' },
  pkgBtnName: { fontSize: 15, fontWeight: '700', color: '#e8f0e8' },
  pkgBtnTag: { fontSize: 11, color: '#a5d6a7', marginTop: 2 },
  pkgCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#43a047', alignItems: 'center', justifyContent: 'center' },

  pkgDetail: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(76,175,80,0.15)', gap: 6 },
  pkgDetailTitle: { fontSize: 14, fontWeight: '700', color: '#a5d6a7', marginBottom: 4 },
  pkgSensor: { fontSize: 13, color: '#c8e6c9', paddingLeft: 8 },
  pkgServiceBox: { backgroundColor: 'rgba(76,175,80,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(76,175,80,0.15)', marginTop: 8 },
  pkgServiceLabel: { fontSize: 11, fontWeight: '700', color: '#81c784', marginBottom: 4 },
  pkgServiceText: { fontSize: 12, color: '#c8e6c9', lineHeight: 18 },
  pkgPriceSection: { marginTop: 10, gap: 2 },
  pkgPriceLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  pkgPriceLabel: { fontSize: 13, color: '#e8f0e8' },
  pkgPriceVal: { fontSize: 13, fontWeight: '700', color: '#a5d6a7' },
  example3Box: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  example3Sub: { fontSize: 12, color: '#c8e6c9' },
  example3Price: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 4 },
  example3Note: { fontSize: 11, color: '#a5d6a7', marginTop: 6 },

  addonCard: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 0 },
  addonTitle: { fontSize: 14, fontWeight: '700', color: '#a5d6a7', marginBottom: 12 },
  addonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  addonRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  addonName: { fontSize: 13, fontWeight: '600', color: '#e8f0e8' },
  addonWhat: { fontSize: 11, color: '#81c784', marginTop: 2 },
  addonPrice: { fontSize: 13, fontWeight: '700', color: '#ffb74d' },
  addonNote: { fontSize: 11, color: '#81c784', marginTop: 10 },

  specCard: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', gap: 4 },
  specTitle: { fontSize: 12, fontWeight: '700', color: '#81c784', marginBottom: 4 },
  specItem: { fontSize: 11, color: '#a5d6a7', lineHeight: 20, paddingLeft: 4 },

  cta: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  ctaGradient: { padding: 18, alignItems: 'center', gap: 6 },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ctaSub: { fontSize: 11, color: '#ffe0b2' },
});
