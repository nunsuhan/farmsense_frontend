import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Svg, Path, Line, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store/useStore';
import { getCurrentData, formatSensorValue, getSensorStatusColor, getGraphData, getStats, getSensorStatusIcon } from '../services/sensorApi';
import { avatarApi } from '../services/avatarApi';
import { SensorGraphResponse, SensorStatsResponse } from '../types/api.types';
import { useFocusEffect } from '@react-navigation/native';
import { dssApi } from '../services/dssApi';

// Assets
import {
  DiagnosisIllustration,
  LogIllustration,
  CounselorIllustration,
  CheckIllustration,
  WeatherSunIcon,
} from '../components/home/HomeAssets';

const { width } = Dimensions.get('window');

// Enhanced Line Chart Component with Axes & adaptive scaling
const EnhancedLineChart = ({ datasets, labels, width, height, unit, sensorType }: any) => {
  const validDatasets = datasets?.filter((d: any) => d.values && d.values.length > 0);
  if (!validDatasets || validDatasets.length === 0) return (
    <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#9CA3AF' }}>데이터가 없습니다.</Text>
    </View>
  );

  const allValues = validDatasets.flatMap((d: any) => d.values).filter((v: any) => v !== null && !isNaN(v));
  if (allValues.length === 0) return null;

  let maxVal = Math.max(...allValues);
  let minVal = Math.min(...allValues);

  // Define minimum visual range span to avoid "zoomed in" look on stable data
  // e.g. if temp is 20.1 and 20.2, we don't want axis 20.1 to 20.2.
  let minRangeSpan = 10;
  if (sensorType === 'co2') minRangeSpan = 100;
  if (sensorType === 'light') minRangeSpan = 50;

  // Initial Range
  let currentRange = maxVal - minVal;
  if (currentRange < minRangeSpan) {
    const mid = (maxVal + minVal) / 2;
    maxVal = mid + minRangeSpan / 2;
    minVal = mid - minRangeSpan / 2;
  }

  // Padding factor (prevent line hitting edges)
  const padding = (maxVal - minVal) * 0.15;
  let finalMax = maxVal + padding;
  let finalMin = minVal - padding;

  // Sensor Constraints
  const isNonNegative = ['humidity', 'soil_moisture', 'co2', 'light'].includes(sensorType);

  if (isNonNegative) {
    if (finalMin < 0) finalMin = 0;
    if (sensorType === 'humidity' || sensorType === 'soil_moisture') {
      if (finalMax > 100) finalMax = 100;
    }
  }

  // Rounding for cleaner axis labels
  finalMax = Math.ceil(finalMax);
  finalMin = Math.floor(finalMin);

  // Guard against flat line after rounding
  if (finalMax <= finalMin) finalMax = finalMin + 1;

  const range = finalMax - finalMin;
  const chartHeight = height - 30; // X-axis space
  const chartWidth = width - 40;   // Y-axis space
  const stepX = chartWidth / (labels.length - 1 || 1);

  // Generate 5 Y-axis ticks
  const yTicks = [0, 1, 2, 3, 4].map(i => finalMin + (range * i) / 4);

  return (
    <View style={{ flexDirection: 'row', height }}>
      {/* Y-Axis */}
      <View style={{ width: 35, justifyContent: 'space-between', paddingBottom: 30, paddingRight: 5, alignItems: 'flex-end' }}>
        {yTicks.slice().reverse().map((tick, i) => (
          <Text key={i} style={{ fontSize: 10, color: '#9CA3AF' }}>
            {Math.round(tick)}
          </Text>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        <Svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
          {/* Horizontal Grid */}
          {yTicks.map((_, i) => {
            const y = chartHeight - (i * (chartHeight / 4));
            return (
              <Line
                key={`grid-${i}`}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          {/* Lines */}
          {validDatasets.map((dataset: any, i: number) => {
            const d = dataset.values.map((val: number, idx: number) => {
              if (val === null || isNaN(val)) return null;
              const x = idx * stepX;
              // Clamp drawing Y to chart bounds to prevent overflow visual glitch
              let yVal = val;
              if (yVal > finalMax) yVal = finalMax;
              if (yVal < finalMin) yVal = finalMin;

              const y = chartHeight - ((yVal - finalMin) / range) * chartHeight;
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).filter(Boolean).join(' ');

            return (
              <Path
                key={i}
                d={d}
                fill="none"
                stroke={dataset.color}
                strokeWidth={dataset.strokeWidth || 2}
                strokeDasharray={dataset.strokeDashArray}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </Svg>

        {/* X-Axis Labels (Sampled) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {labels.filter((_: any, i: number) => i % Math.ceil(labels.length / 5) === 0).map((label: string, i: number) => (
            <Text key={i} style={{ fontSize: 10, color: '#9CA3AF' }}>{label}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const StatsItem = ({ label, value, diff, unit }: any) => {
  const isPositive = diff > 0;
  const isZero = diff === 0;

  return (
    <View style={styles.statsItem}>
      <Text style={styles.statsLabel}>{label}</Text>
      <View style={styles.statsValueRow}>
        <Text style={styles.statsValue}>{value}{unit}</Text>
        {!isZero && (
          <View style={[styles.diffBadge, isPositive ? styles.diffPos : styles.diffNeg]}>
            <Ionicons name={isPositive ? "caret-up" : "caret-down"} size={10} color={isPositive ? "#DC2626" : "#2563EB"} />
            <Text style={[styles.diffText, isPositive ? styles.diffTextPos : styles.diffTextNeg]}>
              {Math.abs(diff)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const getSensorTypeIcon = (key: string): string => {
  switch (key) {
    case 'temperature': return 'thermometer-outline';
    case 'humidity': return 'water-outline';
    case 'soil_moisture': return 'leaf-outline';
    case 'co2': return 'cloud-outline';
    case 'light': return 'sunny-outline';
    default: return 'help-circle-outline';
  }
};

const getSensorTypeName = (key: string): string => {
  switch (key) {
    case 'temperature': return '온도';
    case 'humidity': return '습도';
    case 'soil_moisture': return '토양수분';
    case 'co2': return 'CO2';
    case 'light': return '일사량';
    default: return '센서';
  }
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Zustand Store
  const { user, farmInfo, sensorData, setSensorData } = useStore();

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState(0); // For forcing re-render

  // Graph State
  const [graphPeriod, setGraphPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedSensor, setSelectedSensor] = useState<'temperature' | 'humidity' | 'soil_moisture' | 'co2' | 'light' | 'wind'>('temperature');
  const [showSensorDropdown, setShowSensorDropdown] = useState(false); // New Dropdown State
  const [graphData, setGraphData] = useState<SensorGraphResponse | null>(null);
  const [viewMode, setViewMode] = useState<'values' | 'graph'>('values');

  // Stats State
  const [statsData, setStatsData] = useState<SensorStatsResponse | null>(null);

  // DSS Dashboard State
  const [dssDashboard, setDssDashboard] = useState<any>(null);

  // ============================================
  // 센서 데이터 폴링 (30초 간격, farmInfo.id 기반)
  // ============================================
  useEffect(() => {
    // farmInfo가 없으면 폴링하지 않음
    if (!farmInfo?.id) {
      console.log('⚠️ [HomeScreen] farmInfo.id가 없습니다. 센서 데이터를 가져올 수 없습니다.');
      return;
    }

    const fetchSensorData = async () => {
      try {
        setLoading(true);
        // console.log(`🔄 [HomeScreen] 센서 데이터 조회 중... (farmId: ${farmInfo.id})`);

        // 1. Current Data
        const res = await getCurrentData();
        if (res && res.data) {
          // Flatten nesting for UI compatibility: data.* -> sensorData.*, plus is_model_farm
          const flatData = { ...res.data, is_model_farm: res.is_model_farm };
          setSensorData(flatData as any);
          setLastUpdate(new Date(res.recorded_at || Date.now()));
        }


        // 2. Graph Data (Initial)
        fetchGraph('day');

        // 3. Stats Data
        fetchStats();

        // 4. DSS Dashboard (NEW)
        try {
          const dssRes = await dssApi.getDashboard(farmInfo.id);
          if (dssRes) setDssDashboard(dssRes);
        } catch (dssErr) {
          console.log('DSS Fetch Error', dssErr);
        }

        // console.log('✅ [HomeScreen] 센서 데이터 업데이트 완료');
      } catch (error: any) {
        console.error('❌ [HomeScreen] 센서 데이터 로드 실패:', error.message);
      } finally {
        setLoading(false);
      }
    };

    // 초기 로드
    fetchSensorData();

    // 30초마다 갱신
    const interval = setInterval(fetchSensorData, 30000);

    // Cleanup
    return () => {
      // console.log('🧹 [HomeScreen] 폴링 정리');
      clearInterval(interval);
    };
  }, [farmInfo?.id]); // farmInfo.id가 변경되면 재실행

  const fetchGraph = async (period: 'day' | 'week' | 'month', sensor: string = selectedSensor) => {
    try {
      // Pass sensor type to API (Api needs update to handle filtering or we filter here)
      // Assuming getGraphData returns all or we filter result. 
      // For now, let's assume getGraphData gets everything and we filter in UI,
      // OR update getGraphData to take sensor type. Let's send it.
      const res = await getGraphData(period, sensor as any);
      setGraphData(res);
    } catch (e) {
      console.log('Graph fetch failed', e);
    }
  }

  const fetchStats = async () => {
    try {
      const res = await getStats();
      setStatsData(res);
    } catch (e) {
      console.log('Stats fetch failed', e);
    }
  }

  // Handle Graph Period Change
  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    setGraphPeriod(period);
    fetchGraph(period, selectedSensor);
  };

  // Handle Sensor Tab Change
  const handleSensorChange = (sensor: any) => {
    setSelectedSensor(sensor);
    // Optional: Re-fetch if API supports sensor-specific queries to save bandwidth
    // For now, we reuse current logic or re-fetch.
    fetchGraph(graphPeriod, sensor);
  };

  // ============================================
  // Pull to Refresh
  // ============================================
  const onRefresh = async () => {
    if (!farmInfo?.id) {
      Alert.alert('알림', '농장 정보가 없습니다.');
      return;
    }

    setRefreshing(true);
    try {
      const res = await getCurrentData();
      if (res && res.data) {
        const flatData = { ...res.data, is_model_farm: res.is_model_farm };
        setSensorData(flatData as any);
        setLastUpdate(new Date(res.recorded_at || Date.now()));
      }
      await fetchGraph(graphPeriod);
    } catch (error: any) {
      console.error('오류', error.message || '센서 데이터를 불러올 수 없습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================
  // Avatar Loading
  // ============================================
  const loadAvatar = async () => {
    try {
      const info = await avatarApi.getMyAvatar();
      if (info && info.avatar_url) {
        const fullUrl = info.avatar_url.startsWith('http')
          ? info.avatar_url
          : `https://farmsense.kr${info.avatar_url}`;
        setAvatarUrl(`${fullUrl}?t=${new Date().getTime()}`);
        setAvatarKey(prev => prev + 1);
      }
    } catch (e) {
      console.log('Failed to load avatar on Home', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAvatar();
    }, [])
  );

  // ============================================
  // UI Helpers
  // ============================================
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  const ServiceCard = ({ title, sub, Illustration, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.serviceCard}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.serviceTitle}>{title}</Text>
          <Text style={styles.serviceSub}>{sub}</Text>
          <View style={styles.arrowBtn}>
            <Ionicons name="arrow-forward" size={16} color="#10B981" />
          </View>
        </View>
        <View style={styles.illustrationContainer}>
          <Illustration width={90} height={90} />
        </View>
      </View>
    </TouchableOpacity>
  );

  // ============================================
  // Render
  // ============================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Fresh Green Background */}
      <LinearGradient
        colors={['#DCFCE7', '#F0FDF4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>FarmSense</Text>
          </View>
          <View style={styles.headerRight}>
            {user && (
              <TouchableOpacity
                onPress={() => navigation.navigate('NotificationList')}
                style={styles.iconBtn}
              >
                <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                <View style={styles.badge} />
              </TouchableOpacity>
            )}

            {user ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={[styles.iconBtn, styles.profileBtn, { overflow: 'hidden', padding: 0 }]}
              >
                {avatarUrl ? (
                  <Image
                    key={`header-avatar-${avatarKey}`}
                    source={{ uri: avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialCommunityIcons name="face-man-profile" size={26} color="#10B981" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={[styles.iconBtn, styles.loginBtn]}
              >
                <Text style={styles.loginText}>로그인</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Menu')}
              style={styles.iconBtn}
            >
              <Ionicons name="menu-outline" size={28} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>
                환영합니다, <Text style={styles.userName}>{user?.name || '문수'}</Text>님
              </Text>
              <Text style={styles.welcomeSub}>오늘도 힘찬 하루 보내세요! 🌱</Text>
              {lastUpdate && (
                <Text style={styles.updateTime}>
                  업데이트: {lastUpdate.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>

          {/* Sensor Data Display */}
          <Text style={styles.sectionHeader}>실시간 센서 현황</Text>
          {loading && !sensorData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>센서 데이터 로딩 중...</Text>
            </View>
          ) : !sensorData || !sensorData.temperature ? (
            <View style={styles.noDataContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
              <Text style={styles.noDataText}>센서 데이터가 없습니다</Text>
              <Text style={styles.noDataSubtext}>농장 정보를 설정해주세요</Text>
            </View>
          ) : (
            <View style={[styles.sensorCard, { zIndex: 20 }]}>
              {/* ---------------- DSS SECTION (Alerts) ---------------- */}
              {dssDashboard?.alerts && dssDashboard.alerts.length > 0 && (
                <View style={[styles.dssCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
                  <Text style={[styles.dssTitle, { color: '#DC2626' }]}>🚨 긴급 알림</Text>
                  {dssDashboard.alerts.map((alert: any, idx: number) => (
                    <View key={idx} style={styles.dssItem}>
                      <Text style={styles.dssText}>• {alert.message}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* DSS Tasks */}
              {dssDashboard?.today_tasks && dssDashboard.today_tasks.length > 0 && (
                <View style={[styles.dssCard, { borderColor: '#93C5FD', backgroundColor: '#EFF6FF', marginTop: 12, marginBottom: 20 }]}>
                  <Text style={[styles.dssTitle, { color: '#2563EB' }]}>📋 오늘의 할 일</Text>
                  {dssDashboard.today_tasks.map((task: any, idx: number) => (
                    <View key={idx} style={styles.dssItem}>
                      <Text style={styles.dssText}>
                        {task.status === 'completed' ? '✅' : '⬜'} {task.task}
                        {task.recommended_time && ` (${task.recommended_time})`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {/* ------------------------------------------------------ */}

              {/* Compact Header with Nested Dropdown */}
              <View style={styles.compactHeader}>
                {/* Left: Sensor Dropdown Trigger & Menu Wrapper */}
                <View style={{ zIndex: 50 }}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setShowSensorDropdown(!showSensorDropdown)}
                  >
                    <Ionicons
                      name={getSensorTypeIcon(selectedSensor as any) as any}
                      size={18}
                      color="#1F2937"
                    />
                    <Text style={styles.dropdownText}>
                      {getSensorTypeName(selectedSensor as any)}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>

                  {/* Dropdown Menu (Absolute relative to this wrapper) */}
                  {showSensorDropdown && (
                    <View style={styles.dropdownMenu}>
                      {[
                        { key: 'temperature', label: '온도', icon: 'thermometer-outline' },
                        { key: 'humidity', label: '습도', icon: 'water-outline' },
                        { key: 'soil_moisture', label: '토양수분', icon: 'leaf-outline' },
                        { key: 'co2', label: 'CO2', icon: 'cloud-outline' },
                        { key: 'light', label: '일사량', icon: 'sunny-outline' }
                      ].map((item) => (
                        <TouchableOpacity
                          key={item.key}
                          style={[
                            styles.dropdownItem,
                            selectedSensor === item.key && styles.dropdownItemActive
                          ]}
                          onPress={() => {
                            handleSensorChange(item.key);
                            setShowSensorDropdown(false);
                          }}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={16}
                            color={selectedSensor === item.key ? '#10B981' : '#4B5563'}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={[
                            styles.dropdownItemText,
                            selectedSensor === item.key && styles.dropdownItemTextActive
                          ]}>
                            {item.label}
                          </Text>
                          {selectedSensor === item.key && (
                            <Ionicons name="checkmark" size={16} color="#10B981" style={{ marginLeft: 'auto' }} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Right: Controls */}
                <View style={styles.headerControls}>
                  {/* Period Cycle Button (Only in Graph Mode) */}
                  {viewMode === 'graph' && (
                    <TouchableOpacity
                      style={styles.controlBtn}
                      onPress={() => {
                        const next = graphPeriod === 'day' ? 'week' : graphPeriod === 'week' ? 'month' : 'day';
                        handlePeriodChange(next);
                      }}
                    >
                      <Text style={styles.controlBtnText}>
                        {graphPeriod === 'day' ? '일간' : graphPeriod === 'week' ? '주간' : '월간'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* View Mode Toggle */}
                  <TouchableOpacity
                    style={[styles.controlBtn, styles.viewToggleBtn]}
                    onPress={() => setViewMode(prev => prev === 'values' ? 'graph' : 'values')}
                  >
                    <Ionicons
                      name={viewMode === 'values' ? "stats-chart" : "list"}
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.viewToggleText}>
                      {viewMode === 'values' ? '그래프' : '수치'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content Area */}
              <View style={styles.dashboardContent}>
                {/* MODE 1: Sensor Values List */}
                {viewMode === 'values' && (
                  <View style={styles.sensorGrid}>
                    {[
                      { key: 'temperature', label: '온도', val: sensorData?.temperature },
                      { key: 'humidity', label: '습도', val: sensorData?.humidity },
                      { key: 'soil_moisture', label: '토양수분', val: sensorData?.soil_moisture },
                      { key: 'co2', label: 'CO2', val: sensorData?.co2 },
                      { key: 'light', label: '일사량', val: sensorData?.light },
                    ]
                      .filter((s) => s.val !== undefined && s.val !== null)
                      .map((s) => (
                        <View key={s.key} style={styles.sensorGridItem}>
                          <Ionicons
                            name={getSensorTypeIcon(s.key as any) as any}
                            size={20}
                            color={getSensorStatusColor(s.val?.status || 'normal')}
                            style={{ marginBottom: 4 }}
                          />
                          <Text style={styles.sensorLabel}>{s.label}</Text>
                          <Text style={styles.sensorValue}>{formatSensorValue(s.val)}</Text>
                        </View>
                      ))}
                  </View>
                )}

                {/* MODE 2: Graph View */}
                {viewMode === 'graph' && (
                  <View>
                    {/* Legend (Minimal) */}
                    <View style={styles.miniLegend}>
                      <View style={styles.legendPair}>
                        <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.legendLabel}>내 농장</Text>
                      </View>
                      <View style={styles.legendPair}>
                        <View style={[styles.dot, { backgroundColor: '#D1D5DB' }]} />
                        <Text style={styles.legendLabel}>모델팜</Text>
                      </View>
                    </View>

                    {graphData ? (
                      <View>
                        <EnhancedLineChart
                          datasets={[
                            // My Farm Data (Blue Solid)
                            ...((graphData as any)[selectedSensor]?.my_farm?.avg ? [{
                              values: (graphData as any)[selectedSensor]?.my_farm?.avg || [],
                              color: "#3B82F6",
                              strokeWidth: 2.5,
                            }] : []),

                            // Model Farm Data (Light Gray, Dashed)
                            ...((graphData as any)[selectedSensor]?.model_farm?.avg ? [{
                              values: (graphData as any)[selectedSensor]?.model_farm?.avg || [],
                              color: "#D1D5DB", // Light Gray
                              strokeDashArray: "4, 4",
                              strokeWidth: 2
                            }] : [])
                          ]}
                          labels={graphData.labels || []}
                          width={width - 90} // Adjusted to prevent overflow (Screen - 48 - 32 - buffer)
                          height={180}
                          unit={(graphData as any)[selectedSensor]?.unit || ''}
                          sensorType={selectedSensor}
                        />

                        {!((graphData as any)[selectedSensor]?.my_farm?.avg) && (
                          <View style={styles.overlayMessage}>
                            <Ionicons name="information-circle" size={20} color="#6B7280" />
                            <Text style={styles.overlayText}>
                              센서 데이터가 없습니다. (모델팜 데이터만 표시)
                            </Text>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('Menu', { screen: 'SensorRegistration' })}
                              style={styles.overlayLink}
                            >
                              <Text style={styles.overlayLinkText}>센서 등록하기</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color="#10B981" />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Stats Summary Section */}
          {statsData && statsData.today && statsData.week_avg && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>📊 통계 요약</Text>
              <View style={styles.statsRow}>
                <View style={styles.statsColumn}>
                  <Text style={styles.statsSubTitle}>오늘 평균</Text>
                  <StatsItem
                    label="온도"
                    value={statsData.today.temperature?.avg}
                    diff={statsData.changes?.temp_vs_yesterday || 0}
                    unit="°C"
                  />
                  <StatsItem
                    label="습도"
                    value={statsData.today.humidity}
                    diff={statsData.changes?.humid_vs_yesterday || 0}
                    unit="%"
                  />
                </View>
                <View style={styles.statsDivider} />
                <View style={styles.statsColumn}>
                  <Text style={styles.statsSubTitle}>주간 평균</Text>
                  <StatsItem
                    label="온도"
                    value={statsData.week_avg.temperature}
                    diff={0}
                    unit="°C"
                  />
                  <StatsItem
                    label="습도"
                    value={statsData.week_avg.humidity}
                    diff={0}
                    unit="%"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Main Services Grid */}
          <Text style={styles.sectionHeader}>주요 서비스</Text>
          <View style={styles.gridContainer}>
            <ServiceCard
              title="팜닥터"
              sub="이상 징후 모니터링"
              Illustration={DiagnosisIllustration}
              onPress={() => navigation.navigate('FarmDoctor')}
            />
            <ServiceCard
              title="AI 상담소"
              sub="24시간 전문가 답변"
              Illustration={CounselorIllustration}
              onPress={() => navigation.navigate('QnAScreen')}
            />
            <ServiceCard
              title="영농 일지"
              sub="꼼꼼한 성장 기록"
              Illustration={LogIllustration}
              onPress={() => navigation.navigate('LogWrite')}
            />
            <ServiceCard
              title="농작업 일정"
              sub="놓치기 쉬운 할 일"
              Illustration={CheckIllustration}
              onPress={() => navigation.navigate('DailyPrescription')}
            />
          </View>

          {/* Decision Support System Card */}
          <TouchableOpacity
            style={styles.fullWidthCard}
            onPress={() => navigation.navigate('SmartFarm')}
          >
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={styles.serviceTitle}>의사결정 지원 시스템</Text>
                <Text style={styles.serviceSub}>데이터 기반 최적 생육 관리</Text>
                <Text style={styles.serviceDesc}>관수 • 비료 • 방제 • 환경 • 수확량 • 맞춤계획</Text>
              </View>
              <View style={styles.arrowBtn}>
                <Ionicons name="arrow-forward" size={16} color="#4B5563" />
              </View>
            </View>
            <View style={styles.dssIllustration}>
              <Ionicons name="hardware-chip-outline" size={70} color="#D1FAE5" />
            </View>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 2,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  profileBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  loginBtn: {
    width: 'auto',
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    color: '#1F2937',
    fontWeight: '300',
  },
  userName: {
    fontWeight: '700',
    color: '#059669',
  },
  welcomeSub: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  headerAvatarText: {
    fontSize: 24,
  },
  updateTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  // Sensor Card Enhanced Styles
  sensorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16, // Reduced from 20
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  sensorItem: {
    alignItems: 'center',
    gap: 6,
  },
  sensorLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  sensorDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F3F4F6',
  },
  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'center',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 1,
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  // Graph Container
  graphContainer: {
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  graphLabelText: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  // Status & Model Info Styles
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase', // e.g., 'low' -> 'LOW'
  },
  modelInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  modelInfoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelInfoText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  registerSmallBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  registerSmallBtnText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
  },

  // Stats Card Styles
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 10,
  },
  statsSubTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  statsItem: {
    marginBottom: 12,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  diffPos: {
    backgroundColor: '#FEE2E2',
  },
  diffNeg: {
    backgroundColor: '#DBEAFE',
  },
  diffText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  diffTextPos: {
    color: '#DC2626',
  },
  diffTextNeg: {
    color: '#2563EB',
  },

  // Compact Dashboard Styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    zIndex: 20,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  viewToggleBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    gap: 4,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  // Dropdown Menu
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    width: 180,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    zIndex: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dropdownItemActive: {
    backgroundColor: '#ECFDF5',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#059669',
    fontWeight: '700',
  },

  // Dashboard Content
  dashboardContent: {
    minHeight: 140,
  },

  // Clean Graph Layout
  miniLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },
  legendPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Adaptive Sensor Grid Styles
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  sensorGridItem: {
    width: '33.3%', // 3 Items per row
    alignItems: 'center',
    marginBottom: 16,
  },
  // Legacy Adapter Styles (Removed sensorRow/sensorItem replacements)
  sensorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sensorValue: {
    fontSize: 15, // Slightly smaller for dense grid
    fontWeight: 'bold',
    color: '#111827',
  },

  // Utils
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  overlayMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 8,
  },
  overlayText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  overlayLink: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  overlayLinkText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },

  // DSS Styles
  dssCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  dssTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dssItem: {
    marginBottom: 4,
  },
  dssText: {
    fontSize: 13,
    color: '#374151',
  },

  // Service Card Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  serviceCard: {
    width: '100%',
    minWidth: (width - 60) / 2,
    maxWidth: (width - 60) / 2,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    elevation: 2,
    shadowColor: '#059669',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    overflow: 'hidden',
  },
  fullWidthCard: {
    width: '100%',
    height: 140,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: '#059669',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  serviceDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  dssIllustration: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    opacity: 0.8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textContainer: {
    zIndex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: 0.9,
  },
});

export default HomeScreen;
