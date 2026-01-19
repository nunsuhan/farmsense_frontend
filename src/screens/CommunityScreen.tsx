import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Text } from '../components/common/Text';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { PostCategory } from './community/types';

// Mock Data for Q&A, Free, Inquiry
const MOCK_POSTS = [
  { id: '1', category: 'qna', title: '샤인머스캣 잎이 갈색으로 변해요', author: '초보농부', replies: 3, likes: 12, accepted: false },
  { id: '2', category: 'general', title: '오늘 날씨가 너무 좋네요! 밭일하기 딱입니다.', author: '포도사랑', replies: 8, likes: 24, accepted: false },
  { id: '3', category: 'inquiry', title: '앱 알림이 안 울리는데 설정 확인 부탁드려요', author: '김농부', replies: 1, likes: 5, accepted: false },
  { id: '4', category: 'qna', title: '늦가을 물주기 어떻게 하시나요?', author: '왕거봉', replies: 5, likes: 10, accepted: true },
  { id: '5', category: 'general', title: '수확 끝내고 삼겹살 파티했습니다 ㅎㅎ', author: '영천포도', replies: 12, likes: 45, accepted: false },
];

export const CommunityScreen = () => {
  const navigation = useNavigation<any>();
  // default tab is Q&A as per usage, or General. Let's start with Q&A as it's the main feature.
  const [activeTab, setActiveTab] = useState<PostCategory>('qna');

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'experts') {
      Alert.alert('알림', '곧 서비스 예정입니다.\n더 좋은 서비스를 위해 전문가를 모시고 있습니다.');
      return;
    }
    setActiveTab(tabKey as PostCategory);
  };

  const filteredPosts = MOCK_POSTS.filter(post => post.category === activeTab);

  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={[styles.catBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={[styles.catText, { color: getCategoryTextColor(item.category) } as any]}>
                {getCategoryLabel(item.category)}
              </Text>
            </View>
          </View>
          <Text variant="body1" weight="bold" style={styles.cardTitle}>{item.title}</Text>
        </View>
        {item.accepted && <View style={styles.acceptedBadge}><Text style={styles.acceptedText}>채택완료</Text></View>}
      </View>
      <View style={styles.cardMeta}>
        <Text variant="caption" color="gray">{item.author}</Text>
        <View style={styles.metaRight}>
          <Ionicons name="chatbubble-outline" size={14} color="gray" />
          <Text variant="caption" color="gray" style={{ marginLeft: 4, marginRight: 10 }}>{item.replies}</Text>
          <Ionicons name="heart-outline" size={14} color="gray" />
          <Text variant="caption" color="gray" style={{ marginLeft: 4 }}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper title="커뮤니티" showMenu={true}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TabButton label="Q&A" isActive={activeTab === 'qna'} onPress={() => handleTabPress('qna')} />
          <TabButton label="자유게시판" isActive={activeTab === 'general'} onPress={() => handleTabPress('general')} />
          <TabButton label="문의게시판" isActive={activeTab === 'inquiry'} onPress={() => handleTabPress('inquiry')} />
          <TabButton label="전문가 찾기" isActive={false} onPress={() => handleTabPress('experts')} />
        </ScrollView>
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          </View>
        }
      />

      {/* Floating Write Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PostWrite')}
      >
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const TabButton = ({ label, isActive, onPress }: { label: string, isActive: boolean, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tab, isActive && styles.activeTab]}>
    <Text style={[styles.tabText, isActive && styles.activeTabText] as any}>{label}</Text>
  </TouchableOpacity>
);

const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'qna': return '질문';
    case 'general': return '자유';
    case 'inquiry': return '문의';
    default: return '기타';
  }
};

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'qna': return '#DBEAFE';
    case 'general': return '#F3F4F6';
    case 'inquiry': return '#FEF3C7';
    default: return '#F3F4F6';
  }
};

const getCategoryTextColor = (cat: string) => {
  switch (cat) {
    case 'qna': return '#1D4ED8';
    case 'general': return '#4B5563';
    case 'inquiry': return '#D97706';
    default: return '#4B5563';
  }
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold'
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  catText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1F2937',
  },
  acceptedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8
  },
  acceptedText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: 'bold'
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 10,
    color: '#9CA3AF',
    fontSize: 14,
  },
});
