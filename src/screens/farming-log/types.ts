export interface LogImage {
    id: string;
    uri: string;
}

export interface MaterialUsage {
    id: string;
    name: string; // 자재명 (예: 요소비료)
    amount: number;
    unit: string; // kg, L, 개
}

export type WorkCategory = 'irrigation' | 'pest_control' | 'fertilizer' | 'harvest' | 'management' | 'other';

export interface FarmingLogEntry {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    weather: {
        condition: string;
        temp: number;
    };
    category: WorkCategory;
    title: string;
    content: string;
    images: LogImage[];
    materials: MaterialUsage[];
    workers: string[]; // 함께한 작업자
}

export const CATEGORY_LABELS: Record<WorkCategory, { label: string; icon: string; color: string }> = {
    irrigation: { label: '관수', icon: 'water', color: '#3B82F6' },
    pest_control: { label: '병해충 방제', icon: 'bug', color: '#EF4444' },
    fertilizer: { label: '비료/영양', icon: 'bottle-tonic', color: '#F59E0B' },
    harvest: { label: '수확', icon: 'basket', color: '#10B981' },
    management: { label: '시설 관리', icon: 'home-analytics', color: '#6366F1' },
    other: { label: '기타', icon: 'notebook', color: '#6B7280' },
};
