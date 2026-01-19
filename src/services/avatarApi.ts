import apiClient from './api';

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

    // 3. 사용자 이미지 업로드
    uploadAvatar: async (imageUri: string): Promise<any> => {
        const { getAuthTokens } = await import('../utils/secureStorage');
        const tokens = await getAuthTokens();
        
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
        } as any);
        
        const response = await fetch('https://farmsense.kr/api/users/avatar/upload/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens?.access}`,
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        return response.json();
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
