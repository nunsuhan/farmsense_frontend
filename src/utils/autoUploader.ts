// autoUploader.ts - 자동 업로드 관리
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPendingPhotos,
  saveDiagnosisResult,
  getProcessedPhotos,
  type LocalPhoto
} from './photoStorage';
import { diagnoseDisease } from '../services/api/diagnosis';
import { scheduleLocalNotification } from './pushNotificationHandler';

// 설정 키
const SETTINGS_KEY = 'auto_upload_settings';

export interface AutoUploadSettings {
  enabled: boolean;
  wifiOnly: boolean;
  startTime: number; // 0-23
  endTime: number;   // 0-23
  morningNotification: boolean;
}

const DEFAULT_SETTINGS: AutoUploadSettings = {
  enabled: true,
  wifiOnly: true,
  startTime: 0, // 00:00
  endTime: 5,   // 05:00
  morningNotification: true,
};

/**
 * 설정 가져오기
 */
export const getAutoUploadSettings = async (): Promise<AutoUploadSettings> => {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json ? JSON.parse(json) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * 설정 저장하기
 */
export const saveAutoUploadSettings = async (settings: AutoUploadSettings): Promise<void> => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * WiFi 연결 여부 확인
 */
export const isWiFiConnected = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.type === 'wifi' && state.isConnected === true;
  } catch (error) {
    console.error('❌ [네트워크] 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 시간대 확인
 */
export const isUploadTime = (start: number, end: number): boolean => {
  const currentHour = new Date().getHours();
  // start <= current < end (일반적)
  // start > end (ex: 22:00 ~ 05:00) -> current >= start OR current < end
  if (start <= end) {
    return currentHour >= start && currentHour < end;
  } else {
    return currentHour >= start || currentHour < end;
  }
};

/**
 * 단일 사진 처리 (진단 및 업로드)
 */
const processPhoto = async (photo: LocalPhoto): Promise<boolean> => {
  try {
    console.log('💊 [AI 진단] 시작:', photo.id);

    // AI 진단 요청
    const result = await diagnoseDisease(photo.uri);

    // 결과 저장 (로컬)
    await saveDiagnosisResult(photo.id, result);

    console.log('✅ [AI 진단] 완료:', result.disease_name);
    return true;
  } catch (error) {
    console.error('❌ [AI 진단] 실패:', photo.id, error);
    return false;
  }
};

/**
 * 알림 발송 로직 (아침 리포트)
 */
const sendMorningReport = async () => {
  try {
    const settings = await getAutoUploadSettings();
    if (!settings.morningNotification) return;

    // 오늘 새벽에 처리된 결과 조회
    const photos = await getProcessedPhotos(new Date());
    if (photos.length === 0) return;

    const total = photos.length;
    const issues = photos.filter(p => p.diagnosisResult && p.diagnosisResult.disease_name !== '정상').length;

    let title = '☀️ 좋은 아침입니다!';
    let body = `어젯밤 ${total}장의 사진을 분석했어요.`;

    if (issues > 0) {
      body += `\n⚠️ 병해 의심 ${issues}건이 발견되었습니다. 확인해보세요.`;
    } else {
      body += `\n모두 건강해 보입니다! 🌿`;
    }

    await scheduleLocalNotification(title, body, { type: 'morning_report' });
  } catch (e) {
    console.error('Report Error', e);
  }
}

/**
 * 자동 업로드 메인 로직
 * - BackgroundFetch에 의해 주기적으로 호출됨 (최소 15분)
 */
export const checkAndAutoUpload = async (): Promise<{ success: number; failed: number }> => {
  try {
    const settings = await getAutoUploadSettings();
    if (!settings.enabled) {
      console.log('⏸️ [자동 업로드] 비활성화됨');
      return { success: 0, failed: 0 };
    }

    // 1. WiFi 체크
    if (settings.wifiOnly) {
      const isWiFi = await isWiFiConnected();
      if (!isWiFi) {
        console.log('⚠️ [자동 업로드] WiFi 아님, 스킵');
        return { success: 0, failed: 0 };
      }
    }

    // 2. 시간 체크
    if (!isUploadTime(settings.startTime, settings.endTime)) {
      console.log('🕒 [자동 업로드] 설정된 시간이 아님');
      return { success: 0, failed: 0 };
    }

    // 3. 대기열 가져오기
    const pending = await getPendingPhotos();
    if (pending.length === 0) {
      console.log('ℹ️ [자동 업로드] 대기 중인 사진 없음');
      return { success: 0, failed: 0 };
    }

    console.log(`🚀 [자동 업로드] ${pending.length}장 처리 시작`);
    let success = 0;
    let failed = 0;

    for (const photo of pending) {
      const result = await processPhoto(photo);
      if (result) success++;
      else failed++;

      // 부하 조절
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    }

    // 4. 아침 시간대라면 알림 즉시 발송 체크
    if (success > 0) {
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour <= 9) {
        await sendMorningReport();
      }
    }

    return { success, failed };

  } catch (error) {
    console.error('❌ [자동 업로드] 전체 프로세스 에러:', error);
    return { success: 0, failed: 0 };
  }
};
