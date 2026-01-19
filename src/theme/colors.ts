// Design System Colors - Premium Nature Theme
export const colors = {
  // Primary Brand Colors (Grape/Nature)
  primary: '#10B981', // Vivid Green (Main Action)
  primaryDark: '#059669', // Darker Green (Pressed/Header)
  primaryLight: '#D1FAE5', // Light Green (Backgrounds/Chips)

  // Secondary/Accent
  secondary: '#8B5CF6', // Purple (Grape Context, AI)
  secondaryDark: '#7C3AED',
  secondaryLight: '#EDE9FE',
  // Accent Colors for Premium UI
  accentPrimary: '#FF6B6B', // Soft Red for gradients
  accentSecondary: '#FFD93D', // Warm Yellow for gradients

  // UI Neutrals
  background: '#FFFFFF', // White (App Background)
  surface: '#FFFFFF', // White (Cards)
  text: '#1F2937', // Dark Gray (Headings)
  textSub: '#6B7280', // Medium Gray (Body)
  textDisabled: '#9CA3AF', // Light Gray (Hints)
  border: '#E5E7EB', // Borders

  card: {
    background: '#FFFFFF',
    border: '#E5E7EB',
  },

  // Semantic Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const softShadow = shadows.small;
export const neumorphismShadow = shadows.medium;

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case '안전': return colors.success;
    case '주의': return colors.warning;
    case '위험': return colors.error;
    default: return colors.info;
  }
};

export const getRiskText = (risk: string) => risk;

export const FarmSenseColors = colors;

