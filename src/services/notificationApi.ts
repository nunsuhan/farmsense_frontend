// notificationApi.ts - 알림 API 호출
import api from './api';

export interface NotificationSettings {
  is_enabled: boolean;
  sensor_alert: boolean;
  disease_alert: boolean;
  community_alert: boolean;
  weather_alert: boolean;
  temp_min: number;
  temp_max: number;
  humidity_min: number;
  humidity_max: number;
  soil_moisture_min: number;
  soil_moisture_max: number;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  data: any;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

// 알림 설정 조회
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await api.get('/notification/settings/');
  return response.data.data;
};

// 알림 설정 저장
export const saveNotificationSettings = async (settings: NotificationSettings) => {
  const response = await api.put('/notification/settings/', settings);
  return response.data;
};

// 테스트 알림 발송
export const sendTestNotification = async () => {
  const response = await api.post('/notification/test/');
  return response.data;
};

// 알림 목록 조회
// Changed signature to support object destructuring as used in screen
export const getNotifications = async (params: { limit?: number, offset?: number } = {}) => {
  const { limit = 20, offset = 0 } = params;
  const url = `/notifications/?limit=${limit}&offset=${offset}`;
  const response = await api.get(url);
  return response.data;
};

// 안 읽은 알림 개수 조회
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread_count/');
  return response.data.ungread_count || response.data.unread_count || 0; // Backend might accept distinct casing
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number) => {
  const response = await api.post(`/notifications/${notificationId}/mark_read/`);
  return response.data;
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/read_all/');
  return response.data;
};

// 알림 삭제
export const deleteNotification = async (notificationId: number) => {
  // Assuming standard REST delete on the detail endpoint if available, but user manual didn't specify.
  // Keeping as is or assuming consistent plural path.
  const response = await api.delete(`/notifications/${notificationId}/`);
  return response.data;
};

// 푸시 토큰 등록
export const registerPushToken = async (expoPushToken: string) => {
  const response = await api.post('/notification/register-token/', {
    expo_push_token: expoPushToken,
  });
  return response.data;
};


// Helpers
export const getNotificationColor = (priority: string) => {
  switch (priority) {
    case 'HIGH': return '#EF4444'; // Red
    case 'MEDIUM': return '#F59E0B'; // Amber
    case 'LOW': return '#10B981'; // Green
    default: return '#9CA3AF'; // Gray
  }
};

export const getNotificationEmoji = (priority: string) => {
  switch (priority) {
    case 'HIGH': return '🚨';
    case 'MEDIUM': return '⚠️';
    case 'LOW': return 'ℹ️';
    default: return '📢';
  }
};

export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}일 전`;
  if (diffHour > 0) return `${diffHour}시간 전`;
  if (diffMin > 0) return `${diffMin}분 전`;
  return '방금 전';
};
