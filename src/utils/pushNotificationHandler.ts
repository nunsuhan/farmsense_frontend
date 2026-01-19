/**
 * 푸시 알림 핸들러 (Refactored for Expo)
 * - Firebase & Notifee 의존성 제거 (Migration 중 비활성화)
 * - ExpoDevice 로 대체
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
// import api from '../services/api'; // 백엔드 연동 필요한 경우 주석 해제

// 초기 설정
export const configurePushNotifications = async () => {
  console.log('[알림] Expo Migration: 푸시 알림 구성이 일시적으로 비활성화되었습니다.');
};

/**
 * 푸시 알림 권한 요청 및 토큰 등록
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const isDevice = Device.isDevice;

  if (!isDevice) {
    console.warn('[알림] 시뮬레이터에서는 푸시 알림이 제한될 수 있습니다.');
  }

  console.log('[알림] Expo Migration: 푸시 토큰 등록이 스텁 처리되었습니다.');
  return null;
}

/**
 * 백엔드에 푸시 토큰 등록
 */
export async function registerTokenToBackend(
  pushToken: string,
  farmId: number
): Promise<boolean> {
  console.log('[알림] 백엔드 등록 시도 (Token):', pushToken);
  // Stub
  return true;
}

/**
 * 앱 초기화 시 푸시 알림 설정
 */
export async function initializePushNotifications(farmId: number): Promise<void> {
  try {
    await configurePushNotifications();
    console.log('[알림] 초기화 완료 (Stub)');
  } catch (error) {
    console.error('[알림] 푸시 알림 초기화 실패:', error);
  }
}

// 리스너 관련 함수들 (기존 호환성 유지를 위해 빈 함수 혹은 래퍼 제공)
export function addNotificationReceivedListener(callback: (notification: any) => void): any {
  return { remove: () => { } };
}

export function addNotificationResponseListener(callback: (response: any) => void): any {
  return { remove: () => { } };
}

/**
 * 앱 아이콘 배지 숫자 설정
 */
export async function setBadgeCount(count: number): Promise<void> {
  // Expo Notifications 배지 API 사용 가능하지만, 현재는 스텁
  console.log('[알림] 배지 설정:', count);
}

/**
 * 앱 아이콘 배지 숫자 가져오기
 */
export async function getBadgeCount(): Promise<number> {
  return 0;
}

/**
 * 앱 아이콘 배지 숫자 초기화
 */
export async function clearBadge(): Promise<void> {
  console.log('[알림] 배지 초기화');
}

/**
 * 로컬 알림 예약/발송
 */
export async function scheduleLocalNotification(title: string, body: string, data: any = {}): Promise<void> {
  console.log('[알림] 로컬 알림 스텁:', title, body);
}










