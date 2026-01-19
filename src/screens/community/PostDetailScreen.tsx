import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { colors, spacing, shadows } from '../../theme/colors';
import { POST_CATEGORIES } from './types';

// Mock Comments
const MOCK_COMMENTS = [
  { id: 'c1', author: '샤인박사', content: '질소 비료 과다 시비가 원인일 수 있습니다. 잎 끝 색깔을 잘 보세요.', isExpert: true, createdAt: '1시간 전' },
  { id: 'c2', author: '김농부', content: '저도 비슷한 증상인데 비오고나서 그러네요.', isExpert: false, createdAt: '30분 전' },
];

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [commentText, setCommentText] = useState('');

  // In a real app, fetch post by ID
  const post = {
    id: route.params?.postId || '1',
    category: 'qna',
    title: '잎이 자꾸 노랗게 변하는데 왜 그럴까요?',
    content: '어제까지는 괜찮았는데 오늘 아침에 보니 잎 끝이 노랗습니다. 물은 충분히 줬는데 왜 이런 증상이 나타나는지 궁금합니다. 혹시 병해일까요?',
    author: { name: '초보농부', level: '새싹' },
    createdAt: '방금 전',
    images: ['https://via.placeholder.com/300'],
    likes: 5,
    viewCount: 42,
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    Alert.alert('댓글 등록', '댓글이 등록되었습니다.');
    setCommentText('');
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text variant="h3">{POST_CATEGORIES[post.category as any] || '게시글'}</Text>
        <View style={{ flexDirection: 'row' }}>
          <MaterialCommunityIcons name="share-variant" size={24} color={colors.text} style={{ marginRight: 16 }} />
          <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.text} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category & Title */}
        <View style={styles.catBadge}>
          <Text variant="caption" color={colors.primary} weight="bold">
            {POST_CATEGORIES[post.category as any] || '게시글'}
          </Text>
        </View>
        <Text variant="h2" style={{ marginTop: spacing.s, marginBottom: spacing.m }}>
          {post.title}
        </Text>

        {/* Author Info */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text>👤</Text>
          </View>
          <View style={{ marginLeft: spacing.s }}>
            <Text variant="body2" weight="bold">{post.author.name}</Text>
            <Text variant="caption" color={colors.textSub}>
              {post.author.level} · {post.createdAt} · 조회 {post.viewCount}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.body}>
          <Text variant="body1" style={{ lineHeight: 24 }}>{post.content}</Text>
          {post.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.postImage} />
          ))}
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="heart-outline" size={24} color={colors.textSub} />
            <Text style={{ marginLeft: 6 }}>좋아요 {post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="comment-outline" size={24} color={colors.textSub} />
            <Text style={{ marginLeft: 6 }}>댓글 {MOCK_COMMENTS.length}</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentSection}>
          <Text variant="h3" style={{ marginBottom: spacing.m }}>댓글</Text>
          {MOCK_COMMENTS.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text variant="body2" weight="bold">{comment.author}</Text>
                  {comment.isExpert && (
                    <View style={styles.expertBadge}>
                      <Text variant="caption" color="#FFF" style={{ fontSize: 10 }}>전문가</Text>
                    </View>
                  )}
                </View>
                <Text variant="caption" color={colors.textDisabled}>{comment.createdAt}</Text>
              </View>
              <Text variant="body2" style={{ marginTop: 4 }}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 남겨보세요..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={handleSendComment} style={styles.sendBtn}>
          <MaterialCommunityIcons name="send" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.m,
    paddingBottom: 80,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  body: {
    paddingVertical: spacing.l,
    minHeight: 200,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: spacing.m,
    backgroundColor: colors.background,
  },
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.m,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  commentSection: {
    marginTop: spacing.l,
  },
  commentItem: {
    marginBottom: spacing.m,
    backgroundColor: colors.background,
    padding: spacing.m,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expertBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    backgroundColor: '#FFF',
    padding: spacing.s,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    marginLeft: spacing.m,
    padding: 4,
  },
});
