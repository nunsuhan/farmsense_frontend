// 인증 + 결제 API service
// 모든 API는 Django 백엔드(api.farmsense.kr) 직접 호출
import apiClient from './api';
import { TOSS_CONFIG } from '../constants/config';

// === 인증 ===
export interface SendCodeResponse { success: boolean; expires_in?: number; error?: string; }
export interface VerifyResponse { token: string; refresh: string; is_new_user: boolean; }

// === 결제 ===
export interface CheckoutResponse {
  checkout_url: string;
  success_url: string;
  fail_url: string;
  customer_key: string;
}
export interface ConfirmBillingResponse { success: boolean; trial_end?: string; card_last4?: string; message?: string; }
export interface SubscriptionInfo {
  plan: 'monthly' | 'yearly';
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_end?: string;
  next_billing_date?: string;
  card_last4?: string;
  amount?: number;
}

const authService = {
  // ── 인증 (알리고 SMS) ──

  async sendPhoneCode(phone: string): Promise<SendCodeResponse> {
    const res = await apiClient.post('/v1/auth/phone/send/', { phone });
    return res.data;
  },

  async verifyPhoneCode(phone: string, code: string): Promise<VerifyResponse> {
    const res = await apiClient.post('/v1/auth/phone/verify/', { phone, code });
    return res.data;
  },

  // ── 결제 (토스페이먼츠) ──

  async createCheckout(plan: 'monthly' | 'yearly' = 'monthly'): Promise<CheckoutResponse> {
    const res = await apiClient.post('/v1/billing/checkout/create/', {
      client_key: TOSS_CONFIG.CLIENT_KEY,
      plan,
    });
    return res.data;
  },

  async confirmBilling(authKey: string, customerKey: string): Promise<ConfirmBillingResponse> {
    const res = await apiClient.post('/v1/billing/confirm/', {
      auth_key: authKey,
      customer_key: customerKey,
    });
    return res.data;
  },

  async getSubscription(): Promise<SubscriptionInfo> {
    const res = await apiClient.get('/v1/billing/subscription/');
    return res.data;
  },

  async cancelSubscription(): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.post('/v1/billing/subscription/cancel/');
    return res.data;
  },
};

export default authService;
