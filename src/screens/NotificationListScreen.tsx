/**
 * 알림 목록 화면
 * - 알림 히스토리 표시
 * - 읽음/안읽음 상태 관리
 * - 알림 삭제 기능
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  NotificationItem,
  getNotificationColor,
  getNotificationEmoji,
  getRelativeTime,
} from '../services/notificationApi';

export default function NotificationListScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // 알림 목록 로드
  const loadNotifications = useCallback(async (reload = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentOffset = reload ? 0 : offset;
      console.log('🔔 [알림] API 호출 시작:', { limit: 20, offset: currentOffset });

      const response = await getNotifications({
        limit: 20,
        offset: currentOffset,
      });

      console.log('🔔 [알림] API 응답:', response);
      console.log('🔔 [알림] response.data:', response.data);
      console.log('🔔 [알림] response.data.data:', response.data?.data);

      const notificationData = response.data?.data || response.data;

      // Support both 'notifications' (custom) and 'results' (DRF standard) keys
      const notifications = notificationData?.notifications || notificationData?.results || [];
      const unreadCount = notificationData?.unread_count || 0;

      // Determine hasMore based on 'has_more' flag or 'next' url (DRF)
      let hasMore = false;
      if (notificationData?.has_more !== undefined) {
        hasMore = notificationData.has_more;
      } else if (notificationData?.next) {
        hasMore = true;
      } else if (notificationData?.count) {
        // Fallback calculation if count is present but next is not reliable (rare)
        hasMore = (currentOffset + 20) < notificationData.count;
      }

      if (reload) {
        setNotifications(notifications);
        setOffset(20);
      } else {
        setNotifications(prev => [...prev, ...notifications]);
        setOffset(currentOffset + 20);
      }

      setUnreadCount(unreadCount);
      setHasMore(hasMore);

      console.log('✅ [알림] 로드 성공:', { count: notifications.length, unreadCount, hasMore });
    } catch (error: any) {
      console.error('❌ [알림] 로드 실패:', error);
      // Only show alert on initial load or non-background refresh to avoid spam
      if (!loading && !refreshing) {
        // Optional: silience error for background updates
      }
      // console.error('❌ [알림] 에러 상세:', error.response?.data);
      // Alert.alert('오류', `알림 목록을 불러오는데 실패했습니다.\n${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [loading, offset]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications(true);
    setRefreshing(false);
  }, [loadNotifications]);

  // 초기 로드
  useEffect(() => {
    loadNotifications(true);
  }, []);

  // 알림 읽음 처리
  const handleNotificationPress = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);

        // 로컬 상태 업데이트
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }

    // 알림 상세 정보 표시
    Alert.alert(
      notification.title,
      notification.body,
      [
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => handleDeleteNotification(notification.id),
        },
        { text: '확인' },
      ]
    );
  };

  // 알림 삭제
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      Alert.alert('성공', '알림이 삭제되었습니다.');
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      Alert.alert('오류', '알림 삭제에 실패했습니다.');
    }
  };

  // 모두 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      const count = await markAllNotificationsAsRead();

      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      Alert.alert('성공', `${count}개의 알림을 읽음 처리했습니다.`);
    } catch (error) {
      console.error('모두 읽음 처리 실패:', error);
      Alert.alert('오류', '읽음 처리에 실패했습니다.');
    }
  };

  // 알림 아이템 렌더링
  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const priorityColor = getNotificationColor(item.priority);
    const emoji = getNotificationEmoji(item.priority);
    const relativeTime = getRelativeTime(item.created_at);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.is_read && styles.unreadItem,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleRow}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text
              style={[
                styles.notificationTitle,
                !item.is_read && styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>

        <View style={styles.notificationFooter}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColor },
            ]}
          >
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
          <Text style={styles.timeText}>{relativeTime}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 빈 화면
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔔</Text>
      <Text style={styles.emptyText}>알림이 없습니다</Text>
      <Text style={styles.emptySubText}>
        새로운 알림이 도착하면 여기에 표시됩니다
      </Text>
    </View>
  );

  // 헤더
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>알림</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllButtonText}>모두 읽음</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyListContainer : undefined
        }
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadNotifications();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  unreadText: {
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  notificationBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

