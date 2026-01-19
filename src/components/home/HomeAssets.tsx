import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect, Ellipse } from 'react-native-svg';

// 1. AI Diagnosis (Scanning a Leaf)
export const DiagnosisIllustration = (props: any) => (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
        <Defs>
            <LinearGradient id="scanGradient" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#34D399" stopOpacity="0.8" />
                <Stop offset="1" stopColor="#059669" stopOpacity="0.1" />
            </LinearGradient>
            <LinearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#4ADE80" />
                <Stop offset="1" stopColor="#15803D" />
            </LinearGradient>
        </Defs>
        {/* Circle BG */}
        <Circle cx="50" cy="50" r="45" fill="#DCFCE7" />

        {/* Leaf Shape */}
        <Path
            d="M50 25 C50 25 70 20 80 40 C90 60 70 80 50 80 C30 80 10 60 20 40 C30 20 50 25 50 25 Z"
            fill="url(#leafGrad)"
        />
        <Path d="M50 25 L50 80" stroke="#14532D" strokeWidth="2" strokeLinecap="round" />
        <Path d="M50 45 L70 35 M50 60 L70 50 M50 45 L30 35 M50 60 L30 50" stroke="#166534" strokeWidth="2" strokeLinecap="round" />

        {/* Scan Scan Line */}
        <Rect x="20" y="48" width="60" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
        <Path d="M25 20 L20 20 L20 30 M75 20 L80 20 L80 30 M25 80 L20 80 L20 70 M75 80 L80 80 L80 70" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    </Svg>
);

// 2. AI Counselor (Chat Bot)
export const CounselorIllustration = (props: any) => (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
        <Defs>
            <LinearGradient id="chatGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#60A5FA" />
                <Stop offset="1" stopColor="#2563EB" />
            </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="#DBEAFE" />

        {/* Chat Bubble */}
        <Path
            d="M20 35 C20 26.7 26.7 20 35 20 H65 C73.3 20 80 26.7 80 35 V55 C80 63.3 73.3 70 65 70 H35 L20 85 V35 Z"
            fill="url(#chatGrad)"
        />
        {/* Eyes */}
        <Circle cx="40" cy="45" r="4" fill="white" />
        <Circle cx="60" cy="45" r="4" fill="white" />
        {/* Smile */}
        <Path d="M42 58 Q50 64 58 58" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* Antenna */}
        <Path d="M50 20 L50 10" stroke="#2563EB" strokeWidth="3" />
        <Circle cx="50" cy="8" r="3" fill="#EF4444" />
    </Svg>
);

// 3. Farming Log (Notebook + Sun)
export const LogIllustration = (props: any) => (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
        <Defs>
            <LinearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FBBF24" />
                <Stop offset="1" stopColor="#D97706" />
            </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="#FEF3C7" />

        {/* Notebook */}
        <Rect x="25" y="20" width="50" height="60" rx="4" fill="white" stroke="#D97706" strokeWidth="2" />
        <Rect x="25" y="20" width="10" height="60" fill="#D97706" />
        {/* Lines */}
        <Path d="M40 35 H70 M40 45 H70 M40 55 H70 M40 65 H55" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />

        {/* Plant Growing */}
        <Path d="M65 65 Q65 50 75 45" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="75" cy="45" r="3" fill="#10B981" />
    </Svg>
);

// 4. Canopy Rate (Trees/Sun)
export const CanopyIllustration = (props: any) => (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
        <Defs>
            <LinearGradient id="treeGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#10B981" />
                <Stop offset="1" stopColor="#047857" />
            </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="#ECFDF5" />

        {/* Sun */}
        <Circle cx="75" cy="25" r="8" fill="#F59E0B" />

        {/* Canopy / Trees */}
        <Path d="M20 80 L20 60 Q35 30 50 60 Q65 30 80 60 L80 80 Z" fill="url(#treeGrad)" />
        <Rect x="45" y="80" width="10" height="10" fill="#92400E" />

        {/* Rays passing through */}
        <Path d="M70 30 L60 50" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 2" />
        <Path d="M80 30 L85 50" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 2" />
    </Svg>
);

// 5. Help (Lightbulb/Question)
export const HelpIllustration = (props: any) => (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
        <Defs>
            <LinearGradient id="helpGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#8B5CF6" />
                <Stop offset="1" stopColor="#6D28D9" />
            </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="#F3E8FF" />

        {/* Question Mark */}
        <Path
            d="M35 35 C35 20 65 20 65 35 C65 45 50 45 50 55 V60"
            stroke="url(#helpGrad)"
            strokeWidth="8"
            strokeLinecap="round"
        />
        <Circle cx="50" cy="75" r="5" fill="#6D28D9" />

        {/* Sparkles */}
        <Path d="M25 25 L30 30 M75 25 L70 30 M25 75 L30 70 M75 75 L70 70" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />
    </Svg>
);

// 6. Check List (Clipboard)
export const CheckIllustration = (props: any) => (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
        <Defs>
            <LinearGradient id="checkGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#A78BFA" />
                <Stop offset="1" stopColor="#7C3AED" />
            </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="#F3E8FF" />

        {/* Clipboard */}
        <Rect x="30" y="20" width="40" height="60" rx="4" fill="white" stroke="#7C3AED" strokeWidth="2" />
        {/* Clip */}
        <Rect x="40" y="15" width="20" height="10" rx="2" fill="#7C3AED" />

        {/* Checks */}
        <Circle cx="40" cy="35" r="3" fill="#10B981" />
        <Rect x="48" y="33" width="15" height="4" rx="2" fill="#E5E7EB" />

        <Circle cx="40" cy="50" r="3" fill="#10B981" />
        <Rect x="48" y="48" width="15" height="4" rx="2" fill="#E5E7EB" />

        <Circle cx="40" cy="65" r="3" fill="#E5E7EB" />
        <Rect x="48" y="63" width="15" height="4" rx="2" fill="#E5E7EB" />

        {/* Magnifying Glass Overlay */}
        <Circle cx="65" cy="65" r="14" fill="rgba(255,255,255,0.8)" stroke="#7C3AED" strokeWidth="2" />
        <Path d="M75 75 L82 82" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
    </Svg>
);

export const WeatherSunIcon = (props: any) => (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" {...props}>
        <Circle cx="12" cy="12" r="5" fill="#F59E0B" />
        <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);
