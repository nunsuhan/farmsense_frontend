// NotificationBadge.tsx - 알림 아이콘 + 안 읽은 알림 개수 뱃지
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as notificationApi from '../../services/notificationApi';

interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ size = 'medium' }) => {
  const navigation = useNavigation<any>();
  const [unreadCount, setUnreadCount] = useState(0);

  // 크기별 설정
  const sizeConfig = {
    small: { iconSize: 20, containerSize: 32, badgeSize: 16 },
    medium: { iconSize: 24, containerSize: 40, badgeSize: 18 },
    large: { iconSize: 28, containerSize: 44, badgeSize: 20 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    loadUnreadCount();

    // 주기적으로 업데이트 (60초마다 - 부하 감소)
    const interval = setInterval(loadUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  // 안 읽은 알림 개수 로드 (에러 무시)
  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      // 에러 발생 시 조용히 무시 (사용자에게 표시하지 않음)
      // console.log('알림 개수 로드 실패 (무시됨)');
      setUnreadCount(0);
    }
  };

  const handlePress = () => {
    navigation.navigate('NotificationList');
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: config.containerSize, height: config.containerSize }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="notifications-outline" size={config.iconSize} color="#FFF" />
      {unreadCount > 0 && (
        <View style={[styles.badge, {
          minWidth: config.badgeSize,
          height: config.badgeSize,
          borderRadius: config.badgeSize / 2,
        }]}>
          <Text style={[styles.badgeText, { fontSize: size === 'small' ? 9 : 10 }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#1B5E20',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
