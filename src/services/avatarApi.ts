import apiClient from './api';
import { API_CONFIG } from '../constants/config';

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
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const mimeType = getMimeType(filename);

        formData.append('image', {
            uri: imageUri,
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
