// SimpleMenu - 상단 헤더와 일체감 있는 사이드 메뉴
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useSetUser } from '../../store/useStore';
import { authApi } from '../../services/authApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75; // 75% 너비

interface SimpleMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: string;
  screen: string;
  params?: Record<string, any>; // 화면 파라미터
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  screen?: string;
  subItems?: SubMenuItem[];
}

const SimpleMenu: React.FC<SimpleMenuProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<any>();
  const user = useUser();
  const setUser = useSetUser();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // 메뉴 구조 정의
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: '홈',
      icon: 'home-outline',
      screen: 'Main'
    },
    {
      id: 'ai-service',
      label: 'AI 서비스',
      icon: 'bulb-outline',
      subItems: [
        { id: 'qna', label: 'AI 상담 (Q&A)', icon: 'chatbubbles-outline', screen: 'QnA' },
        { id: 'diagnosis', label: '병해 진단', icon: 'search-outline', screen: 'Diagnosis' },
        { id: 'prescription', label: '일일 처방전', icon: 'medical-outline', screen: 'DailyPrescription' },
        { id: 'reverse', label: '역분석', icon: 'analytics-outline', screen: 'ReverseAnalysis' },
      ]
    },
    {
      id: 'field',
      label: '필드 관리',
      icon: 'map-outline',
      subItems: [
        { id: 'farmmap', label: '팜맵 (주변 농장)', icon: 'map-outline', screen: 'FarmMap' },
        { id: 'farmmap-advanced', label: '인공위성 지도', icon: 'satellite-outline', screen: 'FarmMapAdvanced' },
      ]
    },
    {
      id: 'records',
      label: '영농 기록',
      icon: 'document-text-outline',
      subItems: [
        { id: 'growthdiary', label: '성장 일지', icon: 'calendar-outline', screen: 'GrowthDiary' },
        { id: 'pesticide-mgmt', label: '농약 안전 관리', icon: 'shield-checkmark-outline', screen: 'PesticideManagement' },
      ]
    },
    {
      id: 'community',
      label: '커뮤니티',
      icon: 'people-outline',
      subItems: [
        { id: 'community-free', label: '자유', icon: 'chatbox-outline', screen: 'Community', params: { category: 'free' } },
        { id: 'community-show', label: '자랑', icon: 'trophy-outline', screen: 'Community', params: { category: 'show' } },
        { id: 'community-question', label: '질문', icon: 'help-circle-outline', screen: 'Community', params: { category: 'question' } },
        { id: 'community-tip', label: '팁', icon: 'bulb-outline', screen: 'Community', params: { category: 'tip' } },
        { id: 'community-market', label: '장터', icon: 'cart-outline', screen: 'Community', params: { category: 'market' } },
      ]
    },
    {
      id: 'settings',
      label: '설정',
      icon: 'settings-outline',
      subItems: [
        { id: 'farm-info', label: '농장 기본 정보', icon: 'home-outline', screen: 'FarmBasicInfo' },
        { id: 'facility', label: '시설 정보', icon: 'business-outline', screen: 'FacilityInfo' },
        { id: 'sensor', label: '센서 등록', icon: 'wifi-outline', screen: 'SensorRegistration' },
        { id: 'account', label: '계정 설정', icon: 'person-outline', screen: 'AccountSettings' },
        { id: 'notification-settings', label: '알림 설정', icon: 'notifications-outline', screen: 'NotificationSettings' },
        { id: 'terms', label: '약관 및 정책', icon: 'document-outline', screen: 'Terms' },
      ]
    },
    {
      id: 'notifications',
      label: '알림',
      icon: 'notifications-outline',
      screen: 'NotificationList'
    },
    {
      id: 'profile',
      label: '프로필',
      icon: 'person-circle-outline',
      screen: 'Profile'
    },
  ];

  // 메뉴 펼치기/접기 토글 (다른 메뉴 자동 접기)
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      // 이미 열려있으면 닫기
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      }
      // 새로운 메뉴 열 때 다른 메뉴는 모두 닫기
      return [menuId];
    });
  };

  // 메뉴 선택 처리
  const handleMenuPress = (item: MenuItem) => {
    // 하위 메뉴가 있으면 토글
    if (item.subItems && item.subItems.length > 0) {
      toggleMenu(item.id);
      return;
    }

    // 하위 메뉴가 없으면 화면 이동
    if (item.screen) {
      onClose();
      setTimeout(() => {
        navigation.navigate(item.screen);
      }, 300);
    }
  };

  // 하위 메뉴 선택 처리
  const handleSubMenuPress = (subItem: SubMenuItem) => {
    onClose();
    setTimeout(() => {
      if (subItem.params) {
        navigation.navigate(subItem.screen, subItem.params);
      } else {
        navigation.navigate(subItem.screen);
      }
    }, 300);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      onClose();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 좌측 75% 영역 - 메뉴 */}
        <View style={styles.menuContainer}>
          {/* 상단 헤더 (상단 햄버거 메뉴와 같은 스타일) */}
          <View style={styles.menuHeader}>
            <View style={styles.headerContent}>
              <Ionicons name="menu" size={28} color="#FFFFFF" />
              <Text style={styles.headerTitle}>포도박사</Text>
            </View>
          </View>

          {/* 메뉴 리스트 */}
          <ScrollView
            style={styles.menuList}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item) => {
              const isExpanded = expandedMenus.includes(item.id);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <View key={item.id}>
                  {/* 대메뉴 */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      hasSubItems && isExpanded && styles.menuItemExpanded
                    ]}
                    onPress={() => handleMenuPress(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={hasSubItems && isExpanded ? "#10B981" : "#374151"}
                    />
                    <Text style={[
                      styles.menuLabel,
                      hasSubItems && isExpanded && styles.menuLabelExpanded
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>

                  {/* 하위 메뉴 (드롭다운) */}
                  {hasSubItems && isExpanded && (
                    <View style={styles.subMenuContainer}>
                      {item.subItems!.map((subItem) => (
                        <TouchableOpacity
                          key={subItem.id}
                          style={styles.subMenuItem}
                          onPress={() => handleSubMenuPress(subItem)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subMenuConnector} />
                          <Ionicons
                            name={subItem.icon as any}
                            size={20}
                            color="#6B7280"
                          />
                          <Text style={styles.subMenuLabel}>{subItem.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 우측 25% 영역 - 터치 시 메뉴 닫기 */}
        <TouchableOpacity
          style={styles.rightArea}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // 메뉴 컨테이너 (좌측 75%)
  menuContainer: {
    width: MENU_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  // 상단 헤더 (상단 햄버거 메뉴와 동일한 스타일)
  menuHeader: {
    backgroundColor: '#1B5E20', // 상단 헤더와 같은 진한 초록색
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // 우측 25% 영역
  rightArea: {
    flex: 1,
  },
  menuList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // 대메뉴 스타일
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  menuItemExpanded: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  menuLabelExpanded: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  // 하위 메뉴 컨테이너
  subMenuContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
  },
  // 하위 메뉴 아이템
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingLeft: 56,
    gap: 12,
  },
  subMenuConnector: {
    width: 2,
    height: '100%',
    backgroundColor: '#10B981',
    position: 'absolute',
    left: 28,
  },
  subMenuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default SimpleMenu;
