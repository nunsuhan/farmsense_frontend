/**
 * v4.2 HomeScreen - 메인페이지1.jpg 디자인 정밀 재현
 * 나노바나나(Gemini) 생성 아이콘 적용
 * 틸 그라데이션 헤더 + 날짜/날씨 바 + 2x2 대형카드(가로배치) + 3x2 소형카드(세로배치)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useStore } from '../../store/useStore';
import { darkColors, colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');
const GRID_PADDING = 14;
const GRID_GAP = 10;
const LARGE_CARD_W = (width - GRID_PADDING * 2 - GRID_GAP) / 2;
const SMALL_CARD_W = (width - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

// ── 화면 크기 기반 반응형 레이아웃 계산 ──
// 폰 종류별 화면 높이: A24=734dp, S24=839dp, iPhone15=852dp, SE=667dp
const STATUS_BAR_H = Platform.OS === 'android' ? 24 : 44;
const TAB_BAR_H = 20; // 홈 화면 하단 여백
const USABLE_H = height - STATUS_BAR_H - TAB_BAR_H; // 사용 가능 영역

// 고정 요소 높이
const DATE_BAR_H = 42;
const BOTTOM_PAD = 8;
const CARD_GAPS = GRID_GAP * 2 + 6 + 10; // largeGrid paddingTop(6) + smallGrid marginTop(10) + 2*gap(10)

// 카드에 할당할 높이 (4행 합계)
const CARD_TOTAL = USABLE_H * 0.66; // 사용 가능 영역의 66%를 카드에 (헤더 공간 확보)
const LARGE_CARD_H = Math.round(CARD_TOTAL * 0.48 / 2); // 대형 2행 = 48%
const SMALL_CARD_H = Math.round(CARD_TOTAL * 0.52 / 2); // 소형 2행 = 52%

// 헤더에 할당할 높이 = 나머지 전부 (빈 공간 없이)
const HEADER_TOTAL = USABLE_H - DATE_BAR_H - CARD_TOTAL - CARD_GAPS - BOTTOM_PAD;
const HEADER_PADDING_BOTTOM = Math.max(20, Math.round(HEADER_TOTAL * 0.50));
const HEADER_TOP_PADDING = Math.max(8, Math.round(HEADER_TOTAL * 0.35));

// ── Asset References ──
const HEADER_BG = require('../../../assets/header_gradient_bg.jpg');
const LOGO_ICON = require('../../../assets/logo_circular_icon.jpg');
const MAIN_BG = require('../../../assets/main_background_cream.jpg');

// ── 나노바나나 생성 메뉴 아이콘 ──
const MENU_ICONS = {
  farmStatus: require('../../../assets/menu-icons/farm_status.png'),
  sensorData: require('../../../assets/menu-icons/sensor_data.png'),
  diagnosis: require('../../../assets/menu-icons/disease_diagnosis.png'),
  consult: require('../../../assets/menu-icons/ai_consult.png'),
  log: require('../../../assets/menu-icons/farm_diary.png'),
  community: require('../../../assets/menu-icons/community.png'),
  farm: require('../../../assets/menu-icons/farm_settings.png'),
  sensor: require('../../../assets/menu-icons/sensor_manage.png'),
  help: require('../../../assets/menu-icons/help.png'),
  notify: require('../../../assets/menu-icons/notifications.png'),
};

// ── Menu Data Types ──
interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  cardBg: string;
  darkCardBg: string;
  action: () => void;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useStore((s) => s.isDarkMode);
  const sensorData = useStore((s) => s.sensorData);
  const c = isDarkMode ? darkColors : colors;

  // 다른 탭의 특정 화면으로 이동 (스택 리셋 포함)
  const navigateToTab = (tabName: string, screenName: string) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: tabName,
        params: {
          screen: screenName,
          initial: false,
        },
      })
    );
  };

  // 날짜
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    setDateStr(
      `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} (${days[now.getDay()]})`
    );
  }, []);

  // 온도 (센서 데이터에서 가져오기)
  const currentTemp = sensorData?.temperature?.value ?? '--';

  // ── 상단 2x2 대형 메뉴 ──
  const LARGE_MENUS: MenuItem[] = [
    {
      id: 'farmStatus',
      title: '오늘\n농장 상태',
      subtitle: '오늘 농장 상태',
      icon: MENU_ICONS.farmStatus,
      cardBg: '#DDE8D0',
      darkCardBg: '#2A3A2E',
      action: () => navigation.navigate('HomeTab', { screen: 'TodayReport' }),
    },
    {
      id: 'sensorData',
      title: '센서 데이터\n보기',
      subtitle: '센서 데이터 보기',
      icon: MENU_ICONS.sensorData,
      cardBg: '#C8E8E0',
      darkCardBg: '#1E3A3A',
      action: () => navigateToTab('MyFarmTab', 'SensorDashboard'),
    },
    {
      id: 'diagnosis',
      title: '병해 진단',
      subtitle: '병해 진단 정정',
      icon: MENU_ICONS.diagnosis,
      cardBg: '#DDE8D0',
      darkCardBg: '#2A3A2E',
      action: () => navigation.navigate('DiagnosisTab'),
    },
    {
      id: 'consult',
      title: 'AI 상담',
      subtitle: 'AI 상담의 상담',
      icon: MENU_ICONS.consult,
      cardBg: '#C8E8E0',
      darkCardBg: '#1E3A3A',
      action: () => navigation.navigate('ConsultTab'),
    },
  ];

  // ── 하단 3x2 소형 메뉴 ──
  const SMALL_MENUS: MenuItem[] = [
    {
      id: 'log',
      title: '영농일지',
      subtitle: '영농일지 보기',
      icon: MENU_ICONS.log,
      cardBg: '#C8DDE8',
      darkCardBg: '#1E3A3A',
      action: () => navigation.navigate('LogTab'),
    },
    {
      id: 'community',
      title: '커뮤니티',
      subtitle: '서포한 커뮤니티',
      icon: MENU_ICONS.community,
      cardBg: '#DDE8D0',
      darkCardBg: '#2A3A2E',
      action: () => navigateToTab('MoreTab', 'Community'),
    },
    {
      id: 'farm',
      title: '농장설정',
      subtitle: '농장설정 상정',
      icon: MENU_ICONS.farm,
      cardBg: '#D0E0D0',
      darkCardBg: '#1E3A3A',
      action: () => navigateToTab('MyFarmTab', 'UnifiedFarmSettings'),
    },
    {
      id: 'sensor',
      title: '센서관리',
      subtitle: '센서관리 중죡',
      icon: MENU_ICONS.sensor,
      cardBg: '#C8DDE8',
      darkCardBg: '#1E3A3A',
      action: () => navigateToTab('MyFarmTab', 'SensorManage'),
    },
    {
      id: 'help',
      title: '도움말',
      subtitle: '도움말 상정하기',
      icon: MENU_ICONS.help,
      cardBg: '#DDE8D0',
      darkCardBg: '#2A3A2E',
      action: () => navigateToTab('MoreTab', 'HelpCenter'),
    },
    {
      id: 'notify',
      title: '알림설정',
      subtitle: '알림설정',
      icon: MENU_ICONS.notify,
      cardBg: '#D0E0D0',
      darkCardBg: '#1E3A3A',
      action: () => navigateToTab('MoreTab', 'NotificationSettings'),
    },
  ];

  // ── Render ──
  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: c.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ====== 틸 그라데이션 헤더 (배경 이미지) ====== */}
        <ImageBackground
          source={HEADER_BG}
          style={[styles.header, { paddingBottom: HEADER_PADDING_BOTTOM }]}
          resizeMode="cover"
        >
          <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <View style={[styles.headerContent, { paddingTop: HEADER_TOP_PADDING }]}>
              <View style={styles.logoCircle}>
                <Image source={LOGO_ICON} style={styles.logoImg} resizeMode="cover" />
              </View>
              <View style={styles.titleWrap}>
                <Text style={styles.brandTitle}>FarmSense</Text>
                <Text style={styles.brandKorean}>포도박사</Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* ====== 날짜 + 날씨 + 온도 바 ====== */}
        <View style={[styles.dateBar, isDarkMode && { backgroundColor: c.surface }]}>
          <Text style={[styles.dateText, isDarkMode && { color: c.text.primary }]}>
            {dateStr}
          </Text>
          <View style={styles.weatherRow}>
            <Ionicons name="sunny" size={18} color="#FDB813" />
            <Text style={[styles.tempText, isDarkMode && { color: c.text.primary }]}>
              {currentTemp}°C
            </Text>
            <Text style={[styles.skyText, isDarkMode && { color: c.text.secondary }]}>
              맑음
            </Text>
          </View>
        </View>

        {/* ====== 메인 콘텐츠 (크림 배경) ====== */}
        <ImageBackground
          source={isDarkMode ? undefined : MAIN_BG}
          style={[styles.mainContent, isDarkMode && { backgroundColor: c.background }]}
          resizeMode="cover"
        >
          {/* ── 대형 카드 2x2 (가로: 아이콘 왼쪽 + 텍스트 오른쪽) ── */}
          <View style={styles.largeGrid}>
            {LARGE_MENUS.map((menu) => (
              <TouchableOpacity
                key={menu.id}
                style={[
                  styles.largeCard,
                  { backgroundColor: isDarkMode ? menu.darkCardBg : menu.cardBg, height: LARGE_CARD_H },
                ]}
                onPress={menu.action}
                activeOpacity={0.7}
              >
                <Image source={menu.icon} style={styles.largeIconImg} resizeMode="contain" />
                <View style={styles.largeTextWrap}>
                  <Text
                    style={[styles.largeTitle, { color: isDarkMode ? '#E0E0E0' : '#1A3A2A' }]}
                  >
                    {menu.title}
                  </Text>
                  <Text
                    style={[styles.largeSubtitle, { color: isDarkMode ? '#999' : '#5A7A6A' }]}
                  >
                    {menu.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── 소형 카드 3x2 (세로: 아이콘 위 + 텍스트 아래) ── */}
          <View style={styles.smallGrid}>
            {SMALL_MENUS.map((menu) => (
              <TouchableOpacity
                key={menu.id}
                style={[
                  styles.smallCard,
                  { backgroundColor: isDarkMode ? menu.darkCardBg : menu.cardBg, height: SMALL_CARD_H },
                ]}
                onPress={menu.action}
                activeOpacity={0.7}
              >
                <Image source={menu.icon} style={styles.smallIconImg} resizeMode="contain" />
                <Text
                  style={[styles.smallTitle, { color: isDarkMode ? '#E0E0E0' : '#1A3A2A' }]}
                >
                  {menu.title}
                </Text>
                <Text
                  style={[styles.smallSubtitle, { color: isDarkMode ? '#999' : '#5A7A6A' }]}
                >
                  {menu.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 8 }} />
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

// ── Styles ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },

  // ====== Header ======
  header: {
    width: '100%',
    // paddingBottom은 인라인에서 반응형 적용
  },
  headerSafe: {
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    // paddingTop은 인라인에서 반응형 적용
    gap: 14,
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  logoImg: {
    width: 54,
    height: 54,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexShrink: 1,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandKorean: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ====== 날짜 + 날씨 바 ======
  dateBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 3,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E2F',
    letterSpacing: 0.3,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E2F',
  },
  skyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5A7A6A',
  },

  // ====== Main Content ======
  mainContent: {
    paddingTop: 6,
    minHeight: 500,
  },

  // ====== 대형 카드 (높이 줄임, 가로비율 강조) ======
  largeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 6,
    gap: GRID_GAP,
  },
  largeCard: {
    width: LARGE_CARD_W,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    // height는 인라인에서 반응형 적용
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  largeIconImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  largeTextWrap: {
    flex: 1,
  },
  largeTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  largeSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  // ====== 소형 카드 (높이 줄임) ======
  smallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    marginTop: GRID_GAP,
    gap: GRID_GAP,
  },
  smallCard: {
    width: SMALL_CARD_W,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    // height는 인라인에서 반응형 적용
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  smallIconImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 8,
  },
  smallTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  smallSubtitle: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 3,
  },
});

export default HomeScreen;
