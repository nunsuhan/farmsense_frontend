/**
 * ConsultScreen - AI 상담 탭 진입 화면
 * QnAScreen으로 바로 연결
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

const ConsultScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI 상담</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('QnAScreen')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#8B5CF6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>AI 재배 상담</Text>
            <Text style={styles.cardSubtitle}>
              병해충, 영양 관리, 환경 제어 등 재배 관련 질문을 AI에게 물어보세요
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textDisabled} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ExpertProfile')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people" size={32} color="#3B82F6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>전문가 상담</Text>
            <Text style={styles.cardSubtitle}>
              지역 농업기술센터 전문가에게 1:1 상담을 요청하세요
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textDisabled} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  scroll: { flex: 1, paddingHorizontal: 16 },
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

export default ConsultScreen;
