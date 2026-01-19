// NotificationsScreen.tsx - 알림 목록 화면
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as notificationApi from '../services/notificationApi';
import ScreenWrapper from '../components/common/ScreenWrapper';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsScreen = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  // 알림 로드
  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      // Support both DRF 'results' and custom 'notifications'
      const list = data.results || data.notifications || [];

      // API 응답 구조에 맞게 매핑
      const mappedNotifications = list.map((notif: any) => ({
        id: notif.id,
        title: notif.title,
        message: notif.body,
        type: notif.type,
        is_read: notif.is_read,
        created_at: notif.created_at,
      }));

      setNotifications(mappedNotifications);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.log('알림 로드 실패:', error); // console.error triggers LogBox
      // Alert.alert('오류', '알림 목록을 불러오는데 실패했습니다.'); // Optional: Remove Alert if user finds it annoying too
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, []);

  // 알림 읽음 처리
  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markNotificationAsRead(id);

      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  // 전체 읽음 처리
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllNotificationsAsRead();

      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      Alert.alert('완료', '모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      console.error('전체 읽음 실패:', error);
      Alert.alert('오류', '처리에 실패했습니다.');
    }
  };

  // 알림 타입별 아이콘
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SENSOR_ALERT':
        return { name: 'warning', color: '#ff4444' };
      case 'DISEASE_RISK':
        return { name: 'bug', color: '#FF9800' };
      case 'COMMUNITY':
        return { name: 'chatbubbles', color: '#10B981' };
      case 'WEATHER_ALERT':
        return { name: 'rainy', color: '#2196F3' };
      default:
        return { name: 'notifications', color: '#666' };
    }
  };

  // 시간 포맷
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // 알림 카드 렌더링
  const renderNotification = ({ item }: { item: Notification }) => {
    const typeIcon = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.is_read && styles.notificationCardUnread]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons name={typeIcon.name as any} size={24} color={typeIcon.color} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!item.is_read && <View style={styles.unreadBadge} />}
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <ScreenWrapper title="알림" showBack>
      {/* 헤더는 ScreenWrapper에 포함됨 */}


      {/* 읽지 않은 알림 안내 */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>읽지 않은 알림 {unreadCount}개</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllButton}>전체 읽음</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 알림 목록 */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyText}>알림이 없습니다</Text>
            <Text style={styles.emptySubText}>알림이 오면 여기에 표시됩니다</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  unreadBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  markAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textDecorationLine: 'underline',
  },
  listContent: {
    padding: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default NotificationsScreen;

