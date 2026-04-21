// GrowthDiaryScreen - 성장일지 (간소화 버전 - Pure RN)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../components/common/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  savePhotoLocally,
  getLocalPhotos,
  getPendingUploadCount,
  deleteLocalPhoto,
  type LocalPhoto
} from '../utils/photoStorage';
import { extractExifData } from '../utils/exifExtractor';
import { getGrapeSchedules, getCurrentMonthTasks } from '../services/nongsaroApi';
// import { uploadPendingPhotos, isWiFiConnected, setupAutoUploadListener } from '../utils/autoUploader'; // 임시 비활성화

// 안내 모달 표시 여부를 저장하는 키
const GUIDE_SHOWN_KEY = 'hasSeenGrowthDiaryGuide';

const GrowthDiaryScreen = () => {
  const navigation = useNavigation<any>();
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isWiFi, setIsWiFi] = useState(false); // 임시로 유지 (UI 표시용)
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [currentMonthTask, setCurrentMonthTask] = useState<string>('');

  // 초기 로드
  useEffect(() => {
    loadPhotos();
    // checkWiFiStatus(); // 임시 비활성화
    checkFirstLaunch();
    fetchSchedule();

    // 자동 업로드 리스너 등록 (임시 비활성화)
    // const unsubscribe = setupAutoUploadListener();
    // return () => {
    //   unsubscribe();
    // };
  }, []);

  // 농작업 일정 로드
  const fetchSchedule = async () => {
    try {
      const fullSchedule = await getGrapeSchedules();
      setSchedule(fullSchedule.schedules || []);

      const distinctTasks = await getCurrentMonthTasks();
      const taskStr = distinctTasks.map(t => t.operation_name).join(', ');
      setCurrentMonthTask(taskStr);
    } catch (e) {
      console.log('Calendar load failed', e);
    }
  };

  // 사진 목록 로드
  const loadPhotos = async () => {
    try {
      const loadedPhotos = await getLocalPhotos();
      setPhotos(loadedPhotos);

      const count = await getPendingUploadCount();
      setPendingCount(count);

      console.log(`📸 [성장일지] 사진 ${loadedPhotos.length}장 로드 (업로드 대기: ${count}장)`);
    } catch (error) {
      console.error('❌ [성장일지] 로드 실패:', error);
    }
  };

  // 첫 실행 확인 (안내 모달)
  const checkFirstLaunch = async () => {
    try {
      const hasShown = await AsyncStorage.getItem(GUIDE_SHOWN_KEY);

      if (!hasShown) {
        // 처음 방문하는 경우에만 모달 표시
        setShowWelcomeModal(true);
      }
    } catch (error) {
      console.error('❌ [성장일지] 안내 확인 실패:', error);
    }
  };

  // 안내 모달 "시작하기" 버튼 핸들러
  const handleStartGuide = async () => {
    try {
      await AsyncStorage.setItem(GUIDE_SHOWN_KEY, 'true');
      setShowWelcomeModal(false);
      showToast('📸 사진을 촬영해보세요!');
    } catch (error) {
      console.error('❌ [성장일지] 안내 플래그 저장 실패:', error);
      setShowWelcomeModal(false);
    }
  };

  // 카메라 촬영
  const takePhoto = async () => {
    try {
      console.log('📷 [성장일지] 사진 촬영 시작');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        exif: true,
      });

      if (result.canceled) {
        console.log('⚠️ [성장일지] 촬영 취소됨');
        return;
      }

      const asset = result.assets[0];
      if (!asset || !asset.uri) {
        Alert.alert('오류', '사진 정보를 가져오지 못했습니다.');
        return;
      }

      console.log('✅ [성장일지] 촬영 완료:', asset.uri);

      // EXIF 데이터 추출
      // Expo ImagePicker result matches the expected format partially, but we might need to map it
      // extractExifData expects RNImagePickerAsset-like object.
      const exifData = await extractExifData(asset as any);

      // 로컬 저장
      await savePhotoLocally(asset.uri, {
        capturedAt: exifData.capturedAt,
        location: exifData.location,
      });

      // UI 업데이트
      await loadPhotos();

      // 토스트 메시지
      showToast('✅ 사진이 저장되었습니다!');

    } catch (error) {
      console.error('❌ [성장일지] 촬영 실패:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  // 갤러리에서 선택
  const pickImage = async () => {
    try {
      console.log('🖼️ [성장일지] 갤러리 열기');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        exif: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (!asset || !asset.uri) {
        return;
      }

      console.log('✅ [성장일지] 사진 선택:', asset.uri);

      const exifData = await extractExifData(asset as any);

      await savePhotoLocally(asset.uri, {
        capturedAt: exifData.capturedAt,
        location: exifData.location,
      });

      await loadPhotos();
      showToast('✅ 사진이 저장되었습니다!');

    } catch (error) {
      console.error('❌ [성장일지] 갤러리 선택 실패:', error);
      Alert.alert('오류', '사진 선택에 실패했습니다.');
    }
  };

  // 수동 업로드 (임시 비활성화)
  const handleManualUpload = async () => {
    showToast('업로드 기능은 곧 활성화됩니다!');
  };

  // 사진 삭제
  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      '삭제 확인',
      '이 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocalPhoto(photoId);
              await loadPhotos();
              showToast('사진이 삭제되었습니다');
            } catch (error) {
              console.error('❌ [삭제] 실패:', error);
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 토스트 메시지
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  // 사진 항목 렌더링
  const renderPhoto = ({ item }: { item: LocalPhoto }) => (
    <View style={styles.photoCard}>
      <Image source={{ uri: item.uri }} style={styles.photoImage} />

      <View style={styles.photoInfo}>
        <Text style={styles.photoDate}>
          {item.capturedAt.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        {item.location && (
          <Text style={styles.photoLocation}>
            📍 {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
          </Text>
        )}

        <View style={styles.photoStatus}>
          {item.uploaded ? (
            <Text style={styles.statusUploaded}>✅ 업로드 완료</Text>
          ) : (
            <Text style={styles.statusPending}>⏳ 업로드 대기 중</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePhoto(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper title="성장 일지" showMenu={false}>
      {/* 상단 정보 */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{photos.length}</Text>
            <Text style={styles.statLabel}>전체 사진</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>업로드 대기</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{isWiFi ? '📶' : '📵'}</Text>
            <Text style={styles.statLabel}>{isWiFi ? 'WiFi' : '모바일'}</Text>
          </View>
        </View>

        {/* 수동 업로드 버튼 */}
        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleManualUpload}
            disabled={loading}
          >
            <Text style={styles.uploadButtonText}>
              {loading ? '업로드 중...' : `📤 지금 바로 올리기 (${pendingCount}장)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 사진 목록 */}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* 이달의 농작업 카드 */}
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>📅 이달의 농작업</Text>
                <Text style={styles.calendarMonth}>{new Date().getMonth() + 1}월</Text>
              </View>
              <Text style={styles.calendarTask}>
                {currentMonthTask || '일정 정보를 불러오는 중입니다...'}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyTitle}>성장 과정을 기록하세요</Text>
            <Text style={styles.emptyText}>
              사진만 찍어두시면{'\n'}
              WiFi 연결 시 자동으로 업로드됩니다
            </Text>
          </View>
        }
      />

      {/* 촬영 버튼 (고정) */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
          <Text style={styles.actionEmoji}>📷</Text>
          <Text style={styles.actionText}>촬영</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Text style={styles.actionEmoji}>🖼️</Text>
          <Text style={styles.actionText}>갤러리</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#059669' }]}
          onPress={() => navigation.navigate('LogWrite')}
        >
          <Text style={styles.actionEmoji}>✍️</Text>
          <Text style={styles.actionText}>일지작성</Text>
        </TouchableOpacity>
      </View>

      {/* 안내 모달 */}
      <Modal
        visible={showWelcomeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowWelcomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.welcomeModal}>
            <Text style={styles.welcomeTitle}>📸 성장일지 사용법</Text>

            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNumber}>1️⃣</Text>
              <Text style={styles.welcomeStepText}>사진만 찍어두세요!</Text>
            </View>

            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNumber}>2️⃣</Text>
              <Text style={styles.welcomeStepText}>WiFi 연결 시 자동 업로드됩니다</Text>
            </View>

            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNumber}>3️⃣</Text>
              <Text style={styles.welcomeStepText}>AI가 생육 단계를 자동 분석합니다</Text>
            </View>

            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNumber}>4️⃣</Text>
              <Text style={styles.welcomeStepText}>재배 패턴 분석에 활용됩니다</Text>
            </View>

            <TouchableOpacity
              style={styles.welcomeButton}
              onPress={handleStartGuide}
            >
              <Text style={styles.welcomeButtonText}>시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && <LoadingSpinner />}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  // 캘린더 스타일
  calendarCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
  },
  calendarMonth: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  calendarTask: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
  },
  photoInfo: {
    padding: 12,
  },
  photoDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  photoLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  photoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusUploaded: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  statusPending: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeStepNumber: {
    fontSize: 24,
    marginRight: 12,
  },
  welcomeStepText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  welcomeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  welcomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GrowthDiaryScreen;
