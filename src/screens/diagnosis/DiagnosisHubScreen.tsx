/**
 * v2.1 DiagnosisHubScreen - 진단 허브
 * 3가지: 병해진단(촬영), 성장기록, 캐노피
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PageLayout from '../../components/common/PageLayout';
import HelpCard from '../../components/common/HelpCard';
import { colors, shadows } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeProvider';

const DiagnosisHubScreen = () => {
  const navigation = useNavigation<any>();
  const { colors: tc } = useTheme();

  const CARDS = [
    {
      id: 'camera',
      title: '병해 진단 촬영',
      subtitle: '포도 잎·과일을 촬영하여 AI가 병해를 감별합니다',
      icon: 'camera',
      iconColor: '#EF4444',
      bgColor: '#FEF2F2',
      screen: 'DiagnosisCamera',
    },
    {
      id: 'growth',
      title: '성장 기록',
      subtitle: '생육 상태를 촬영하고 기록합니다. 이상 발견 시 보고서가 자동 생성됩니다.',
      icon: 'trending-up',
      iconColor: '#10B981',
      bgColor: '#ECFDF5',
      screen: 'GrowthRecord',
    },
    {
      id: 'canopy',
      title: '캐노피 분석',
      subtitle: '나무 윗부분을 촬영하여 수세와 엽면적을 분석합니다',
      icon: 'leaf',
      iconColor: '#8B5CF6',
      bgColor: '#F5F3FF',
      screen: 'CanopyGuide',
    },
  ];

  return (
    <PageLayout title="진단" showBack={true} showFooter={false}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 진단 도움말 */}
        <HelpCard
          id="help_diagnosis_hub"
          title="진단 기능 안내"
          body="사진 진단은 예방 참고용입니다. 정확도 100%가 아니므로 의심되면 전문가에게 문의하세요. 꾸준한 촬영이 AI 정확도를 높입니다."
          icon="information-circle-outline"
          iconColor="#EF4444"
        />

        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: tc.surface }]}
            onPress={() => navigation.navigate(card.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: card.bgColor }]}>
              <Ionicons name={card.icon as any} size={32} color={card.iconColor} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: tc.text.primary }]}>{card.title}</Text>
              <Text style={[styles.cardSubtitle, { color: tc.text.secondary }]}>{card.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={tc.text.disabled} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingTop: 8, paddingHorizontal: 16 },
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
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.textSub, lineHeight: 20 },
});

export default DiagnosisHubScreen;
