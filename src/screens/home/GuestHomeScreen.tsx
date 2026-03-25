/**
 * GuestHomeScreen - 비로그인 상태 홈 화면
 * AI 재배 보고서 소개 + 로그인 유도
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
import { colors } from '../../theme/colors';

const SAMPLE_OPINIONS = [
  {
    id: '1',
    icon: 'sunny-outline',
    iconColor: '#F59E0B',
    bgColor: '#FFFBEB',
    title: '오늘의 의견',
    body: '일조량이 부족한 날입니다. 보광등 가동을 권장합니다.',
  },
  {
    id: '2',
    icon: 'thunderstorm-outline',
    iconColor: '#3B82F6',
    bgColor: '#EFF6FF',
    title: '환기 권고',
    body: '온실 내부 습도 85% 이상. 측창 환기를 30분간 실시하세요.',
  },
  {
    id: '3',
    icon: 'water-outline',
    iconColor: '#10B981',
    bgColor: '#ECFDF5',
    title: '양액 의견',
    body: 'EC 1.8 → 2.0 상향 조정 시점입니다. 착과기 영양 강화 필요.',
  },
];

const SUPPORTED_CROPS = ['포도', '딸기', '참외', '오이', '토마토'];

const GuestHomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Ionicons name="leaf" size={48} color={colors.primary} />
          <Text style={styles.heroTitle}>🌱 AI 재배 보고서</Text>
          <Text style={styles.heroSubtitle}>
            센서 데이터와 기상 정보를 분석하여{'\n'}맞춤형 재배 의견을 매일 제공합니다
          </Text>
        </View>

        <Text style={styles.sectionTitle}>이런 의견을 받을 수 있어요</Text>
        {SAMPLE_OPINIONS.map((item) => (
          <View key={item.id} style={[styles.opinionCard, { backgroundColor: item.bgColor }]}>
            <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
            <View style={styles.opinionContent}>
              <Text style={styles.opinionTitle}>{item.title}</Text>
              <Text style={styles.opinionBody}>{item.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>지원 작물</Text>
        <View style={styles.cropRow}>
          {SUPPORTED_CROPS.map((crop) => (
            <View key={crop} style={styles.cropBadge}>
              <Text style={styles.cropText}>{crop}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.googleButtonText}>구글로 시작하기</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', paddingVertical: 32 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 12 },
  heroSubtitle: { fontSize: 15, color: colors.textSub, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 12 },
  opinionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  opinionContent: { flex: 1 },
  opinionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  opinionBody: { fontSize: 13, color: colors.textSub, lineHeight: 20 },
  cropRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  cropBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cropText: { fontSize: 14, fontWeight: '600', color: '#059669' },
  kakaoButton: {
    backgroundColor: '#3B6D11',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  kakaoButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: colors.text },
});

export default GuestHomeScreen;
