// Header - 통일된 헤더 (안드로이드 상태바 처리 개선)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../../store/useStore';
import NotificationBadge from '../notification/NotificationBadge';

interface HeaderProps {
  title?: string;
  isHome?: boolean;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  isHome = false,
  onMenuPress,
  onProfilePress,
  onBackPress,
  showBackButton = true,
  rightAction,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const isLoggedIn = !!user;
  const userName = user?.name || user?.email?.split('@')[0] || '농장주';

  // 안드로이드 상태바 높이
  const statusBarHeight = Platform.OS === 'android'
    ? StatusBar.currentHeight || 24
    : insets.top;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      navigation.navigate('Profile');
    }
  };

  // ====== 홈 헤더 ======
  if (isHome) {
    return (
      <View style={[styles.container, { paddingTop: statusBarHeight + 8 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1B5E20" translucent />

        {/* 왼쪽: 햄버거 메뉴 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={26} color="white" />
        </TouchableOpacity>

        {/* 중앙: 로고 + 앱 이름 */}
        <View style={styles.centerContainer}>
          <Text style={styles.logoEmoji}>🍇</Text>
          <Text style={styles.appTitle}>포도박사</Text>
        </View>

        {/* 오른쪽: 알림 + 프로필 */}
        <View style={styles.rightContainer}>
          {isLoggedIn && <NotificationBadge size="small" />}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <Text style={styles.profileText}>
              {isLoggedIn ? `${userName}님` : '로그인'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ====== 일반 페이지 헤더 ======
  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 8 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" translucent />

      {/* 왼쪽: 뒤로가기 */}
      {showBackButton ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      {/* 중앙: 페이지 제목 */}
      <View style={styles.centerContainer}>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {title || ''}
        </Text>
      </View>

      {/* 오른쪽: 액션 버튼 */}
      <View style={styles.iconButton}>
        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },

  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoEmoji: {
    fontSize: 26,
    marginRight: 6,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  pageTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  profileText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Header;
