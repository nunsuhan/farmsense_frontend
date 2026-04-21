/**
 * MoreScreen - 더보기 탭
 * 알림설정 / 도움말 / 내정보 / 앱정보 / 로그아웃
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useStore } from '../../store/useStore';
import { clearTokens } from '../../services/authApi';

const MENU_ITEMS = [
  {
    id: 'barcode',
    title: '농약 바코드 스캔',
    subtitle: '바코드로 농약 정보 + PLS 조회',
    icon: 'barcode-outline',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    screen: 'BarcodeScanner',
  },
  {
    id: 'receipt',
    title: '영수증 자동 기입',
    subtitle: '영수증 사진으로 영농일지 작성',
    icon: 'receipt-outline',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    screen: 'ReceiptOCR',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    subtitle: '병해충 경보, 센서 알림 관리',
    icon: 'notifications-outline',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    screen: 'NotificationSettings',
  },
  {
    id: 'help',
    title: '도움말 / 고객센터',
    subtitle: '자주 묻는 질문, 사용 가이드',
    icon: 'help-circle-outline',
    iconBg: '#FCE7F3',
    iconColor: '#EC4899',
    screen: 'Help',
  },
  {
    id: 'profile',
    title: '내 정보',
    subtitle: '계정 정보, 비밀번호 변경',
    icon: 'person-outline',
    iconBg: '#EDE9FE',
    iconColor: '#8B5CF6',
    screen: 'AccountSettings',
  },
  {
    id: 'appinfo',
    title: '앱 정보',
    subtitle: '버전, 약관, 개인정보처리방침',
    icon: 'information-circle-outline',
    iconBg: '#F3F4F6',
    iconColor: '#6B7280',
    screen: 'AppInfo',
  },
];

const MoreScreen = () => {
  const navigation = useNavigation<any>();
  const setUser = useStore((s) => s.setUser);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          await setUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>더보기</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FarmSense v1.0.0 (Beta)</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  scroll: { flex: 1, paddingHorizontal: 16 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  menuSubtitle: { fontSize: 13, color: colors.textSub },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textDisabled,
    marginTop: 20,
  },
});

export default MoreScreen;
