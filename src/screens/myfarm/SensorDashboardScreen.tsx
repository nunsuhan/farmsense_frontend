/**
 * v1.0 SensorDashboardScreen - 센서.jpg 디자인 정밀 재현
 * 나노바나나(Gemini) 생성 센서 아이콘 + 스파크라인 차트
 * 농장 현황 대시보드: 8개 센서 카드 (2x4 그리드)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useStore } from '../../store/useStore';
import { darkColors, colors } from '../../theme/colors';
import { getAllSensorData } from '../../services/sensorApi';

const { width, height } = Dimensions.get('window');
const GRID_PADDING = 14;
const GRID_GAP = 10;
const CARD_W = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

// ── 센서 아이콘 (나노바나나 생성) ──
const SENSOR_ICONS = {
  airTemp: require('../../../assets/sensor-icons/air_temperature.png'),
  humidity: require('../../../assets/sensor-icons/humidity.png'),
  co2: require('../../../assets/sensor-icons/co2_level.png'),
  soilPH: require('../../../assets/sensor-icons/soil_ph.png'),
  soilMoisture: require('../../../assets/sensor-icons/soil_moisture.png'),
  soilTemp: require('../../../assets/sensor-icons/soil_temperature.png'),
  solar: require('../../../assets/sensor-icons/solar_radiation.png'),
  soilHumidity: require('../../../assets/sensor-icons/soil_humidity.png'),
  wind: require('../../../assets/sensor-icons/wind_speed.png'),
};

// ── 센서 정의 ──
interface SensorConfig {
  id: string;
  name: string;
  unit: string;
  unitLabel: string;
  icon: any;
  cardBg: string;
  darkCardBg: string;
  chartColor: string;
  defaultValue: number;
  mockData: number[];
}

const SENSORS: SensorConfig[] = [
  {
    id: 'airTemp',
    name: '기온',
    unit: '°C',
    unitLabel: '온도 (°C)',
    icon: SENSOR_ICONS.airTemp,
    cardBg: '#D4EDDA',
    darkCardBg: '#1E3A2E',
    chartColor: '#E74C3C',
    defaultValue: 24,
    mockData: [18, 19, 21, 24, 26, 28, 27, 25, 24, 22, 20, 19],
  },
  {
    id: 'humidity',
    name: '습도',
    unit: '%',
    unitLabel: '습도 (%)',
    icon: SENSOR_ICONS.humidity,
    cardBg: '#D1ECF1',
    darkCardBg: '#1A3A4A',
    chartColor: '#3498DB',
    defaultValue: 65,
    mockData: [55, 58, 60, 62, 65, 68, 70, 67, 65, 63, 60, 58],
  },
  {
    id: 'co2',
    name: 'CO₂ 농도',
    unit: 'ppm',
    unitLabel: '농도 (ppm)',
    icon: SENSOR_ICONS.co2,
    cardBg: '#D4EDDA',
    darkCardBg: '#1E3A2E',
    chartColor: '#27AE60',
    defaultValue: 450,
    mockData: [420, 430, 440, 450, 460, 470, 465, 455, 450, 445, 440, 435],
  },
  {
    id: 'soilPH',
    name: '토양산도',
    unit: 'pH',
    unitLabel: '산도 (pH)',
    icon: SENSOR_ICONS.soilPH,
    cardBg: '#D1ECF1',
    darkCardBg: '#1A3A4A',
    chartColor: '#E67E22',
    defaultValue: 6.5,
    mockData: [6.2, 6.3, 6.4, 6.5, 6.6, 6.5, 6.4, 6.5, 6.6, 6.5, 6.4, 6.3],
  },
  {
    id: 'soilMoisture',
    name: '토양수분',
    unit: '%',
    unitLabel: '수분 (%)',
    icon: SENSOR_ICONS.soilMoisture,
    cardBg: '#D1ECF1',
    darkCardBg: '#1A3A4A',
    chartColor: '#2980B9',
    defaultValue: 55,
    mockData: [50, 52, 54, 55, 56, 57, 56, 55, 54, 53, 52, 51],
  },
  {
    id: 'soilTemp',
    name: '지온',
    unit: '°C',
    unitLabel: '온도 (°C)',
    icon: SENSOR_ICONS.soilTemp,
    cardBg: '#D4EDDA',
    darkCardBg: '#1E3A2E',
    chartColor: '#E67E22',
    defaultValue: 22,
    mockData: [18, 19, 20, 21, 22, 23, 23, 22, 22, 21, 20, 19],
  },
  {
    id: 'solar',
    name: '일사량',
    unit: 'W/m²',
    unitLabel: '일사 (W/m²)',
    icon: SENSOR_ICONS.solar,
    cardBg: '#FFF3CD',
    darkCardBg: '#3A3A1E',
    chartColor: '#F1C40F',
    defaultValue: 850,
    mockData: [0, 100, 300, 550, 750, 850, 800, 650, 400, 200, 50, 0],
  },
  {
    id: 'soilHumidity',
    name: '토양습도',
    unit: '%',
    unitLabel: '습도 (%)',
    icon: SENSOR_ICONS.soilHumidity,
    cardBg: '#D4EDDA',
    darkCardBg: '#1E3A2E',
    chartColor: '#1ABC9C',
    defaultValue: 12,
    mockData: [10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10, 10],
  },
  {
    id: 'wind',
    name: '풍속',
    unit: 'm/s',
    unitLabel: '속도 (m/s)',
    icon: SENSOR_ICONS.wind,
    cardBg: '#E2D9F3',
    darkCardBg: '#2A2A3A',
    chartColor: '#9B59B6',
    defaultValue: 2.5,
    mockData: [1.0, 1.5, 2.0, 2.5, 3.0, 2.8, 2.5, 2.0, 1.8, 1.5, 1.2, 1.0],
  },
];

// ── X축 시간 레이블 ──
const X_LABELS = ['00h', '06h', '12h', '18h', '24h'];

// ── 스파크라인 차트 컴포넌트 (X/Y축 포함) ──
const Sparkline = ({ data, color, w = 100, h = 40, unit }: { data: number[]; color: string; w?: number; h?: number; unit?: string }) => {
  if (!data || data.length < 2) return null;

  const MARGIN_LEFT = 28; // Y축 레이블 공간
  const MARGIN_BOTTOM = 14; // X축 레이블 공간
  const chartW = w - MARGIN_LEFT;
  const chartH = h - MARGIN_BOTTOM;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = chartW / (data.length - 1);

  const points = data.map((v, i) => ({
    x: MARGIN_LEFT + i * step,
    y: ((max - v) / range) * (chartH - 4) + 2,
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + step * 0.4;
    const cp1y = points[i - 1].y;
    const cp2x = points[i].x - step * 0.4;
    const cp2y = points[i].y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }

  const fillD = pathD + ` L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`;

  // Y축 값 (최대, 중간, 최소)
  const yMid = Math.round((min + max) / 2);
  const yLabels = [
    { val: Math.round(max), y: 6 },
    { val: yMid, y: chartH / 2 },
    { val: Math.round(min), y: chartH - 2 },
  ];

  return (
    <View>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        {/* Y축 레이블 */}
        {yLabels.map((yl, i) => (
          <SvgText
            key={`y${i}`}
            x={MARGIN_LEFT - 4}
            y={yl.y + 3}
            fontSize={7}
            fill="#8A9A8A"
            textAnchor="end"
          >
            {yl.val}
          </SvgText>
        ))}
        {/* 차트 영역 */}
        <Path d={fillD} fill={`url(#grad_${color.replace('#', '')})`} />
        <Path d={pathD} stroke={color} strokeWidth={1.5} fill="none" />
        {/* X축 레이블 */}
        {X_LABELS.map((label, i) => {
          const xPos = MARGIN_LEFT + (chartW / (X_LABELS.length - 1)) * i;
          return (
            <SvgText
              key={`x${i}`}
              x={xPos}
              y={h - 2}
              fontSize={7}
              fill="#8A9A8A"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

// ── 기간 옵션 ──
const PERIODS = [
  { key: '24h', label: '24시간' },
  { key: '7d', label: '7일' },
  { key: '30d', label: '30일' },
];

const SensorDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useStore((s) => s.isDarkMode);
  const sensorData = useStore((s) => s.sensorData);
  const farmInfo = useStore((s) => s.farmInfo);
  const c = isDarkMode ? darkColors : colors;

  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 센서 값 가져오기
  const getSensorValue = (sensorId: string): string => {
    if (!sensorData) return '--';
    switch (sensorId) {
      case 'airTemp': return sensorData.temperature?.value?.toString() ?? '--';
      case 'humidity': return sensorData.humidity?.value?.toString() ?? '--';
      case 'co2': return sensorData.co2?.value?.toString() ?? '--';
      case 'soilPH': return (sensorData as any).soilPH?.value?.toString() ?? '--';
      case 'soilMoisture': return sensorData.soilMoisture?.value?.toString() ?? '--';
      case 'soilTemp': return sensorData.soilTemperature?.value?.toString() ?? '--';
      case 'solar': return sensorData.light?.value?.toString() ?? '--';
      case 'soilHumidity': return sensorData.soilHumidity?.value?.toString() ?? '--';
      case 'wind': return sensorData.windSpeed?.value?.toString() ?? '--';
      default: return '--';
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (farmInfo?.id) {
        await getAllSensorData(farmInfo.id);
      }
    } catch (e) {
      // silent
    }
    setRefreshing(false);
  }, [farmInfo]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? c.background : '#F0F7F0' }]} edges={['top']}>
      {/* ====== 헤더 ====== */}
      <View style={[styles.header, isDarkMode && { backgroundColor: c.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? c.text.primary : '#2C3E2F'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: c.text.primary }]}>
          센서 데이터
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* ====== 기간 선택 ====== */}
      <View style={[styles.periodBar, isDarkMode && { backgroundColor: c.surface }]}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodBtn,
              period === p.key && styles.periodBtnActive,
              period === p.key && isDarkMode && { backgroundColor: '#2D5A3D' },
            ]}
            onPress={() => setPeriod(p.key)}
          >
            <Text
              style={[
                styles.periodText,
                period === p.key && styles.periodTextActive,
                isDarkMode && { color: period === p.key ? '#FFFFFF' : c.text.secondary },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ====== 센서 카드 그리드 ====== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5A3D" />
        }
      >
        <View style={styles.grid}>
          {SENSORS.map((sensor) => {
            const value = getSensorValue(sensor.id);
            const displayValue = value !== '--' ? value : sensor.defaultValue.toString();

            return (
              <View
                key={sensor.id}
                style={[
                  styles.card,
                  { backgroundColor: isDarkMode ? sensor.darkCardBg : sensor.cardBg },
                ]}
              >
                {/* 카드 상단: 아이콘 + 센서명 */}
                <View style={styles.cardHeader}>
                  <Image source={sensor.icon} style={styles.sensorIcon} resizeMode="contain" />
                  <Text
                    style={[styles.sensorName, { color: isDarkMode ? '#E0E0E0' : '#1A3A2A' }]}
                    numberOfLines={1}
                  >
                    {sensor.name}
                  </Text>
                </View>

                {/* 카드 중앙: 큰 숫자 + 단위 */}
                <View style={styles.cardValue}>
                  <Text style={[styles.valueText, { color: isDarkMode ? '#FFFFFF' : '#1A2A1A' }]}>
                    {displayValue}
                  </Text>
                  <Text style={[styles.unitText, { color: isDarkMode ? '#AAAAAA' : '#5A7A6A' }]}>
                    {sensor.unit}
                  </Text>
                </View>

                {/* 카드 하단: 스파크라인 차트 */}
                <View style={styles.chartWrap}>
                  <Text style={[styles.chartLabel, { color: isDarkMode ? '#888' : '#7A9A8A' }]}>
                    {sensor.unitLabel}
                  </Text>
                  <Sparkline
                    data={sensor.mockData}
                    color={sensor.chartColor}
                    w={CARD_W - 28}
                    h={52}
                    unit={sensor.unit}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ====== 헤더 ======
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A3A2A',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 36,
  },

  // ====== 기간 선택 ======
  periodBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  periodBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  periodBtnActive: {
    backgroundColor: '#2D5A3D',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ====== 스크롤 ======
  scrollContent: {
    paddingBottom: 20,
  },

  // ====== 그리드 ======
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
    gap: GRID_GAP,
  },

  // ====== 카드 ======
  card: {
    width: CARD_W,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sensorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  sensorName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  // ====== 값 ======
  cardValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 6,
  },
  valueText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ====== 차트 ======
  chartWrap: {
    marginTop: 2,
  },
  chartLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default SensorDashboardScreen;
