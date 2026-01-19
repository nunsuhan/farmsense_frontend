export interface SafetyCheck {
    id: string;
    name: string; // 농약명
    company: string; // 제조사
    crop: string; // 대상 작물 (e.g., 포도)
    dilution: string; // 희석 배수
    preHarvestInterval: number; // 수확 전 사용 금지 기간 (PHI)
    maxCount: number; // 작기 내 최대 사용 횟수
    riskLevel: 'safe' | 'warning' | 'danger';
    notes: string;
}

export const MOCK_PESTICIDES: SafetyCheck[] = [
    {
        id: 'p1', name: '다이센엠-45', company: '경농', crop: '포도',
        dilution: '500배', preHarvestInterval: 45, maxCount: 5,
        riskLevel: 'safe', notes: '개화기 사용 주의'
    },
    {
        id: 'p2', name: '스미치온', company: '동방아그로', crop: '포도',
        dilution: '1000배', preHarvestInterval: 30, maxCount: 3,
        riskLevel: 'warning', notes: '꿀벌 독성 강함'
    },
];
