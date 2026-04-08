// Onboarding auth + billing API service
import apiClient from './api';

export interface SendCodeResponse { success: boolean; expires_in?: number; error?: string; }
export interface VerifyResponse { token: string; refresh: string; is_new_user: boolean; }
export interface CheckoutResponse {
  checkout_url: string;
  success_url: string;
  fail_url: string;
  customer_key: string;
}
export interface ConfirmBillingResponse { success: boolean; trial_end?: string; card_last4?: string; message?: string; }

const authService = {
  async sendPhoneCode(phone: string): Promise<SendCodeResponse> {
    const res = await apiClient.post('/v1/auth/phone/send/', { phone });
    return res.data;
  },

  async verifyPhoneCode(phone: string, code: string): Promise<VerifyResponse> {
    const res = await apiClient.post('/v1/auth/phone/verify/', { phone, code });
    return res.data;
  },

  async createCheckout(): Promise<CheckoutResponse> {
    const res = await apiClient.post('/v1/billing/checkout/create/', {});
    return res.data;
  },

  async confirmBilling(authKey: string, customerKey: string): Promise<ConfirmBillingResponse> {
    const res = await apiClient.post('/v1/billing/confirm/', {
      auth_key: authKey,
      customer_key: customerKey,
    });
    return res.data;
  },
};

export default authService;
