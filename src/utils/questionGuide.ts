import { 
  GRAPE_VARIETIES, 
  PHENOLOGY_STAGES, 
  SYMPTOMS_BY_PART,
  SYSTEM_PROMPT_TEMPLATE 
} from '../constants/grapeContext';

export interface QuestionContext {
  variety?: string;
  growthStage?: string;
  part?: string;
  symptoms?: string[];
  weather?: string[];
  userQuery: string;
}

/**
 * 사용자 입력을 바탕으로 LLM 프롬프트 생성
 */
export const generatePrompt = (context: QuestionContext): string => {
  const currentMonth = new Date().getMonth() + 1;
  
  // 1. 슬롯 정보 텍스트화
  const varietyInfo = context.variety 
    ? GRAPE_VARIETIES.find(v => v.id === context.variety)?.label 
    : '알 수 없음';
    
  const stageInfo = context.growthStage
    ? PHENOLOGY_STAGES.find(s => s.id === context.growthStage)?.label
    : `${currentMonth}월 생육단계`;

  const symptomInfo = context.symptoms?.length 
    ? context.symptoms.join(', ') 
    : '특이 증상 없음';

  // 2. 템플릿 치환
  let prompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{variety}', varietyInfo || '')
    .replace('{growth_stage}', stageInfo || '')
    .replace('{month}', currentMonth.toString())
    .replace('{symptoms}', symptomInfo)
    .replace('{cultivation_type}', '비가림(기본값)'); // 사용자 설정에서 가져오면 더 좋음

  // 3. 사용자 질문 추가
  prompt += `\n\n[사용자 질문]\n"${context.userQuery}"`;

  return prompt;
};

/**
 * 질문 품질 점수 계산 (UI 피드백용)
 * - 필수 슬롯이 채워질수록 점수 높음
 */
export const calculateQuestionQuality = (context: QuestionContext): number => {
  let score = 0;
  if (context.variety) score += 20;
  if (context.growthStage) score += 20;
  if (context.part) score += 20;
  if (context.symptoms && context.symptoms.length > 0) score += 20;
  if (context.userQuery.length > 10) score += 20;
  
  return Math.min(score, 100);
};


