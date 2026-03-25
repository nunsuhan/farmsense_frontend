/**
 * SmartGreenhouseScreen - 스마트 온실 제어
 * 온도/습도/조도/환기 제어 카드 + 자동제어 토글
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows } from '../../theme/colors';
import { useStore } from '../../store/useStore';

interface ControlCard {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  current: string;
  target: string;
  unit: string;
  auto: boolean;
  badge?: string;
  badgeColor?: string;
  extra?: { label: string; value: string }[];
}

const SmartGreenhouseScreen = () => {
  const navigation = useNavigation<any>();
  const farmInfo = useStore((s) => s.farmInfo);
  const user = useStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [allAuto, setAllAuto] = useState(true);

  const farmName = farmInfo?.name || user?.farm_name || '포도 스마트 온실';
  const connectedSensors = 4;

  const [controls, setControls] = useState<ControlCard[]>([
    {
      id: 'temp',
      title: '온도 제어',
      icon: 'thermometer-outline',
      iconColor: '#EF4444',
      bgColor: '#FEF2F2',
      current: '24.5',
      target: '25.0',
      unit: '°C',
      auto: true,
    },
    {
      id: 'humid',
      title: '습도 제어',
      icon: 'water-outline',
      iconColor: '#3B82F6',
      bgColor: '#EFF6FF',
      current: '68',
      target: '65',
      unit: '%',
      auto: true,
    },
    {
      id: 'light',
      title: '조도 제어',
      icon: 'sunny-outline',
      iconColor: '#F59E0B',
      bgColor: '#FFFBEB',
      current: '450',
      target: '500',
      unit: 'μmol',
      auto: true,
      badge: '보광등 가동 중',
      badgeColor: '#F59E0B',
      extra: [{ label: 'DLI', value: '18.2 mol/m²/day' }],
    },
    {
      id: 'vent',
      title: '환기 제어',
      icon: 'thunderstorm-outline',
      iconColor: '#10B981',
      bgColor: '#ECFDF5',
      current: '60',
      target: '50',
      unit: '%',
      auto: true,
      extra: [
        { label: '팬 속도', value: '1200 RPM' },
        { label: '천창 개방률', value: '35%' },
      ],
    },
  ]);

  const toggleAuto = (id: string) => {
    setControls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, auto: !c.auto } : c))
    );
  };

  const toggleAllAuto = () => {
    const newVal = !allAuto;
    setAllAuto(newVal);
    setControls((prev) => prev.map((c) => ({ ...c, auto: newVal })));
  };

  const isNightMode = new Date().getHours() >= 18 || new Date().getHours() < 6;

  // 환경 이상 감지
  const hasAlert = controls.some(
    (c) => Math.abs(parseFloat(c.current) - parseFloat(c.target)) > 5
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{farmName}</Text>
          <View style={styles.headerBadges}>
            <View style={styles.sensorBadge}>
              <Ionicons name="wifi" size={12} color="#10B981" />
              <Text style={styles.sensorBadgeText}>연결 센서 {connectedSensors}개</Text>
            </View>
            {isNightMode && (
              <View style={[styles.sensorBadge, { backgroundColor: '#1E293B' }]}>
                <Ionicons name="moon" size={12} color="#A5B4FC" />
                <Text style={[styles.sensorBadgeText, { color: '#A5B4FC' }]}>야간 모드</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
        }
      >
        {/* 환경 이상 알림 */}
        {hasAlert && (
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
            <Text style={styles.alertText}>환경 이상 감지 — 일부 수치가 목표 범위를 벗어났습니다</Text>
          </View>
        )}

        {/* 제어 카드들 */}
        {controls.map((card) => (
          <View key={card.id} style={styles.controlCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: card.bgColor }]}>
                <Ionicons name={card.icon as any} size={24} color={card.iconColor} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.badge && (
                <View style={[styles.activeBadge, { backgroundColor: `${card.badgeColor}20` }]}>
                  <Text style={[styles.activeBadgeText, { color: card.badgeColor }]}>{card.badge}</Text>
                </View>
              )}
            </View>

            <View style={styles.valuesRow}>
              <View style={styles.valueBlock}>
                <Text style={styles.valueLabel}>현재</Text>
                <Text style={styles.valueNum}>
                  {card.current}<Text style={styles.valueUnit}> {card.unit}</Text>
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.textDisabled} />
              <View style={styles.valueBlock}>
                <Text style={styles.valueLabel}>목표</Text>
                <Text style={[styles.valueNum, { color: colors.primary }]}>
                  {card.target}<Text style={styles.valueUnit}> {card.unit}</Text>
                </Text>
              </View>
            </View>

            {card.extra && (
              <View style={styles.extraRow}>
                {card.extra.map((e, i) => (
                  <View key={i} style={styles.extraItem}>
                    <Text style={styles.extraLabel}>{e.label}</Text>
                    <Text style={styles.extraValue}>{e.value}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.autoRow}>
              <Text style={styles.autoLabel}>자동 제어</Text>
              <Switch
                value={card.auto}
                onValueChange={() => toggleAuto(card.id)}
                trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
                thumbColor={card.auto ? '#10B981' : '#9CA3AF'}
              />
            </View>
          </View>
        ))}

        {/* 전체 자동 / 센서 관리 */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.allAutoButton} onPress={toggleAllAuto}>
            <Ionicons name={allAuto ? 'toggle' : 'toggle-outline'} size={20} color="#FFFFFF" />
            <Text style={styles.allAutoText}>전체 {allAuto ? '수동' : '자동'} 전환</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sensorManageButton}
            onPress={() => navigation.navigate('SensorManage')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
            <Text style={styles.sensorManageText}>센서 관리</Text>
          </TouchableOpacity>
        </View>

        {/* Boulard-Kittas 배너 */}
        <View style={styles.ventBanner}>
          <Ionicons name="analytics-outline" size={20} color="#3B82F6" />
          <View style={styles.ventBannerContent}>
            <Text style={styles.ventBannerTitle}>환기창 스마트 제어</Text>
            <Text style={styles.ventBannerSubtitle}>Boulard-Kittas 모델 기반 자동 환기량 계산</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headerBadges: { flexDirection: 'row', gap: 8, marginTop: 4 },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  sensorBadgeText: { fontSize: 11, fontWeight: '600', color: '#059669' },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  alertText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  controlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    ...shadows.small,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  activeBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  activeBadgeText: { fontSize: 11, fontWeight: '600' },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  valueBlock: { alignItems: 'center' },
  valueLabel: { fontSize: 12, color: colors.textSub, marginBottom: 4 },
  valueNum: { fontSize: 28, fontWeight: '800', color: colors.text },
  valueUnit: { fontSize: 14, fontWeight: '500', color: colors.textSub },
  extraRow: { flexDirection: 'row', gap: 16, marginBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  extraItem: {},
  extraLabel: { fontSize: 12, color: colors.textSub },
  extraValue: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 },
  autoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  autoLabel: { fontSize: 14, fontWeight: '600', color: colors.textSub },
  bottomButtons: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 16 },
  allAutoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  allAutoText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  sensorManageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  sensorManageText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  ventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  ventBannerContent: { flex: 1 },
  ventBannerTitle: { fontSize: 15, fontWeight: '700', color: '#1E40AF' },
  ventBannerSubtitle: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
});

export default SmartGreenhouseScreen;
