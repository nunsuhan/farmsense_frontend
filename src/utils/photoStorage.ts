// photoStorage.ts - 로컬 사진 저장 및 관리
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { DiagnosisResult } from '../services/api/diagnosis';

const STORAGE_KEY = 'growth_diary_photos';
const PHOTOS_DIR = `${FileSystem.documentDirectory}pending_photos`;

export interface LocalPhoto {
  id: string;
  uri: string;           // 로컬 파일 경로 (persistent path)
  originalUri?: string;  // 원본 갤러리/카메라 경로
  capturedAt: Date;      // 촬영 시간
  uploaded: boolean;     // 업로드 및 진단 완료 여부
  uploadedAt?: Date;
  diagnosisResult?: DiagnosisResult; // 진단 결과
  retryCount: number;
  location?: { latitude: number; longitude: number };
}

/**
 * 초기화: 사진 저장 디렉토리 생성
 */
const initStorage = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('❌ [PhotoStorage] 디렉토리 생성 실패:', error);
  }
};

// 초기화 실행
initStorage();

/**
 * 로컬에 사진 저장 (파일 이동 + 메타데이터 저장)
 */
export const savePhotoLocally = async (tempUri: string, photoData?: Partial<LocalPhoto>): Promise<LocalPhoto> => {
  try {
    await initStorage();

    const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${id}.jpg`;
    const destPath = `${PHOTOS_DIR}/${fileName}`;

    // 파일 이동 (또는 복사)
    try {
      await FileSystem.copyAsync({ from: tempUri, to: destPath });
    } catch (moveError) {
      console.warn('COPY failed, trying to read and write', moveError);
      // Fallback for some uri types
      const content = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
      await FileSystem.writeAsStringAsync(destPath, content, { encoding: FileSystem.EncodingType.Base64 });
    }

    const newPhoto: LocalPhoto = {
      id,
      uri: destPath, // FileSystem paths usually start with file:// but let's be careful
      originalUri: tempUri,
      capturedAt: new Date(),
      uploaded: false,
      retryCount: 0,
      ...photoData,
    };

    const existing = await getLocalPhotos();
    const updated = [newPhoto, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('✅ [PhotoStorage] 사진 저장 완료:', id);
    return newPhoto;
  } catch (error) {
    console.error('❌ [PhotoStorage] 저장 실패:', error);
    throw error;
  }
};

/**
 * 로컬 사진 목록 조회
 */
export const getLocalPhotos = async (): Promise<LocalPhoto[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const photos: LocalPhoto[] = JSON.parse(data);
    return photos.map(photo => ({
      ...photo,
      capturedAt: new Date(photo.capturedAt),
      uploadedAt: photo.uploadedAt ? new Date(photo.uploadedAt) : undefined,
    }));
  } catch (error) {
    console.error('❌ [PhotoStorage] 조회 실패:', error);
    return [];
  }
};

/**
 * 진단 결과 저장 및 처리 완료 표시
 */
export const saveDiagnosisResult = async (photoId: string, result: DiagnosisResult): Promise<void> => {
  try {
    const photos = await getLocalPhotos();
    const updated = photos.map(photo =>
      photo.id === photoId
        ? {
          ...photo,
          uploaded: true,
          uploadedAt: new Date(),
          diagnosisResult: result
        }
        : photo
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('✅ [PhotoStorage] 진단 결과 저장 완료:', photoId);
  } catch (error) {
    console.error('❌ [PhotoStorage] 결과 저장 실패:', error);
    throw error;
  }
};

/**
 * 특정 날짜에 처리된 사진 조회 (아침 알림용)
 */
export const getProcessedPhotos = async (date: Date): Promise<LocalPhoto[]> => {
  try {
    const photos = await getLocalPhotos();
    const targetDate = date.toISOString().split('T')[0];

    return photos.filter(photo =>
      photo.uploaded &&
      photo.uploadedAt &&
      photo.uploadedAt.toISOString().split('T')[0] === targetDate
    );
  } catch (error) {
    return [];
  }
};

/**
 * 업로드 성공 시: 로컬 파일 삭제 후 원격 URL로 교체 ("Auto Upload -> Delete" 요구사항 반영)
 */
export const promoteToRemote = async (photoId: string, remoteUrl: string, result: DiagnosisResult): Promise<void> => {
  try {
    const photos = await getLocalPhotos();
    const target = photos.find(p => p.id === photoId);

    if (target) {
      // 로컬 파일 삭제
      const path = target.uri; // Assuming full path stored
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path);
      }
      console.log('🗑️ [PhotoStorage] 로컬 파일 삭제 완료 (서버 저장됨):', photoId);
    }

    // 메타데이터 업데이트 (URI를 원격 URL로 변경)
    const updated = photos.map(photo =>
      photo.id === photoId
        ? {
          ...photo,
          uri: remoteUrl, // 원격 URL 사용 (앱에서 서버 다운로드/조회)
          uploaded: true,
          uploadedAt: new Date(),
          diagnosisResult: result
        }
        : photo
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('✅ [PhotoStorage] 원격 기록으로 전환 완료:', photoId);
  } catch (error) {
    console.error('❌ [PhotoStorage] 원격 전환 실패:', error);
    throw error;
  }
};

/**
 * 업로드 대기 중인 사진 목록 조회
 */
export const getPendingPhotos = async (): Promise<LocalPhoto[]> => {
  const photos = await getLocalPhotos();
  return photos.filter(photo => !photo.uploaded);
};

export const getPendingUploadCount = async (): Promise<number> => {
  const pending = await getPendingPhotos();
  return pending.length;
};

/**
 * 특정 사진 삭제
 */
export const deleteLocalPhoto = async (photoId: string): Promise<void> => {
  try {
    const photos = await getLocalPhotos();
    const target = photos.find(p => p.id === photoId);

    if (target) {
      // 실제 파일 삭제
      const path = target.uri;
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path);
      }
    }

    const updated = photos.filter(photo => photo.id !== photoId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('✅ [PhotoStorage] 사진 삭제 완료:', photoId);
  } catch (error) {
    console.error('❌ [PhotoStorage] 삭제 실패:', error);
    throw error;
  }
};

/**
 * 모든 로컬 사진 삭제 (테스트용)
 */
export const clearAllPhotos = async (): Promise<void> => {
  try {
    const photos = await getLocalPhotos();
    for (const photo of photos) {
      const path = photo.uri;
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path);
      }
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ [PhotoStorage] 모든 사진 삭제 완료');
  } catch (error) {
    console.error('❌ [PhotoStorage] 삭제 실패:', error);
    throw error;
  }
};









