import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useStore } from '../../store/useStore'; // 전역 스토어 사용

const SettingsMainScreen = () => {
  const navigation = useNavigation();
  const logout = useStore((state) => state.setUser); // 로그아웃 시 user null 처리

  const settingsMenu = [
    {
      id: 0,
      title: '계정 정보',
      subtitle: '기본 정보, 비밀번호, 알림 설정',
      icon: 'person-circle',
      iconColor: '#8B5CF6',
      screen: 'AccountSettings',
    },
    {
      id: 1,
      title: '농장 기본정보',
      subtitle: '농장명, 주소, 품종, 생육일정, 시설 관리',
      icon: 'leaf',
      iconColor: '#10B981',
      screen: 'FarmBasicInfo',
    },
    {
      id: 3,
      title: '구역 관리',
      subtitle: '농장 구역(Sector) 추가 및 수정',
      icon: 'map',
      iconColor: '#8B5CF6',
      screen: 'SectorManage', // New screen
    },
    {
      id: 4,
      title: '센서 관리',
      subtitle: 'IoT 센서 등록 및 상태',
      icon: 'hardware-chip',
      iconColor: '#6366F1',
      screen: 'SensorManage', // New screen
    },
    {
      id: 5,
      title: '알림 설정',
      subtitle: '병해충 경보, 작업 알림 시간',
      icon: 'notifications',
      iconColor: '#F59E0B',
      screen: 'Notification', // Changed to new screen
    },
    {
      id: 6,
      title: '도움말',
      subtitle: '자주 묻는 질문, 사용 가이드',
      icon: 'help-circle',
      iconColor: '#EC4899',
      screen: 'Help', // Maps to HelpScreen
    },
    {
      id: 7,
      title: '오류 신고',
      subtitle: '앱 오류 및 불편 사항 접수',
      icon: 'bug', // or 'warning-outline'
      iconColor: '#EF4444', // Red color for error reporting
      screen: 'Support', // Maps to SupportScreen
    },
  ];

  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // @ts-ignore
              await logout(null);
            } catch (e) {
              console.error('Logout failed in store:', e);
              // Force update via store directly if needed or just alert
              // ignoring error as user wants to exit
            }
            // AppNavigator에서 자동으로 로그인 화면으로 전환됨
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper title="설정" showBack={false} showMenu={true}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>FarmSense 환경설정</Text>
          <Text style={styles.headerSubtitle}>농장 환경을 설정하면 AI 분석이 정확해집니다.</Text>
        </View>

        {/* 설정 메뉴 카드 */}
        {settingsMenu.map((menu) => (
          <TouchableOpacity
            key={menu.id}
            style={styles.menuCard}
            onPress={() => handleMenuPress(menu.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${menu.iconColor}15` }]}>
              <Ionicons name={menu.icon as any} size={28} color={menu.iconColor} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{menu.title}</Text>
              <Text style={styles.menuSubtitle}>{menu.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* 앱 정보 (Clickable) */}
        <TouchableOpacity
          style={styles.appInfoContainer}
          onPress={() => navigation.navigate('AppInfo' as never)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.appInfoTitle, { marginBottom: 0 }]}>📱 앱 정보</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>

          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>버전</Text>
            <Text style={styles.appInfoValue}>1.0.0 (Beta)</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>개발자</Text>
            <Text style={styles.appInfoValue}>FarmSense Team</Text>
          </View>
        </TouchableOpacity>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  appInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
});

export default SettingsMainScreen;
