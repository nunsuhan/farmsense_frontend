/**
 * Report API - Frontend Aggregator
 * 7개 도메인 보고서를 실제 백엔드 API에서 병렬 조회
 *
 * 개별 API 실패 시 해당 카드만 null (다른 카드는 정상 표시)
 */
import apiClient from './api';
import { getCurrentData } from './sensorApi';
import { dssApi } from './dssApi';
import { sprayApi } from './sprayApi';
import { diagnosisApi } from './diagnosisApi';
import { gapFertilizerApi } from './gapFertilizerApi';

export interface ReportSummary {
  irrigation: { cwsi: number; vpd: number; stressLevel: string; shouldIrrigate: boolean } | null;
  diagnosis: { disease: string; confidence: number; severity: string; date: string } | null;
  prediction: { pmi: number; growthStage: string; sprayTiming: string } | null;
  dss: { alertCount: number; maxSeverity: string; lastAlert: string } | null;
  sensor: { total: number; normal: number; warning: number; error: number } | null;
  spray: { daysRemaining: number; lastSprayDate: string; mrlStatus: string } | null;
  realtime: { connected: boolean; lastReceived: string } | null;
  fertilizer: { complianceRate: number; deficiencies: string[]; growthStage: string; topRecommendation: string; certStatus: string } | null;
}

/**
 * 1. 관개 데이터: DSS dashboard에서 CWSI/VPD 추출
 */
const fetchIrrigation = async (farmId: string) => {
  const data = await dssApi.getDashboard(farmId);
  if (!data) return null;
  return {
    cwsi: data.cwsi ?? data.irrigation?.cwsi ?? 0,
    vpd: data.vpd ?? data.irrigation?.vpd ?? 0,
    stressLevel: data.stress_level ?? data.irrigation?.stress_level ?? 'none',
    shouldIrrigate: data.should_irrigate ?? data.irrigation?.should_irrigate ?? false,
  };
};

/**
 * 2. 진단 데이터: 최근 진단 결과 조회
 */
const fetchDiagnosis = async () => {
  const result = await diagnosisApi.getDiagnoses(1, 1);
  const items = result.results || [];
  if (items.length === 0) {
    return { disease: '정상', confidence: 100, severity: 'none', date: new Date().toISOString() };
  }
  const latest = items[0];
  return {
    disease: latest.disease_name || latest.top_disease || '정상',
    confidence: Math.round((latest.confidence || 0) * 100),
    severity: latest.severity || 'none',
    date: latest.created_at || new Date().toISOString(),
  };
};

/**
 * 3. 병해 예측(PMI): disease_prediction realtime API
 */
const fetchPrediction = async (farmId: string) => {
  const farmIdNum = parseInt(farmId, 10);
  if (isNaN(farmIdNum)) return null;

  const response = await apiClient.get(`/disease/farms/${farmIdNum}/disease/quick/`);
  const data = response.data;
  return {
    pmi: data.pmi ?? data.risk_score ?? 0,
    growthStage: data.growth_stage ?? data.stage_label ?? '확인중',
    sprayTiming: data.spray_timing ?? data.recommendation ?? '',
  };
};

/**
 * 4. DSS 알림 상태: dashboard에서 alert 정보 추출
 */
const fetchDSS = async (farmId: string) => {
  const data = await dssApi.getDashboard(farmId);
  if (!data) return null;
  return {
    alertCount: data.alert_count ?? data.alerts?.length ?? 0,
    maxSeverity: data.max_severity ?? 'normal',
    lastAlert: data.last_alert ?? '',
  };
};

/**
 * 5. 센서 현황: current data에서 상태별 집계
 */
const fetchSensorStatus = async () => {
  const result = await getCurrentData();
  const sensorData = result.data || result;
  const statuses = Object.values(sensorData)
    .filter((v: any) => v && typeof v === 'object' && 'status' in v)
    .map((v: any) => v.status);

  const total = statuses.length || 4;
  const warning = statuses.filter((s: string) => s === 'warning' || s === 'high' || s === 'low').length;
  const error = statuses.filter((s: string) => s === 'error' || s === 'critical').length;
  const normal = total - warning - error;

  return { total, normal, warning, error };
};

/**
 * 6. 살포/농약: spray history에서 안전기간 추출
 */
const fetchSpray = async (farmId: string) => {
  const farmIdNum = parseInt(farmId, 10);
  if (isNaN(farmIdNum)) return null;

  const result = await sprayApi.getSafetyStatus(farmIdNum);
  return result;
};

/**
 * 8. GAP 비료: 추천 + 감사 데이터에서 요약 추출
 */
const fetchFertilizer = async (farmId: string) => {
  const [recResult, auditResult] = await Promise.allSettled([
    gapFertilizerApi.getRecommendations(farmId),
    gapFertilizerApi.getAudit(farmId),
  ]);

  const rec = recResult.status === 'fulfilled' ? recResult.value : null;
  const audit = auditResult.status === 'fulfilled' ? auditResult.value : null;

  const deficiencies: string[] = [];
  if (rec?.nutrient_balance) {
    Object.entries(rec.nutrient_balance).forEach(([key, val]) => {
      if (val.level === 'severe' || val.level === 'moderate') {
        deficiencies.push(key);
      }
    });
  }

  return {
    complianceRate: rec?.gap_compliance_summary?.overall_score ?? audit?.compliance_rate ?? 0,
    deficiencies,
    growthStage: rec?.growth_stage || '',
    topRecommendation: rec?.recommendations?.[0]?.fertilizer_name || '',
    certStatus: audit?.certification_status || 'unknown',
  };
};

/**
 * 7. MQTT 실시간: latest endpoint로 연결 상태 확인
 */
const fetchRealtime = async (farmId: string) => {
  const response = await apiClient.get(`/mqtt/latest/${farmId}/`);
  const data = response.data;

  const lastTimestamp = data.timestamp || data.recorded_at;
  let lastReceived = '';
  if (lastTimestamp) {
    const diffMs = Date.now() - new Date(lastTimestamp).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) lastReceived = '방금 전';
    else if (diffMin < 60) lastReceived = `${diffMin}분 전`;
    else lastReceived = `${Math.floor(diffMin / 60)}시간 전`;
  }

  return {
    connected: data.connected ?? !!lastTimestamp,
    lastReceived: lastReceived || data.last_received || '',
  };
};

export const reportApi = {
  /**
   * 8개 도메인 보고서 요약 데이터를 병렬 조회
   * 개별 API 실패 시 해당 카드만 null (다른 카드는 정상 표시)
   */
  getReportSummary: async (farmId: string): Promise<ReportSummary> => {
    const results = await Promise.allSettled([
      fetchIrrigation(farmId),
      fetchDiagnosis(),
      fetchPrediction(farmId),
      fetchDSS(farmId),
      fetchSensorStatus(),
      fetchSpray(farmId),
      fetchRealtime(farmId),
      fetchFertilizer(farmId),
    ]);

    return {
      irrigation: results[0].status === 'fulfilled' ? results[0].value : null,
      diagnosis: results[1].status === 'fulfilled' ? results[1].value : null,
      prediction: results[2].status === 'fulfilled' ? results[2].value : null,
      dss: results[3].status === 'fulfilled' ? results[3].value : null,
      sensor: results[4].status === 'fulfilled' ? results[4].value : null,
      spray: results[5].status === 'fulfilled' ? results[5].value : null,
      realtime: results[6].status === 'fulfilled' ? results[6].value : null,
      fertilizer: results[7].status === 'fulfilled' ? results[7].value : null,
    };
  },
};
