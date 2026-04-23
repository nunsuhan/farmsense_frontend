// 인증 API service (알리고 SMS)
import apiClient from './api';

export interface SendCodeResponse { success: boolean; expires_in?: number; error?: string; }
export interface VerifyResponse { token: string; refresh: string; is_new_user: boolean; }

const authService = {
  async sendPhoneCode(phone: string): Promise<SendCodeResponse> {
    const res = await apiClient.post('/v1/auth/phone/send/', { phone });
    return res.data;
  },

  async verifyPhoneCode(phone: string, code: string): Promise<VerifyResponse> {
    const res = await apiClient.post('/v1/auth/phone/verify/', { phone, code });
    return res.data;
  },
};

export default authService;
