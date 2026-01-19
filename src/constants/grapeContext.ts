// FarmSense 포도 컨텍스트 데이터 (TypeScript)
// 백엔드 slot_schema.py와 동기화 필수

// 1. 품종
export const GRAPE_VARIETIES = [
  { id: 'SHINE_MUSCAT', label: '샤인머스켓', keywords: ['샤인', '망고포도'] },
  { id: 'KYO_HO', label: '거봉', keywords: ['왕거봉', '자옥'] },
  { id: 'CAMPBELL_EARLY', label: '캠벨얼리', keywords: ['캠벨', '검은포도'] },
  { id: 'BLACK_SAPPHIRE', label: '블랙사파이어', keywords: ['가지포도', '스윗사파이어'] },
  { id: 'MBA', label: 'MBA', keywords: ['머루포도'] },
  { id: 'ALEXANDRIA', label: '알렉산드리아', keywords: [] },
  { id: 'OTHER', label: '기타', keywords: [] },
] as const;

// 2. 생육 단계 (10단계)
export const PHENOLOGY_STAGES = [
  { id: 'DORMANCY', label: '휴면기 (겨울)', months: [12, 1, 2] },
  { id: 'BUD_BURST', label: '발아기 (눈 트는 시기)', months: [3, 4] },
  { id: 'SHOOT_GROWTH', label: '신초생장기 (새순)', months: [4, 5] },
  { id: 'FLOWERING', label: '개화기 (꽃 필 때)', months: [5, 6] },
  { id: 'FRUIT_SET', label: '착과기 (알 맺힘)', months: [6] },
  { id: 'BERRY_GROWTH_1', label: '과립비대 1기 (콩알)', months: [6, 7] },
  { id: 'BERRY_GROWTH_2', label: '과립비대 2기 (경핵기)', months: [7, 8] },
  { id: 'VERAISON', label: '착색/성숙기 (색 들 때)', months: [8, 9] },
  { id: 'HARVEST', label: '수확기', months: [9, 10] },
  { id: 'RECOVERY', label: '수확 후 회복기', months: [10, 11] },
] as const;

// 3. 문제 부위
export const PROBLEM_PARTS = [
  { id: 'LEAF', label: '잎', icon: '🌿' },
  { id: 'BERRY', label: '과실(알)', icon: '🍇' },
  { id: 'CLUSTER_WHOLE', label: '송이 전체', icon: '🍇' },
  { id: 'NEW_SHOOT', label: '새순(신초)', icon: '🌱' },
  { id: 'STEM_BRANCH', label: '가지/줄기', icon: '🪵' },
  { id: 'ROOT', label: '뿌리', icon: '🪨' },
  { id: 'FLOWER', label: '꽃', icon: '🌼' },
] as const;

// 4. 증상 카테고리 및 상세
export const SYMPTOMS_BY_PART = {
  LEAF: [
    { id: 'POWDERY', label: '흰 가루가 묻음' },
    { id: 'BROWNING_SPOT', label: '갈색/검은 반점' },
    { id: 'YELLOWING', label: '노랗게 변함(황화)' },
    { id: 'HOLE', label: '구멍이 뚫림' },
    { id: 'CURLING', label: '오그라짐/말림' },
    { id: 'DEFOLIATION', label: '잎이 떨어짐(낙엽)' },
  ],
  BERRY: [
    { id: 'CRACKING', label: '알이 터짐(열과)' },
    { id: 'COLOR_DEFECT', label: '색이 안 듬(착색불량)' },
    { id: 'SMALL_BERRY', label: '알이 안 큼' },
    { id: 'ROTTING', label: '물러짐/썩음' },
    { id: 'UNEVEN_COLOR', label: '얼룩덜룩함' },
  ],
  NEW_SHOOT: [
    { id: 'WITHERING', label: '말라 죽음(고사)' },
    { id: 'TIP_BURN', label: '끝이 탐' },
    { id: 'OVERGROWTH', label: '너무 웃자람' },
  ],
  GENERAL: [
    { id: 'MOLD', label: '곰팡이 발생' },
    { id: 'WEB', label: '거미줄 보임(응애)' },
    { id: 'COTTONY', label: '흰 솜뭉치(깍지벌레)' },
  ]
} as const;

// 5. 기상/환경
export const WEATHER_CONDITIONS = [
  { id: 'RAINY', label: '장마/과습' },
  { id: 'HIGH_TEMP', label: '고온/폭염' },
  { id: 'DROUGHT', label: '가뭄/건조' },
  { id: 'LOW_SUNLIGHT', label: '일조 부족' },
  { id: 'TYPHOON', label: '태풍/강풍' },
] as const;

// 6. LLM 프롬프트 생성용 템플릿
export const SYSTEM_PROMPT_TEMPLATE = `
당신은 30년 경력의 포도 재배 전문가입니다.
사용자의 질문을 분석하여 다음 JSON 형식으로 답변하세요.

{
  "diagnosis": "원인 및 진단 (한 줄 요약)",
  "immediate_action": "당장 해야 할 조치 (필수)",
  "prevention": "향후 예방 대책",
  "additional_info": "추가적인 팁"
}

[사용자 컨텍스트]
- 품종: {variety}
- 시기: {growth_stage} ({month}월)
- 증상: {symptoms}
- 재배형태: {cultivation_type}
`;


