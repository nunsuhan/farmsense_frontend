import apiClient from './api';
import { API_CONFIG } from '../constants/config';
import * as ImageManipulator from 'expo-image-manipulator';

export interface AvatarPreset {
    key: string;
    name: string;
    url: string;
}

export interface AvatarInfo {
    avatar_type: 'preset' | 'custom';
    preset_avatar: string | null;
    custom_image_url: string | null;
    avatar_url: string;
}

// 파일 확장자에서 MIME type 추출
function getMimeType(uri: string): string {
    const ext = uri.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        default: return 'image/jpeg';
    }
}

/**
 * 업로드 전 이미지 압축/리사이즈
 * - 최대 1024x1024로 리사이즈 (프로필 사진은 이 정도면 충분)
 * - JPEG 70% 품질로 재인코딩 → 보통 3~8MB 사진이 200~500KB로 줄어듦
 * - GIF는 애니메이션 보존 위해 원본 그대로 반환
 */
async function compressImage(uri: string): Promise<string> {
    const ext = uri.split('.').pop()?.toLowerCase() || '';

    // GIF는 애니메이션 손실되므로 압축 스킵
    if (ext === 'gif') {
        console.log('[avatarApi] GIF detected, skipping compression');
        return uri;
    }

    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],  // 가로 1024px, 세로는 비율 유지
            {
                compress: 0.7,                             // 70% 품질
                format: ImageManipulator.SaveFormat.JPEG,  // 항상 JPEG로 통일
            }
        );
        console.log('[avatarApi] Compressed:', uri, '→', result.uri);
        return result.uri;
    } catch (e) {
        console.warn('[avatarApi] Compression failed, using original:', e);
        return uri;  // 실패 시 원본으로 폴백 (업로드는 시도)
    }
}

export const avatarApi = {
    // 1. 내 아바타 조회
    getMyAvatar: async (): Promise<AvatarInfo> => {
        const response = await apiClient.get('/users/avatar/');
        return response.data;
    },

    // 2. 기본 아바타 선택
    setPresetAvatar: async (presetKey: string): Promise<AvatarInfo> => {
        const response = await apiClient.put('/users/avatar/', {
            preset_avatar: presetKey
        });
        return response.data;
    },

    // 3. 사용자 이미지 업로드 (apiClient 사용 → 토큰 자동 갱신)
    uploadAvatar: async (imageUri: string): Promise<any> => {
        // 업로드 전 자동 압축 (GIF 제외)
        const processedUri = await compressImage(imageUri);

        const formData = new FormData();
        // 압축 후엔 JPEG로 통일되므로 확장자도 강제로 .jpg
        const isGif = imageUri.split('.').pop()?.toLowerCase() === 'gif';
        const filename = isGif
            ? (imageUri.split('/').pop() || 'avatar.gif')
            : 'avatar.jpg';
        const mimeType = getMimeType(filename);

        formData.append('image', {
            uri: processedUri,
            type: mimeType,
            name: filename,
        } as any);

        const response = await apiClient.post('/users/avatar/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
        });

        return response.data;
    },

    // 4. 기본 아바타로 초기화
    resetAvatar: async (): Promise<void> => {
        await apiClient.delete('/users/avatar/');
    },

    // 5. 기본 아바타 목록 조회
    getPresets: async (): Promise<AvatarPreset[]> => {
        const response = await apiClient.get<{ presets: AvatarPreset[] }>('/users/avatar/presets/');
        return response.data.presets;
    }
};

export default avatarApi;
