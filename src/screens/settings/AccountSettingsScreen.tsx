import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AddressSearchModal from '../../components/AddressSearchModal';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { authApi } from '../../services/authApi';
import { avatarApi, AvatarInfo, AvatarPreset } from '../../services/avatarApi';
import { useStore } from '../../store/useStore';
import { AVATAR_OPTIONS } from '../../constants/avatars';

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Info State
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Avatar State
  const [avatarInfo, setAvatarInfo] = useState<AvatarInfo | null>(null);
  const [presets, setPresets] = useState<AvatarPreset[]>([]);

  // Address State
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserProfile();
    loadAvatarInfo();
  }, []);

  const loadAvatarInfo = async () => {
    try {
      const info = await avatarApi.getMyAvatar();
      setAvatarInfo(info);
      const presetList = await avatarApi.getPresets();
      setPresets(presetList);
    } catch (e) {
      console.log('Avatar Load Error:', e);
    }
  };

  const loadUserProfile = async () => {
    if (!setUser) return;
    try {
      setIsLoading(true);
      const profile = await authApi.getFullProfile();
      const p = profile as any;

      setUserId(profile.email || '');
      setName(p.first_name || p.username || '');

      // Backend now returns flat structure for some fields like phone_number
      // But we check both just in case or if mapped
      setPhoneNumber(p.phone_number || (profile.profile && profile.profile.phone) || '');

      // Address might still be in profile object or flat, handling both if needed
      // Assuming existing Profile structure holds unless completely flattening everything
      if (profile.profile) {
        setAddress(profile.profile.address || '');
        setDetailAddress(profile.profile.address_detail || '');
        setZipCode(profile.profile.zip_code || '');
      } else {
        // Fallback for completely flat structure
        setAddress(p.address || '');
        setDetailAddress(p.address_detail || '');
        setZipCode(p.zip_code || '');
      }

      await setUser(profile as any);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ...

  const handleUpdateProfile = async () => {
    if (!setUser) return;
    try {
      setIsSaving(true);

      // Use correct keys for the new API
      const profileData = {
        phone_number: phoneNumber,
        address: address,
        address_detail: detailAddress,
        zip_code: zipCode,
        first_name: name, // If allowing name update
        // farm_name: ... if we were editing farm name here
      };

      if ((authApi as any).updateExtendedProfile) {
        await (authApi as any).updateExtendedProfile(profileData);
      } else {
        await (authApi as any).updateProfile(profileData);
      }

      await loadUserProfile();
      Alert.alert('성공', '회원정보가 수정되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '수정 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const { API_CONFIG: cfg } = require('../../constants/config');
    return `${cfg.BASE_URL.replace('/api', '')}${url}`;
  };

  const handleEditAvatar = () => {
    Alert.alert(
      '아바타 변경',
      '원하는 방식을 선택하세요',
      [
        { text: '기본 캐릭터 선택', onPress: handleSelectPreset },
        { text: '앨범에서 선택', onPress: handlePickImage },
        { text: '카메라 촬영', onPress: handleTakePhoto },
        { text: '기본값으로 초기화', onPress: handleResetAvatar, style: 'destructive' },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const handleSelectPreset = () => {
    if (presets.length === 0) return;
    Alert.alert(
      '캐릭터 선택',
      '변경할 캐릭터를 선택하세요',
      [
        ...presets.map(p => ({
          text: p.name,
          onPress: async () => {
            try {
              await avatarApi.setPresetAvatar(p.key);
              loadAvatarInfo();
              Alert.alert('성공', '아바타가 변경되었습니다.');
            } catch (e) { Alert.alert('오류', '변경 실패'); }
          }
        })),
        { text: '취소', style: 'cancel' }
      ]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setIsLoading(true);
      await avatarApi.uploadAvatar(uri);
      await loadAvatarInfo();
      Alert.alert('성공', '사진이 업로드되었습니다.');
    } catch (e) {
      Alert.alert('오류', '업로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAvatar = async () => {
    try {
      await avatarApi.resetAvatar();
      loadAvatarInfo();
      Alert.alert('완료', '기본값으로 초기화되었습니다.');
    } catch (e) { }
  };


  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('알림', '새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setIsSaving(true);
      await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      Alert.alert('성공', '비밀번호가 변경되었습니다.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('오류', error.message || '비밀번호 변경 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          if (setUser) await setUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  // Render Helpers
  const avatarSource = avatarInfo?.avatar_url
    ? { uri: getAvatarUrl(avatarInfo.avatar_url) as string }
    : null;

  return (
    <ScreenWrapper title="계정 정보" showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarImage, { backgroundColor: '#F3F4F6', overflow: 'hidden' }]}>
              {avatarSource ? (
                <Image source={avatarSource} style={{ width: '100%', height: '100%' }} />
              ) : (
                <MaterialCommunityIcons name="account" size={60} color="#9CA3AF" />
              )}
            </View>

            <TouchableOpacity
              style={styles.editAvatarIcon}
              onPress={handleEditAvatar}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <Text style={styles.label}>이름</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름" />

          <Text style={styles.label}>이메일</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={userId} editable={false} />

          <Text style={styles.label}>전화번호</Text>
          <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

          <Text style={styles.label}>주소</Text>
          <TouchableOpacity onPress={() => setShowAddressSearch(true)}>
            <TextInput style={styles.input} value={address} placeholder="주소 검색" editable={false} pointerEvents="none" />
          </TouchableOpacity>
          <TextInput style={styles.input} value={detailAddress} onChangeText={setDetailAddress} placeholder="상세 주소" />

          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={isSaving}>
            <Text style={styles.buttonText}>{isSaving ? '저장 중...' : '저장'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>비밀번호 변경</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="현재 비밀번호" secureTextEntry />
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="새 비밀번호" secureTextEntry />
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="비밀번호 확인" secureTextEntry />
          <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={handleChangePassword} disabled={isSaving}>
            <Text style={styles.buttonText}>비밀번호 변경</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: 'red', fontSize: 16 }}>로그아웃</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <AddressSearchModal
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelectAddress={(addr) => { // Correct prop name
          setAddress(addr.roadAddr);
          setZipCode(addr.zipNo);
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: { width: 100, height: 100, position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
  editAvatarIcon: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#3B82F6', padding: 6, borderRadius: 15, borderWidth: 2, borderColor: 'white' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 },
  disabledInput: { backgroundColor: '#f5f5f5', color: '#999' },
  button: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center' },
  blueButton: { backgroundColor: '#3B82F6' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  footer: { alignItems: 'center', marginTop: 20, marginBottom: 40 }
});

export default AccountSettingsScreen;
