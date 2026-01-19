// exifExtractor.ts - EXIF 데이터 추출 (Expo-compatible)
import * as Location from 'expo-location';
import { Platform } from 'react-native';

// React Native Image Picker Asset 타입 정의 (필요한 부분만)
export interface RNImagePickerAsset {
  uri?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  fileName?: string;
  timestamp?: string; // ISO string
  type?: string;
  // EXIF 데이터는 별도 라이브러리 없이는 RN ImagePicker에서 직접 제공하지 않을 수 있음
  // 필요 시 react-native-exif-reader 등 추가 필요
  exif?: Record<string, any>;
}

export interface ExifData {
  capturedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * ImagePicker result에서 EXIF 데이터 추출
 * (Pure RN에서는 기본 Image Picker가 EXIF를 제공하지 않을 수 있어, timestamp 및 현재 위치 Fallback 중요)
 */
export const extractExifData = async (asset: RNImagePickerAsset): Promise<ExifData> => {
  console.log('🔍 [EXIF] 데이터 추출 시작:', asset.uri);

  try {
    // 1. 촬영 날짜 추출
    let capturedAt = new Date();

    if (asset.timestamp) {
      capturedAt = new Date(asset.timestamp);
      console.log('📅 [EXIF] Timestamp 날짜:', capturedAt);
    } else if (asset.exif) {
      // EXIF 객체가 있다면 (다른 라이브러리 연동 시)
      const dateString = asset.exif.DateTimeOriginal || asset.exif.DateTime;
      if (dateString) {
        // EXIF 날짜 형식: "2023:11:28 14:30:45"
        const parts = dateString.split(' ');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [year, month, day] = datePart.split(':');
          const [hour, minute, second] = timePart.split(':');
          capturedAt = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );
        }
      }
    }

    // 2. GPS 위치 정보 추출
    let location: { latitude: number; longitude: number } | undefined;

    if (asset.exif?.GPSLatitude && asset.exif?.GPSLongitude) {
      // GPS 좌표 변환 로직 (기존과 동일)
      const latitude = convertGPSCoordinate(
        asset.exif.GPSLatitude,
        asset.exif.GPSLatitudeRef
      );
      const longitude = convertGPSCoordinate(
        asset.exif.GPSLongitude,
        asset.exif.GPSLongitudeRef
      );

      if (latitude !== null && longitude !== null) {
        location = { latitude, longitude };
        console.log('📍 [EXIF] GPS 위치:', location);
      }
    }

    // GPS 정보가 없으면 현재 위치 사용
    if (!location) {
      console.log('⚠️ [EXIF] GPS 정보 없음, 현재 위치 사용 시도');
      location = await getCurrentLocation();
    }

    return {
      capturedAt,
      location,
    };
  } catch (error) {
    console.error('❌ [EXIF] 추출 실패:', error);
    return {
      capturedAt: new Date(),
    };
  }
};

/**
 * GPS 좌표 변환 (EXIF 형식 → 십진수)
 */
const convertGPSCoordinate = (coordinate: any, ref: string): number | null => {
  try {
    if (Array.isArray(coordinate)) {
      const [degrees, minutes, seconds] = coordinate;
      let decimal = degrees + minutes / 60 + seconds / 3600;

      // S (남위) 또는 W (서경)인 경우 음수로 변환
      if (ref === 'S' || ref === 'W') {
        decimal *= -1;
      }

      return decimal;
    } else if (typeof coordinate === 'number') {
      // 이미 십진수인 경우 (라이브러리에 따라 다름)
      return coordinate;
    }
    return null;
  } catch (error) {
    console.error('❌ [GPS] 좌표 변환 실패:', error);
    return null;
  }
};

/**
 * 위치 권한 요청
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    console.log('📍 [위치 권한] 요청 시작');
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      console.log('✅ [위치 권한] 승인됨');
      return true;
    } else {
      console.log('❌ [위치 권한] 거부됨');
      return false;
    }
  } catch (error) {
    console.error('❌ [위치 권한] 요청 실패:', error);
    return false;
  }
};

/**
 * 현재 위치 가져오기
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | undefined> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    console.log('✅ [위치] 현재 위치:', location.coords);
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('❌ [위치] 가져오기 실패:', error);
    return undefined;
  }
};


