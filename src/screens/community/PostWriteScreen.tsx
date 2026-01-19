import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { colors, spacing } from '../../theme/colors';
import { POST_CATEGORIES, PostCategory } from './types';
import * as ImagePicker from 'expo-image-picker';

export const PostWriteScreen: React.FC = () => {
  const navigation = useNavigation();
  const [category, setCategory] = useState<PostCategory>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<any[]>([]);

  const handleSave = () => {
    if (!title || !content) {
      return Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
    }
    Alert.alert('등록 완료', '게시글이 성공적으로 등록되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const pickImage = async () => {
    // MediaLibrary 권한 요청 (필요시)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text variant="h3">{POST_CATEGORIES[category] || '글쓰기'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text variant="button" color={colors.primary}>등록</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Picker */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(Object.keys(POST_CATEGORIES) as PostCategory[]).map(key => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.catChip,
                  category === key && styles.catChipActive
                ]}
                onPress={() => setCategory(key)}
              >
                <Text color={category === key ? '#FFF' : colors.textSub}>
                  {POST_CATEGORIES[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Inputs */}
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={colors.textDisabled}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 자유롭게 작성해주세요."
          multiline
          value={content}
          onChangeText={setContent}
          placeholderTextColor={colors.textDisabled}
          textAlignVertical="top"
        />

        {/* Photos */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
            <MaterialCommunityIcons name="camera" size={24} color={colors.textSub} />
            <Text variant="caption" color={colors.textSub} style={{ marginTop: 4 }}>
              {images.length}/5
            </Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Helper Text */}
      <View style={styles.footer}>
        <Text variant="caption" color={colors.textDisabled}>
          * 부적절한 게시물은 통보 없이 삭제될 수 있습니다.
        </Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.m,
  },
  section: {
    marginBottom: spacing.m,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.s,
  },
  catChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.m,
    color: colors.text,
  },
  contentInput: {
    height: 200,
    fontSize: 16,
    color: colors.text,
  },
  photoSection: {
    flexDirection: 'row',
    marginTop: spacing.m,
  },
  addPhotoBtn: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  photoThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: spacing.s,
    backgroundColor: colors.background,
  },
  footer: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
