// DrawerMenu - 햄버거 메뉴 (Drawer) - Updated Flat Structure
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser, useSetUser } from '../../store/useStore';
import { authApi } from '../../services/authApi';

const DrawerMenu: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const user = useUser();
  const setUser = useSetUser();

  // 메뉴 항목 타입
  interface MenuItem {
    id: string;
    label: string;
    icon: string;
    screen: string;
    description?: string; // Optional description
  }

  // 메뉴 아이템 클릭 핸들러
  const handleMenuPress = (item: MenuItem) => {
    navigation.closeDrawer();

    // 탭 네비게이션 처리
    if (item.screen === 'FarmingLog') {
      navigation.navigate('MainTab', { screen: 'FarmingLog' });
    } else if (item.screen === 'Community') {
      navigation.navigate('MainTab', { screen: 'Community' });
    } else if (item.screen === 'Home') {
      navigation.navigate('MainTab', { screen: 'HomeTab' });
    } else {
      // 일반 스택 네비게이션
      navigation.navigate(item.screen as never);
    }
  };

  // 요청된 메뉴 구조 (8개 항목)
  const menuItems: MenuItem[] = [
    { id: 'diagnosis', label: '병해진단', icon: 'camera-outline', screen: 'SmartLens' },
    { id: 'ai_consult', label: 'AI 상담', icon: 'chatbubbles-outline', screen: 'QnAScreen' },
    { id: 'farming_log', label: '영농일지', icon: 'calendar-outline', screen: 'FarmingLog' },
    { id: 'community', label: '커뮤니티', icon: 'people-outline', screen: 'Community' },
    { id: 'daily_report', label: '일일보고서', icon: 'document-text-outline', screen: 'DailyPrescription' },
    { id: 'todo', label: '오늘의 할일', icon: 'checkbox-outline', screen: 'DailyPrescription' }, // Same screen for now
    { id: 'sensor', label: '센서데이터', icon: 'hardware-chip-outline', screen: 'SensorManage' },
    { id: 'settings', label: '설정', icon: 'settings-outline', screen: 'Settings' },
  ];

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말로 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout();
            setUser(null);
            navigation.closeDrawer();
            // App state change will handle navigation to login
          } catch (error) {
            console.error('로그아웃 실패:', error);
            Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon as any} size={24} color="#374151" style={styles.menuIcon} />
        <Text style={styles.menuLabel}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 영역 */}
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person" size={36} color="white" />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{user?.name || (user as any)?.username || user?.email?.split('@')[0] || '게스트'}</Text>
            {user?.email && (
              <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* 메뉴 리스트 */}
        <View style={styles.menuSection}>
          {menuItems.map(item => renderMenuItem(item))}
        </View>

        <View style={styles.divider} />

        {/* 하단 로그아웃 */}
        {user && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#DC2626" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        )}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>포도박사 v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    padding: 24,
    backgroundColor: '#1B5E20', // Main Dark Green
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuLabel: {
    fontSize: 16,
    color: '#374151', // Gray 700
    fontWeight: 'medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 24,
    paddingVertical: 12,
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default DrawerMenu;
