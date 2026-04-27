/**
 * PhoneAuthBranchScreen — 휴대폰 인증 후 신규 가입자 분기 화면 (Issue #5)
 *
 * 트리거: verifyPhoneCode 응답의 is_new_user=true
 * 두 갈래:
 *   1) "회원가입하고 농장 등록" → FarmBasicInfo (isInitialSetup=true) → 농장 저장 시 onboarding_completed=true
 *   2) "먼저 둘러보기" → 안내 모달 → MainTab (홈), onboarding_completed=false 유지
 *
 * 디자인 톤: OnboardingSlides 와 통일 (onboardingTheme 사용).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ONBOARDING } from '../../constants/onboardingTheme';

const PhoneAuthBranchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showBrowsingModal, setShowBrowsingModal] = useState(false);

  const goRegister = () => {
    // 회원가입 분기: FarmBasicInfoScreen 이 isInitialSetup=true 모드로 진입.
    // 저장 시 completeOnboarding 호출 + setUser({ ...user, onboarding_completed: true })
    navigation.reset({
      index: 0,
      routes: [{ name: 'FarmBasicInfo', params: { isInitialSetup: true } }],
    });
  };

  const goBrowse = () => {
    setShowBrowsingModal(false);
    // 둘러보기: onboarding_completed=false 유지. MainTab 진입 후 HomeScreen 배너로 농장 등록 유도.
    navigation.reset({ index: 0, routes: [{ name: 'MainTab' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={ONBOARDING.colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={36} color={ONBOARDING.colors.primary} />
          </View>
          <Text style={styles.title}>환영합니다!</Text>
          <Text style={styles.subtitle}>
            FarmSense를 어떻게 시작하시겠어요?
          </Text>
        </View>

        {/* 옵션 A: 회원가입 */}
        <TouchableOpacity
          style={[styles.card, styles.cardPrimary]}
          activeOpacity={0.85}
          onPress={goRegister}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.badge, styles.badgeRecommended]}>
              <Text style={styles.badgeText}>추천</Text>
            </View>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.cardTitlePrimary}>회원가입하고 농장 등록</Text>
          <Text style={styles.cardDescPrimary}>
            농장 정보를 등록하면 AI 일일 보고서와{'\n'}
            맞춤 진단·관수·시비 추천을 받을 수 있어요.
          </Text>
          <View style={styles.benefitRow}>
            <BenefitChip icon="document-text-outline" label="일일 보고서" primary />
            <BenefitChip icon="medical-outline" label="AI 진단" primary />
            <BenefitChip icon="water-outline" label="관수 추천" primary />
          </View>
        </TouchableOpacity>

        {/* 옵션 B: 둘러보기 */}
        <TouchableOpacity
          style={[styles.card, styles.cardSecondary]}
          activeOpacity={0.85}
          onPress={() => setShowBrowsingModal(true)}
        >
          <View style={styles.cardHeaderRow}>
            <View />
            <Ionicons name="arrow-forward" size={20} color={ONBOARDING.colors.textSub} />
          </View>
          <Text style={styles.cardTitleSecondary}>먼저 둘러보기</Text>
          <Text style={styles.cardDescSecondary}>
            농장 정보 없이 앱을 살펴볼 수 있어요.{'\n'}
            언제든 설정에서 농장을 등록할 수 있습니다.
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          나중에 더보기 → 농장 설정에서 언제든 변경 가능합니다.
        </Text>
      </ScrollView>

      {/* 둘러보기 안내 모달 (Step 5-3) */}
      <Modal
        visible={showBrowsingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBrowsingModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons
              name="information-circle"
              size={36}
              color={ONBOARDING.colors.primary}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.modalTitle}>먼저 살펴보세요</Text>
            <Text style={styles.modalBody}>
              AI 진단, 일일 보고서, 영농일지 등{'\n'}
              핵심 기능을 둘러보실 수 있습니다.{'\n\n'}
              마음에 드시면 설정 → 농장정보에서{'\n'}
              등록하시고 본격적으로 시작하세요.
            </Text>
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  setShowBrowsingModal(false);
                  goRegister();
                }}
              >
                <Text style={styles.modalBtnPrimaryText}>농장 등록하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={goBrowse}
              >
                <Text style={styles.modalBtnSecondaryText}>둘러보기 시작</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const BenefitChip: React.FC<{ icon: any; label: string; primary?: boolean }> = ({
  icon,
  label,
  primary,
}) => (
  <View style={[styles.chip, primary && styles.chipPrimary]}>
    <Ionicons name={icon} size={14} color={primary ? '#FFFFFF' : ONBOARDING.colors.primary} />
    <Text style={[styles.chipText, primary && styles.chipTextPrimary]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ONBOARDING.colors.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 28, marginTop: 12 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: ONBOARDING.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: ONBOARDING.colors.text, marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: ONBOARDING.colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
  },

  card: {
    borderRadius: ONBOARDING.radius.card,
    padding: 22,
    marginBottom: 14,
  },
  cardPrimary: {
    backgroundColor: ONBOARDING.colors.primary,
  },
  cardSecondary: {
    backgroundColor: ONBOARDING.colors.card,
    borderWidth: 1,
    borderColor: ONBOARDING.colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ONBOARDING.radius.badge,
  },
  badgeRecommended: { backgroundColor: 'rgba(255,255,255,0.22)' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  cardTitlePrimary: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  cardDescPrimary: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 21,
    marginBottom: 16,
  },
  cardTitleSecondary: {
    fontSize: 18,
    fontWeight: '700',
    color: ONBOARDING.colors.text,
    marginBottom: 6,
  },
  cardDescSecondary: {
    fontSize: 14,
    color: ONBOARDING.colors.textSub,
    lineHeight: 21,
  },

  benefitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: ONBOARDING.colors.primaryLight,
  },
  chipPrimary: { backgroundColor: 'rgba(255,255,255,0.18)' },
  chipText: { fontSize: 12, fontWeight: '600', color: ONBOARDING.colors.primary },
  chipTextPrimary: { color: '#FFFFFF' },

  footerNote: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 12,
    color: ONBOARDING.colors.textSub,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: ONBOARDING.colors.card,
    borderRadius: ONBOARDING.radius.card,
    padding: 28,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ONBOARDING.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: ONBOARDING.colors.textSub,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalRow: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: ONBOARDING.radius.button,
    alignItems: 'center',
  },
  modalBtnPrimary: { backgroundColor: ONBOARDING.colors.primary },
  modalBtnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  modalBtnSecondary: {
    backgroundColor: ONBOARDING.colors.inputBg,
    borderWidth: 1,
    borderColor: ONBOARDING.colors.border,
  },
  modalBtnSecondaryText: { color: ONBOARDING.colors.text, fontWeight: '600', fontSize: 14 },
});

export default PhoneAuthBranchScreen;
