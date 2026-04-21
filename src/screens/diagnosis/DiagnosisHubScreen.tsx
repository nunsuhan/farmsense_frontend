/**
 * DiagnosisHubScreen - 진단 허브
 * 병해진단 카메라 하나로 통합 (차폐율, 성장일지는 SmartScanner 탭 내부에서 제공)
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows } from '../../theme/colors';

const DiagnosisHubScreen = () => {
  const navigation = useNavigation<any>();

  const CARDS = [
    {
      id: 'camera',
      title: '병해 진단',
      subtitle: '포도 잎·과일 촬영으로 AI가 병해를 감별합니다. 차폐율·성장기록도 함께 지원합니다.',
      icon: 'camera',
      iconColor: '#EF4444',
      bgColor: '#FEF2F2',
      screen: 'SmartLens',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>진단</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 진단 도움말 */}
        <View style={styles.helpCard}>
          <Ionicons name="information-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.helpText}>
            사진 진단은 예방 참고용입니다. 정확도 100%가 아니므로 의심되면 전문가에게 문의하세요.
          </Text>
        </View>

        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => navigation.navigate(card.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: card.bgColor }]}>
              <Ionicons name={card.icon as any} size={32} color={card.iconColor} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textDisabled} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  scroll: { flex: 1, paddingHorizontal: 16 },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  helpText: { flex: 1, fontSize: 13, color: '#7F1D1D', lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    gap: 16,
    ...shadows.small,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.textSub, lineHeight: 20 },
});

export default DiagnosisHubScreen;
