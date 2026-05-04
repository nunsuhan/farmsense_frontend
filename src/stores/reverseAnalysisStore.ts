// src/stores/reverseAnalysisStore.ts

import { create } from 'zustand';
import { reverseAnalysisApi, AnalysisResult, TargetAnalysisRequest } from '../services/reverseAnalysisApi';

interface ReverseAnalysisState {
    // 입력
    targetProduction: number;
    startDate: string; // Add defaults
    endDate: string;

    // 결과
    analysisResult: AnalysisResult | null;

    // 로딩/에러
    isLoading: boolean;
    error: string | null;

    // 액션
    setTargetProduction: (value: number) => void;
    setDateRange: (start: string, end: string) => void;
    runAnalysis: (farmId: string | number, crpsnSn: string) => Promise<void>;
    reset: () => void;
}

export const useReverseAnalysisStore = create<ReverseAnalysisState>((set, get) => ({
    targetProduction: 5000,
    startDate: '2025-03-01',
    endDate: '2025-09-30',
    analysisResult: null,
    isLoading: false,
    error: null,

    setTargetProduction: (value) => set({ targetProduction: value }),
    setDateRange: (start, end) => set({ startDate: start, endDate: end }),

    runAnalysis: async (farmId, crpsnSn) => {
        set({ isLoading: true, error: null });

        try {
            const request: TargetAnalysisRequest = {
                fclty_id: String(farmId),
                crpsn_sn: crpsnSn,
                target_production: get().targetProduction,
                fixplntng_de: get().startDate,
                crpsn_end_de: get().endDate
            };

            const result = await reverseAnalysisApi.analyze(request);
            set({ analysisResult: result, isLoading: false });
        } catch (error: any) {
            console.error("Analysis failed", error);
            set({
                error: error.message || '분석 중 오류가 발생했습니다',
                isLoading: false,
                // Mock result on error for demo if needed, but user didn't ask for it here.
                // We'll trust the API or handle it in the UI.
            });
        }
    },

    reset: () => set({
        targetProduction: 5000,
        analysisResult: null,
        error: null
    })
}));
