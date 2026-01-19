import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Card } from '../../components/common/Card';
import { colors, spacing, shadows } from '../../theme/colors';
import { Post, POST_CATEGORIES, PostCategory } from './types';

// Mock Data
const MOCK_POSTS: Post[] = [
  {
    id: '1', category: 'qna', title: '잎이 자꾸 노랗게 변하는데 왜 그럴까요?',
    content: '어제까지는 괜찮았는데 오늘 아침에 보니 잎 끝이 노랗습니다. 물은 충분히 줬는데...',
    author: { name: '초보농부', level: '새싹' }, createdAt: '방금 전',
    images: ['https://via.placeholder.com/150'], likes: 5, commentCount: 3, viewCount: 42, isResolved: false
  },
  {
    id: '2', category: 'tip', title: '샤인머스켓 당도 올리는 저만의 비법 공유합니다',
    content: '수확 2주 전부터 물 조절이 핵심입니다. 구체적인 방법은...',
    author: { name: '포도장인', level: '마스터' }, createdAt: '2시간 전',
    images: [], likes: 128, commentCount: 45, viewCount: 1205
  },
  {
    id: '3', category: 'general', title: '오늘 날씨 정말 좋네요~ 다들 힘내세요!',
    content: '농사 짓기 딱 좋은 날씨입니다. 모두 풍년 되시길!',
    author: { name: '김천농부', level: '열매' }, createdAt: '5시간 전',
    images: [], likes: 24, commentCount: 8, viewCount: 156
  },
];

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');

  const filteredPosts = selectedCategory === 'all'
    ? MOCK_POSTS
    : MOCK_POSTS.filter(p => p.category === selectedCategory);

  const renderPostItem = ({ item }: { item: Post }) => (
    <Card
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      {/* Set Category Badge & Status */}
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.catBadge}>
            <Text variant="caption" color={colors.primary} weight="bold">{POST_CATEGORIES[item.category]}</Text>
          </View>
          {item.category === 'qna' && (
            <View style={[styles.statusBadge, item.isResolved ? styles.bgResolved : styles.bgUnresolved]}>
              <Text variant="caption" color="#FFF" weight="bold">
                {item.isResolved ? '해결됨' : '답변대기'}
              </Text>
            </View>
          )}
        </View>
        <Text variant="caption" color={colors.textDisabled}>{item.createdAt}</Text>
      </View>

      <Text variant="h3" numberOfLines={1} style={{ marginVertical: 8 }}>{item.title}</Text>
      <Text variant="body2" color={colors.textSub} numberOfLines={2}>{item.content}</Text>

      {/* Footer Stats */}
      <View style={styles.cardFooter}>
        <Text variant="caption" color={colors.textSub}>by {item.author.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="heart-outline" size={16} color={colors.textSub} />
            <Text variant="caption" style={{ marginLeft: 2 }}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="comment-outline" size={16} color={colors.textSub} />
            <Text variant="caption" style={{ marginLeft: 2 }}>{item.commentCount}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1">
          {selectedCategory === 'all'
            ? '커뮤니티 👥'
            : POST_CATEGORIES[selectedCategory as PostCategory]}
        </Text>
        <TouchableOpacity style={styles.searchButton}>
          <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={{ height: 50 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...Object.keys(POST_CATEGORIES)] as any[]}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tabItem, selectedCategory === item && styles.tabItemActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                color={selectedCategory === item ? '#FFF' : colors.textSub}
                weight={selectedCategory === item ? 'bold' : 'medium'}
              >
                {item === 'all' ? '전체' : POST_CATEGORIES[item as PostCategory]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Post List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* FAB Write Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PostWrite')}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
        <Text color="#FFF" weight="bold" style={{ marginLeft: 4 }}>글쓰기</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  searchButton: {
    padding: 8,
  },
  tabContent: {
    paddingHorizontal: spacing.m,
    alignItems: 'center',
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.s,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  listContent: {
    padding: spacing.m,
    paddingBottom: 100,
  },
  postCard: {
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bgResolved: { backgroundColor: colors.success },
  bgUnresolved: { backgroundColor: colors.textDisabled },

  cardFooter: {
    marginTop: spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.m,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    ...shadows.medium,
  },
});
