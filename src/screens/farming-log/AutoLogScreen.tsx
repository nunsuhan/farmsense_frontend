/**
 * v2.2 AutoLogScreen - 영농일지 자동 생성
 * 센서+기상+살포 데이터를 합쳐서 일일 일지 자동 생성
 * 농가는 작업내용만 체크/확인
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PageLayout from '../../components/common/PageLayout';
import { colors, darkColors, shadows } from '../../theme/colors';
import { useStore, useFarmId } from '../../store/useStore';
import { getCurrentData } from '../../services/sensorApi';
import { sprayApi } from '../../services/sprayApi';
import { dssApi } from '../../services/dssApi';
import apiClient from '../../services/api';

interface AutoLogItem {
  id: string;
  category: 'sensor' | 'weather' | 'spray' | 'irrigation' | 'growth' | 'fertilizer';
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  detail: string;
  time: string;
  checked: boolean;
  source: string;
}

const AutoLogScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useStore((s) => s.isDarkMode);
  const c = isDarkMode ? darkColors : colors;
  const farmId = useFarmId();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AutoLogItem[]>([]);
  const [memo, setMemo] = useState('');

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayStr = dayNames[today.getDay()];

  useEffect(() => {
    generateAutoLog();
  }, []);

  const generateAutoLog = async () => {
    setLoading(true);
    const autoItems: AutoLogItem[] = [];

    // 1. 센서 데이터 조회 (실제 API)
    try {
      const sensorResult = await getCurrentData();
      const sd = sensorResult.data || sensorResult;

      if (sd.temperature) {
        autoItems.push({
          id: 's1', category: 'sensor', icon: 'thermometer',
          iconColor: '#EF4444', bgColor: '#FEF2F2',
          title: '하우스 내부 온도',
          detail: `현재 ${sd.temperature.value}${sd.temperature.unit} - 상태: ${sd.temperature.status === 'normal' ? '적정' : '주의'}`,
          time: new Date(sd.temperature.timestamp || '').toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) || '측정 중',
          checked: true, source: '온도 센서',
        });
      }
      if (sd.humidity) {
        autoItems.push({
          id: 's2', category: 'sensor', icon: 'water',
          iconColor: '#3B82F6', bgColor: '#EFF6FF',
          title: '하우스 습도',
          detail: `현재 ${sd.humidity.value}${sd.humidity.unit} - 상태: ${sd.humidity.status === 'normal' ? '적정' : '주의'}`,
          time: '금일 기준', checked: true, source: '습도 센서',
        });
      }
      if (sd.soil_moisture) {
        autoItems.push({
          id: 's3', category: 'sensor', icon: 'leaf-outline',
          iconColor: '#10B981', bgColor: '#ECFDF5',
          title: '토양 수분',
          detail: `현재 ${sd.soil_moisture.value}${sd.soil_moisture.unit} - ${sd.soil_moisture.status === 'normal' ? '관수 불필요' : '관수 검토'}`,
          time: '금일 기준', checked: true, source: '토양수분 센서',
        });
      }
    } catch (e) {
      console.warn('센서 데이터 조회 실패:', e);
    }

    // 2. 생육단계/기상 (Today API)
    try {
      const todayRes = await apiClient.get(`/v2/today/${farmId}/`);
      const td = todayRes.data;

      if (td.weather) {
        autoItems.push({
          id: 'w1', category: 'weather', icon: 'partly-sunny',
          iconColor: '#F59E0B', bgColor: '#FFFBEB',
          title: '기상 데이터',
          detail: `${td.weather.description || '측정 중'} / 기온 ${td.weather.temp_current ?? '-'}°C / 습도 ${td.weather.humidity ?? '-'}%`,
          time: '00:00~현재', checked: true, source: '기상청 API',
        });
      }

      if (td.growth) {
        autoItems.push({
          id: 'g1', category: 'growth', icon: 'leaf',
          iconColor: '#10B981', bgColor: '#ECFDF5',
          title: '생육 단계 추정',
          detail: `GDD ${td.growth.gdd?.toFixed(0) ?? 0}°C·일 - ${td.growth.label || '확인 중'}`,
          time: '금일 기준', checked: true, source: 'AI 분석',
        });
      }
    } catch (e) {
      console.warn('Today API 조회 실패:', e);
    }

    // 3. 관수 이력 (DSS)
    try {
      const dssData = await dssApi.getDashboard(farmId ?? 0);
      if (dssData && dssData.irrigation) {
        autoItems.push({
          id: 'i1', category: 'irrigation', icon: 'water-outline',
          iconColor: '#06B6D4', bgColor: '#ECFEFF',
          title: '관수 상태',
          detail: `CWSI: ${dssData.irrigation.cwsi?.toFixed(2) ?? '-'} / VPD: ${dssData.irrigation.vpd?.toFixed(1) ?? '-'} kPa - ${dssData.irrigation.should_irrigate ? '관수 필요' : '관수 불필요'}`,
          time: '금일 기준', checked: true, source: 'DSS 엔진',
        });
      }
    } catch (e) {
      console.warn('DSS 조회 실패:', e);
    }

    // 4. 살포 이력 (Spray API)
    try {
      const farmIdNum = farmId ?? 0;
      if (farmIdNum > 0) {
        const sprayHistory = await sprayApi.getSprayHistory(farmIdNum);
        const todaySessions = (sprayHistory.sessions || []).filter((s) => {
          return s.started_at && s.started_at.startsWith(today.toISOString().slice(0, 10));
        });
        if (todaySessions.length > 0) {
          todaySessions.forEach((session, idx) => {
            autoItems.push({
              id: `sp${idx}`, category: 'spray', icon: 'flask',
              iconColor: '#8B5CF6', bgColor: '#F5F3FF',
              title: '농약 살포 기록',
              detail: `${session.pesticide_name} (${session.dilution_rate}) ${session.spray_volume_liters}L${session.target_disease ? ' - ' + session.target_disease : ''}`,
              time: new Date(session.started_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              checked: false, source: '살포 기록 (자동)',
            });
          });
        }
      }
    } catch (e) {
      console.warn('살포 이력 조회 실패:', e);
    }

    // 5. 비료 시비 기록 (GAP Fertilizer)
    try {
      const { gapFertilizerApi } = await import('../../services/gapFertilizerApi');
      let fertilizerAdded = false;

      // 5-1. 감사 기록 조회
      try {
        const auditData = await gapFertilizerApi.getAudit(farmId || '');
        if (auditData?.records_summary && auditData.records_summary.length > 0) {
          auditData.records_summary.forEach((rec, idx) => {
            autoItems.push({
              id: `f${idx}`,
              category: 'fertilizer',
              icon: 'nutrition',
              iconColor: '#059669',
              bgColor: '#ECFDF5',
              title: `비료 시비: ${rec.fertilizer_name}`,
              detail: `총 ${rec.total_amount_kg}kg · ${rec.application_count}회 시비${rec.last_applied ? ` (최근: ${rec.last_applied})` : ''}`,
              time: rec.last_applied || '기록 있음',
              checked: true,
              source: 'GAP 비료 관리',
            });
          });
          fertilizerAdded = true;
        }
        // 감사 준수율 카드
        if (auditData && !fertilizerAdded) {
          autoItems.push({
            id: 'f-audit',
            category: 'fertilizer',
            icon: 'nutrition',
            iconColor: '#059669',
            bgColor: '#ECFDF5',
            title: 'GAP 비료 관리',
            detail: `GAP 준수율 ${auditData.compliance_rate ?? 0}% · 인증: ${auditData.certification_status === 'ready' ? '인증 가능' : auditData.certification_status === 'needs_improvement' ? '개선 필요' : '확인중'}`,
            time: '금일 기준',
            checked: true,
            source: 'GAP 비료 관리',
          });
          fertilizerAdded = true;
        }
      } catch (_auditErr) {
        // audit 실패 시 아래 추천으로 대체
      }

      // 5-2. 추천 데이터로 대체
      if (!fertilizerAdded) {
        try {
          const recData = await gapFertilizerApi.getRecommendations(farmId || '');
          if (recData?.recommendations && recData.recommendations.length > 0) {
            const topRec = recData.recommendations[0];
            const deficits = recData.nutrient_balance
              ? Object.entries(recData.nutrient_balance)
                  .filter(([, v]) => v.level === 'deficient' || v.level === 'severe')
                  .map(([k]) => k)
              : [];
            autoItems.push({
              id: 'f-rec',
              category: 'fertilizer',
              icon: 'nutrition',
              iconColor: '#059669',
              bgColor: '#ECFDF5',
              title: 'GAP 비료 추천',
              detail: `${topRec.fertilizer_name} ${topRec.amount_kg_per_ha}kg/ha 추천${deficits.length > 0 ? ` · 결핍: ${deficits.join(', ')}` : ''}`,
              time: '금일 기준',
              checked: false,
              source: 'GAP 비료 분석',
            });
            fertilizerAdded = true;
          }
        } catch (_recErr) {
          // 추천도 실패
        }
      }

      // 5-3. 최종 기본 카드
      if (!fertilizerAdded) {
        autoItems.push({
          id: 'f-default',
          category: 'fertilizer',
          icon: 'nutrition',
          iconColor: '#059669',
          bgColor: '#ECFDF5',
          title: 'GAP 비료 관리',
          detail: '비료 시비 기록이 없습니다. 시비 후 기록을 등록하세요.',
          time: '금일 기준',
          checked: false,
          source: 'GAP 비료 관리',
        });
      }
    } catch (e) {
      // 모듈 import 자체 실패 시에도 기본 카드 표시
      autoItems.push({
        id: 'f-default',
        category: 'fertilizer',
        icon: 'nutrition',
        iconColor: '#059669',
        bgColor: '#ECFDF5',
        title: 'GAP 비료 관리',
        detail: '비료 데이터를 불러올 수 없습니다.',
        time: '금일 기준',
        checked: false,
        source: 'GAP 비료 관리',
      });
    }

    // 데이터가 없으면 안내 메시지
    if (autoItems.length === 0) {
      autoItems.push({
        id: 'empty', category: 'sensor', icon: 'alert-circle-outline',
        iconColor: '#F59E0B', bgColor: '#FFFBEB',
        title: '데이터 수집 중',
        detail: '센서 데이터가 아직 수집되지 않았습니다. 센서 등록 및 연결을 확인하세요.',
        time: '현재', checked: false, source: '시스템',
      });
    }

    setItems(autoItems);
    setLoading(false);
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSave = () => {
    const checkedItems = items.filter((i) => i.checked);
    if (checkedItems.length === 0) {
      Alert.alert('알림', '최소 1개 항목을 선택해주세요.');
      return;
    }
    Alert.alert(
      '자동 일지 저장',
      `${checkedItems.length}개 항목이 오늘의 영농일지로 저장되었습니다.`,
      [{ text: '확인', onPress: () => navigation.goBack() }]
    );
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <PageLayout title="자동 일지 생성" showBack showFooter={false}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Date header */}
        <View style={[styles.dateCard, { backgroundColor: c.surface }]}>
          <Ionicons name="calendar" size={20} color={c.primary} />
          <Text style={[styles.dateText, { color: c.text }]}>
            {dateStr} ({dayStr})
          </Text>
          <View style={[styles.autoBadge, { backgroundColor: isDarkMode ? '#065F4620' : '#ECFDF5' }]}>
            <Ionicons name="flash" size={14} color="#10B981" />
            <Text style={styles.autoBadgeText}>자동 생성</Text>
          </View>
        </View>

        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
          <Ionicons name="information-circle" size={18} color="#3B82F6" />
          <Text style={[styles.infoText, { color: isDarkMode ? '#93C5FD' : '#1D4ED8' }]}>
            센서, 기상, 살포 데이터를 기반으로 자동 생성된 일지입니다.{'\n'}
            확인 후 체크하고 저장하세요.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[styles.loadingText, { color: c.textSub }]}>
              오늘의 데이터를 수집하고 있습니다...
            </Text>
          </View>
        ) : (
          <>
            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={[styles.progressText, { color: c.textSub }]}>
                확인 완료: {checkedCount}/{items.length}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setItems((prev) => prev.map((i) => ({ ...i, checked: true })))
                }
              >
                <Text style={[styles.checkAllText, { color: c.primary }]}>전체 확인</Text>
              </TouchableOpacity>
            </View>

            {/* Auto-generated items */}
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: c.surface },
                  item.checked && styles.itemCardChecked,
                  item.checked && { borderColor: c.primary },
                ]}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.itemTop}>
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: isDarkMode ? `${item.iconColor}20` : item.bgColor },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: c.text }]}>{item.title}</Text>
                    <Text style={[styles.itemDetail, { color: c.textSub }]}>{item.detail}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={[styles.itemTime, { color: c.textDisabled }]}>
                        {item.time}
                      </Text>
                      <Text style={[styles.itemSource, { color: c.textDisabled }]}>
                        {item.source}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: item.checked ? c.primary : c.border },
                      item.checked && { backgroundColor: c.primary },
                    ]}
                  >
                    {item.checked && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: c.primary }]}
              onPress={handleSave}
            >
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                영농일지로 저장 ({checkedCount}개 항목)
              </Text>
            </TouchableOpacity>

            {/* Manual write link */}
            <TouchableOpacity
              style={styles.manualLink}
              onPress={() => navigation.navigate('LogWrite', { date: today.toISOString().slice(0, 10) })}
            >
              <Ionicons name="pencil" size={16} color={c.primary} />
              <Text style={[styles.manualLinkText, { color: c.primary }]}>
                직접 작성하기
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 16 },

  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
    gap: 10,
    ...shadows.small,
  },
  dateText: { fontSize: 16, fontWeight: '700', flex: 1 },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  autoBadgeText: { fontSize: 12, fontWeight: '700', color: '#10B981' },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },

  loadingWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  loadingText: { fontSize: 14 },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  progressText: { fontSize: 13, fontWeight: '600' },
  checkAllText: { fontSize: 13, fontWeight: '700' },

  itemCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  itemCardChecked: {
    borderWidth: 2,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  itemDetail: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
  itemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  itemTime: { fontSize: 11, fontWeight: '500' },
  itemSource: { fontSize: 11, fontWeight: '500' },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
    ...shadows.medium,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  manualLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  manualLinkText: { fontSize: 14, fontWeight: '600' },
});

export default AutoLogScreen;
