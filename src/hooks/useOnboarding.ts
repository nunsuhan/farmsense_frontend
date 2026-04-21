import { useState, useCallback } from 'react';

export type OnboardingStep = 'WELCOME' | 'PHONE' | 'VERIFY' | 'PLAN' | 'CARD' | 'DONE';

const ORDER: OnboardingStep[] = ['WELCOME', 'PHONE', 'VERIFY', 'PLAN', 'CARD', 'DONE'];

export interface OnboardingState {
  step: OnboardingStep;
  phone: string;
  code: string;
  token: string;
  customerKey: string;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    step: 'WELCOME', phone: '', code: '', token: '', customerKey: '',
  });

  const next = useCallback(() => {
    setState((s) => {
      const idx = ORDER.indexOf(s.step);
      return { ...s, step: ORDER[Math.min(idx + 1, ORDER.length - 1)] };
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
      const idx = ORDER.indexOf(s.step);
      return { ...s, step: ORDER[Math.max(idx - 1, 0)] };
    });
  }, []);

  const goto = useCallback((step: OnboardingStep) => {
    setState((s) => ({ ...s, step }));
  }, []);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  return { state, next, prev, goto, update };
}
