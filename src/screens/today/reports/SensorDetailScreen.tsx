/**
 * 센서 현황 상세 - 전체 센서 그리드 (각각 터치→그래프)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import PageLayout from '../../../components/common/PageLayout';
import SensorValueTile from '../../../components/common/SensorValueTile';
import HelpCard from '../../../components/common/HelpCard';
import { HELP } from '../../../constants/helpContents';
import { useStore } from '../../../store/useStore';
import { useTheme } from '../../../theme/ThemeProvider';
import { getGraphData, SensorGraphResponse } from '../../../services/sensorApi';

const SensorDetailScreen = () => {
  const { colors: tc } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [graphData, setGraphData] = useState<SensorGraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const sensorData = useStore((s) => s.sensorData);
  const h = HELP.sensor;

  useEffect(() => {
    getGraphData('day', 'all')
      .then(setGraphData)
      .catch(() => { /* 그래프 로드 실패 시 무시 */ })
      .finally(() => setGraphLoading(false));
  }, []);

  return (
    <PageLayout title="센서 현황" helpId={h.id} onHelpPress={() => setShowHelp(!showHelp)} showFooter={false}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {showHelp && <HelpCard id={h.id} title={h.title} body={h.body} icon={h.icon} iconColor={h.iconColor} forceShow />}

        <Text style={{ fontSize: 13, color: tc.text.secondary, textAlign: 'center', paddingVertical: 12 }}>각 센서를 터치하면 그래프가 표시됩니다</Text>

        <View style={styles.tiles}>
          {sensorData?.temperature && (
            <SensorValueTile name="온도" value={sensorData.temperature.value} unit="°C" icon="thermometer-outline" status={sensorData.temperature.status} sensorType="temperature" />
          )}
          {sensorData?.humidity && (
            <SensorValueTile name="습도" value={sensorData.humidity.value} unit="%" icon="water-outline" status={sensorData.humidity.status} sensorType="humidity" />
          )}
          {sensorData?.soil_moisture && (
            <SensorValueTile name="토양수분" value={sensorData.soil_moisture.value} unit="%" icon="leaf-outline" status={sensorData.soil_moisture.status} sensorType="soil_moisture" />
          )}
          {sensorData?.co2 && (
            <SensorValueTile name="CO2" value={sensorData.co2.value} unit="ppm" icon="cloud-outline" status={sensorData.co2.status} sensorType="co2" />
          )}
        </View>

        <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 12 }}>센서 요약</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>등록 센서</Text><Text style={{ fontSize: 15, fontWeight: '600', color: tc.text.primary }}>4개</Text></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>정상 동작</Text><Text style={{ fontSize: 15, fontWeight: '600', color: '#10B981' }}>3개</Text></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>주의 필요</Text><Text style={{ fontSize: 15, fontWeight: '600', color: '#F59E0B' }}>1개</Text></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}><Text style={{ fontSize: 15, color: tc.text.secondary }}>마지막 동기화</Text><Text style={{ fontSize: 15, fontWeight: '600', color: tc.text.primary }}>2분 전</Text></View>
        </View>

        {/* 센서 그래프 데이터 (API) */}
        <View style={{ backgroundColor: tc.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: tc.text.primary, marginBottom: 12 }}>24시간 추이</Text>
          {graphLoading ? (
            <ActivityIndicator size="small" color={tc.primary} style={{ paddingVertical: 16 }} />
          ) : graphData?.series ? (
            <>
              {Object.entries(graphData.series).map(([key, series]: [string, any]) => {
                const label = key === 'temperature' ? '온도' : key === 'humidity' ? '습도' : key === 'soil_moisture' ? '토양수분' : key;
                const unit = key === 'temperature' ? '°C' : '%';
                const latest = series.values?.[series.values.length - 1];
                const min = series.min ?? Math.min(...(series.values || [0]));
                const max = series.max ?? Math.max(...(series.values || [0]));
                return (
                  <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tc.border }}>
                    <Text style={{ fontSize: 14, color: tc.text.secondary, flex: 1 }}>{label}</Text>
                    <Text style={{ fontSize: 13, color: tc.text.secondary }}>{min?.toFixed(1)}~{max?.toFixed(1)}{unit}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: tc.text.primary, width: 60, textAlign: 'right' }}>{latest?.toFixed(1)}{unit}</Text>
                  </View>
                );
              })}
              {graphData.updated_at && (
                <Text style={{ fontSize: 11, color: tc.text.secondary, marginTop: 8, textAlign: 'right' }}>
                  갱신: {new Date(graphData.updated_at).toLocaleTimeString('ko-KR')}
                </Text>
              )}
            </>
          ) : (
            <Text style={{ fontSize: 13, color: tc.text.secondary, textAlign: 'center', paddingVertical: 12 }}>그래프 데이터를 불러올 수 없습니다</Text>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  tiles: { paddingHorizontal: 16 },
});

export default SensorDetailScreen;
