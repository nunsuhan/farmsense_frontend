/**
 * Market API Service
 * Week 7 Day 4
 * 
 * 시장 정보 API 호출 함수들
 */

import apiClient from './api';

export interface WholesalePrice {
  item_name: string;
  current_price: number;
  prev_price: number;
  change_rate: number;
  unit: string;
  date: string;
  market: string;
}

export interface RetailPrice {
  item_name: string;
  current_price: number;
  prev_price: number;
  change_rate: number;
  unit: string;
  date: string;
  location: string;
}

export interface TechInfo {
  title: string;
  content: string;
  month: number;
  crop: string;
}

export interface MarketPricesResponse {
  success: boolean;
  wholesale: WholesalePrice;
  retail: RetailPrice;
}

export interface MonthlyTechInfoResponse {
  success: boolean;
  month: number;
  tech_info: TechInfo[];
}

export interface ComprehensiveMarketInfoResponse {
  success: boolean;
  wholesale_price: WholesalePrice;
  retail_price: RetailPrice;
  monthly_tech: TechInfo[];
  price_trend: 'rising' | 'falling' | 'stable';
  recommendation: string;
  updated_at: string;
}

/**
 * 도매/소매 가격 조회
 */
export const getMarketPrices = async (crop: string = '포도'): Promise<MarketPricesResponse> => {
  const response = await apiClient.get(`/market/prices/`, {
    params: { crop }
  });
  return response.data;
};

/**
 * 월간 농업기술 정보 조회
 */
export const getMonthlyTechInfo = async (month?: number): Promise<MonthlyTechInfoResponse> => {
  const response = await apiClient.get(`/market/tech-info/`, {
    params: month ? { month } : {}
  });
  return response.data;
};

/**
 * 종합 시장 정보 조회
 */
export const getComprehensiveMarketInfo = async (crop: string = '포도'): Promise<ComprehensiveMarketInfoResponse> => {
  const response = await apiClient.get(`/market/comprehensive/`, {
    params: { crop }
  });
  return response.data;
};

export default {
  getMarketPrices,
  getMonthlyTechInfo,
  getComprehensiveMarketInfo,
};

