/**
 * OnboardingReminderBanner — 농장 미등록 사용자에게 표시하는 지속 배너 (Issue #5)
 *
 * 표시 조건: user.onboarding_completed === false
 * 클릭 시: FarmBasicInfo 화면으로 이동 (isInitialSetup=true)
 * X 버튼 없음 — 사양상 "계속 따라다니도록"
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../store/useStore';

const OnboardingReminderBanner: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useStore((s) => s.user);

  if (!user || user.onboarding_completed) {
    return null;
  }

  const goRegister = () => {
    navigation.navigate('FarmBasicInfo', { isInitialSetup: true });
  };

  return (
    <TouchableOpacity style={styles.banner} onPress={goRegister} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        <Ionicons name="leaf" size={18} color="#F59E0B" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>농장 정보를 등록해 주세요</Text>
        <Text style={styles.subtitle}>
          농장설정이 완료되지 않아 일부 기능이 제한됩니다. 등록하면 AI 보고서가 시작돼요.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#92400E" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginVertical: 10,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  subtitle: { fontSize: 12, color: '#A16207', marginTop: 2, lineHeight: 16 },
});

export default OnboardingReminderBanner;
