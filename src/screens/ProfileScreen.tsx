// ProfileScreen - 내 정보 (Updated with navigation)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/common/ScreenWrapper';
import {
  useFarmId,
  useStore,
  useUser,
  useSetUser,
} from '../store/useStore';
import { authApi } from '../services/authApi';
import { avatarApi } from '../services/avatarApi';
import { API_CONFIG } from '../constants/config';

const PROFILE_CONFIG = {
  APP_NAME: '포도박사',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@farmsense.kr',
  DEFAULT_AVATAR: `${API_CONFIG.BASE_URL.replace('/api', '')}/static/images/default_avatar.png`,
};

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  rightElement,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (onPress && <Text style={styles.chevron}>›</Text>)}
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // ✅ Standardized Store Access
  const farmId = useFarmId();
  const setFarmInfo = useStore((state) => state.setFarmInfo);
  const farmInfo = useStore((state) => state.farmInfo);

  const user = useUser();
  const setUser = useSetUser();

  const [editingFacility, setEditingFacility] = useState(false);
  const [newFacilityId, setNewFacilityId] = useState(farmId || '');

  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Load Avatar on Mount
  React.useEffect(() => {
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    try {
      const info = await avatarApi.getMyAvatar();
      if (info && info.avatar_url) {
        // 상대경로면 도메인 추가
        const baseOrigin = API_CONFIG.BASE_URL.replace('/api', '');
        const fullUrl = info.avatar_url.startsWith('http')
          ? info.avatar_url
          : `${baseOrigin}${info.avatar_url}`;
        setAvatarUrl(fullUrl);
      }
    } catch (e) {
      console.log('Failed to load avatar', e);
    }
  };

  // Avatar Actions
  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '카메라로 촬영', '갤러리에서 선택', '기본 이미지로 변경'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          if (buttonIndex === 2) pickFromGallery();
          if (buttonIndex === 3) resetToDefault();
        }
      );
    } else {
      Alert.alert(
        '프로필 사진 변경',
        '방법을 선택해주세요',
        [
          { text: '기본 이미지', onPress: resetToDefault, style: 'destructive' },
          { text: '갤러리', onPress: pickFromGallery },
          { text: '카메라', onPress: takePhoto },
        ],
        { cancelable: true }
      );
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한을 허용해주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleUpload(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('오류', '갤러리를 열 수 없습니다.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한을 허용해주세요.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleUpload(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('오류', '카메라를 열 수 없습니다.');
    }
  };

  const resetToDefault = async () => {
    try {
      setAvatarLoading(true);
      await avatarApi.resetAvatar();
      setAvatarUrl(null); // Clear local
      await loadAvatar(); // Reload to get default URL if server dictates
      Alert.alert('알림', '기본 이미지로 변경되었습니다.');
    } catch (e) {
      Alert.alert('오류', '초기화에 실패했습니다.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpload = async (uri: string) => {
    try {
      setAvatarLoading(true);
      console.log('Creating FormData with URI:', uri);

      const res = await avatarApi.uploadAvatar(uri);
      console.log('Upload result:', res);

      if (res.avatar_url) {
        // 상대경로면 도메인 추가
        const baseOriginUpload = API_CONFIG.BASE_URL.replace('/api', '');
        const baseUrl = res.avatar_url.startsWith('http')
          ? res.avatar_url
          : `${baseOriginUpload}${res.avatar_url}`;
        // Cache busting: Append timestamp to force image refresh
        const newUrl = `${baseUrl}?t=${new Date().getTime()}`;
        setAvatarUrl(newUrl);
        Alert.alert('성공', '프로필 사진이 업데이트되었습니다.');

        // Reload consistency
        await loadAvatar();
      } else {
        Alert.alert('확인', '업로드는 완료되었으나 이미지 URL을 받지 못했습니다.');
        await loadAvatar();
      }
    } catch (e: any) {
      console.error('Upload error:', e);
      Alert.alert('오류', `업로드 실패: ${e.message || '알 수 없는 오류'}`);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Defensive: If store not ready
  if (user === undefined || farmId === undefined) {
    return null;
  }

  // Save facility ID (Actually Farm ID)
  const saveFacilityId = async () => {
    if (newFacilityId.trim()) {
      // Update Farm Info with new ID
      const updatedInfo = farmInfo
        ? { ...farmInfo, id: newFacilityId.trim() }
        : {
          id: newFacilityId.trim(),
          userId: user?.email || 'guest',
          name: '내 농장',
          region: '',
          crop: ''
        }; // Fallback for new farm info

      await setFarmInfo(updatedInfo);
      setEditingFacility(false);
      Alert.alert('저장 완료', '농장 ID가 변경되었습니다.');
    } else {
      Alert.alert('입력 오류', '농장 ID를 입력해주세요.');
    }
  };

  // Navigate to screens
  const goToNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const goToFacilityInfo = () => {
    navigation.navigate('FarmBasicInfo');
  };

  const goToTerms = () => {
    navigation.navigate('Terms');
  };

  const goToReverseAnalysis = () => {
    navigation.navigate('ReverseAnalysis');
  };

  const goToAccountSettings = () => {
    navigation.navigate('AccountSettings');
  };

  const goToDataManagement = () => {
    Alert.alert(
      '⚠️ 데이터 관리',
      '데이터 초기화 및 관리 기능입니다.\n\n아래 "데이터 초기화" 버튼을 사용하세요.',
      [{ text: '확인' }]
    );
  };

  // Show about app
  const showAbout = () => {
    Alert.alert(
      `${PROFILE_CONFIG.APP_NAME} v${PROFILE_CONFIG.VERSION}`,
      '🍇 포도 재배 농가를 위한\n스마트팜 의사결정 지원 시스템\n\n' +
      '주요 기능:\n' +
      '• AI 기반 병해 진단\n' +
      '• 성장일지 기록\n' +
      '• 농업인 커뮤니티 Q&A\n' +
      '• 목표 생산량 역분석\n' +
      '• IoT 센서 데이터 융합\n\n' +
      `문의: ${PROFILE_CONFIG.SUPPORT_EMAIL}`,
      [{ text: '확인' }]
    );
  };

  // 로그아웃
  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 [Profile] 로그아웃 시작');
              if (authApi && authApi.logout) {
                await authApi.logout();
              }
              if (setUser) setUser(null);
              console.log('✅ [Profile] 로그아웃 완료');
              Alert.alert('로그아웃', '로그아웃되었습니다.');
            } catch (error) {
              console.error('❌ [Profile] 로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // Data reset
  const handleDataReset = () => {
    Alert.alert(
      '⚠️ 데이터 초기화란?',
      '데이터 초기화는 다음과 같은 경우에 사용합니다:\n\n' +
      '📌 사용 목적:\n' +
      '• 새로운 농장/시설로 변경할 때\n' +
      '• 앱 설정을 처음 상태로 되돌릴 때\n' +
      '• 다른 사용자에게 기기를 양도할 때\n\n' +
      '🗑️ 삭제되는 항목:\n' +
      '• 저장된 시설 ID\n' +
      '• 로컬에 저장된 사용자 정보\n' +
      '• 앱 내 설정값\n\n' +
      '⚡ 삭제되지 않는 항목:\n' +
      '• 서버에 업로드된 진단 기록\n' +
      '• 커뮤니티에 작성한 게시글',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화 진행',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '최종 확인',
              '정말로 모든 앱 데이터를 초기화하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '초기화',
                  style: 'destructive',
                  onPress: async () => {
                    if (authApi && authApi.logout) await authApi.logout();

                    // Reset to null — 인증 흐름에서 loadFarms()로 다시 채움
                    await setFarmInfo(null);

                    if (setUser) setUser(null);
                    setNewFacilityId('farm-test');
                    Alert.alert('✅ 초기화 완료', '모든 앱 데이터가 초기화되었습니다.');
                  }
                }
              ]
            );
          }
        },
      ]
    );
  };

  return (
    <ScreenWrapper title="프로필" showBack={true}>
      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleAvatarPress} disabled={avatarLoading}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0) : '👤'}
                </Text>
              )}

              {/* Edit Overlay */}
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={14} color="white" />
              </View>

              {/* Loading Overlay */}
              {avatarLoading && (
                <View style={[styles.avatar, styles.loadingOverlay]}>
                  <ActivityIndicator color="#10B981" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {user?.name || '문수'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'artmer3061@gmail.com'}
          </Text>

          {/* 로그인하지 않은 경우 로그인 버튼 표시 */}
          {!user && (
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => Alert.alert('알림', '게스트 모드입니다.\n로그인 기능은 앱을 재시작하면 사용할 수 있습니다.')}
            >
              <Text style={styles.loginPromptText}>🔐 로그인하러 가기</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions - 설정 메뉴로 바로가기 */}
        <View style={styles.quickActions}>
          {/* Settings Removed per request */}
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={goToReverseAnalysis}
          >
            <Text style={styles.quickActionEmoji}>📊</Text>
            <Text style={styles.quickActionText}>역분석</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={goToAccountSettings}
          >
            <Text style={styles.quickActionEmoji}>👤</Text>
            <Text style={styles.quickActionText}>계정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={goToTerms}
          >
            <Text style={styles.quickActionEmoji}>📋</Text>
            <Text style={styles.quickActionText}>약관</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={showAbout}
          >
            <Text style={styles.quickActionEmoji}>ℹ️</Text>
            <Text style={styles.quickActionText}>앱정보</Text>
          </TouchableOpacity>
        </View>

        {/* Account Management */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 계정 관리</Text>

            <SettingItem
              title="계정 설정"
              subtitle="프로필, 비밀번호 변경"
              onPress={goToAccountSettings}
            />

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>🚪 로그아웃</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ 데이터 관리</Text>

          <SettingItem
            title="데이터 관리"
            subtitle="앱 데이터 백업 및 복원"
            onPress={goToDataManagement}
          />

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDataReset}
          >
            <Text style={styles.dangerButtonText}>🗑️ 데이터 초기화</Text>
          </TouchableOpacity>

          <Text style={styles.dangerDescription}>
            초기화하면 시설 ID, 사용자 정보, 앱 설정이 모두 삭제됩니다.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {PROFILE_CONFIG.APP_NAME} v{PROFILE_CONFIG.VERSION}
          </Text>
          <Text style={styles.footerText}>
            © 2025 FarmSense. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative', // Context for overlays
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginPromptButton: {
    marginTop: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginPromptText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  editText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  editContainer: {
    paddingVertical: 12,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelEditText: {
    fontSize: 14,
    color: '#6B7280',
  },
  saveEditButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveEditText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});

export default ProfileScreen;
