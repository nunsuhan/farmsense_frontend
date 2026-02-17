/**
 * v2.2 도움말 콘텐츠 데이터
 * 각 화면/기능별 도움말 + 온보딩 항목 + GAP/수출/블록체인
 */

export interface HelpContent {
  id: string;
  title: string;
  body: string;
  icon: string;
  iconColor?: string;
  dismissible: boolean;
  category?: string;
}

export const HELP: Record<string, HelpContent> = {
  // ==========================================
  // === 오늘의 보고서 카드별 도움말 ===
  // ==========================================
  irrigation: {
    id: 'help_irrigation',
    title: '관개 관리란?',
    body: 'CWSI(작물수분스트레스지수)와 VPD(증기압차)를 분석하여 관개 필요 여부를 판단합니다. 수치가 높을수록 작물이 목말라하는 상태이며, "관개 필요"가 표시되면 관수를 진행하세요.',
    icon: 'water-outline',
    iconColor: '#3B82F6',
    dismissible: true,
    category: 'report',
  },
  diagnosis: {
    id: 'help_diagnosis',
    title: '병해 진단이란?',
    body: '카메라로 촬영한 포도 잎/과일 사진을 AI가 분석하여 병해충을 감별합니다. 정확도는 예방 참고용이며, 정확한 진단은 전문가에게 문의하세요. 꾸준한 촬영이 AI 정확도를 높입니다.',
    icon: 'scan-outline',
    iconColor: '#EF4444',
    dismissible: true,
    category: 'report',
  },
  prediction: {
    id: 'help_prediction',
    title: '병해 예측이란?',
    body: 'PMI(병해관리지수)와 GDD(적산온도)를 기반으로 앞으로의 병해 발생 위험도를 예측합니다. 위험 등급이 "주의" 이상이면 예방 살포를 고려하세요.',
    icon: 'analytics-outline',
    iconColor: '#F59E0B',
    dismissible: true,
    category: 'report',
  },
  dss: {
    id: 'help_dss',
    title: 'DSS 알림이란?',
    body: '의사결정지원시스템(DSS)이 센서 데이터를 실시간으로 감시하여 이상치를 감지합니다. 온도, 습도 등이 설정된 임계값을 벗어나면 즉시 알려드립니다.',
    icon: 'alert-circle-outline',
    iconColor: '#8B5CF6',
    dismissible: true,
    category: 'report',
  },
  sensor: {
    id: 'help_sensor',
    title: '센서 현황이란?',
    body: '농장에 설치된 IoT 센서들의 현재 측정값입니다. 각 수치를 터치하면 일별/주별/월별 그래프를 확인할 수 있습니다. 모델팜과 비교하여 내 농장 상태를 파악하세요.',
    icon: 'hardware-chip-outline',
    iconColor: '#6366F1',
    dismissible: true,
    category: 'report',
  },
  realtime: {
    id: 'help_realtime',
    title: '실시간 연결이란?',
    body: 'MQTT 프로토콜로 센서 기기와 실시간 통신합니다. "연결됨"이면 정상이며, 연결 끊김이 오래되면 센서 상태를 확인하세요.',
    icon: 'pulse-outline',
    iconColor: '#10B981',
    dismissible: true,
    category: 'report',
  },
  spray: {
    id: 'help_spray',
    title: '농약/살포 관리란?',
    body: '최근 살포 기록과 안전사용기준(PHI)까지 남은 일수를 표시합니다. 수출 농가는 MRL(잔류허용기준) 적합 여부도 함께 관리됩니다.',
    icon: 'flask-outline',
    iconColor: '#EC4899',
    dismissible: true,
    category: 'report',
  },
  fertilizer: {
    id: 'help_fertilizer',
    title: 'GAP 비료 관리란?',
    body: 'GAP(우수농산물인증) 기준에 따라 비료 살포량을 자동 계산합니다. 품종·생육단계·토양 상태를 종합 분석하여 영양소 수지(N, P, K)를 산출하고, 최적 비료 종류와 투입량을 추천합니다. 비료 사용 기록의 추적성(제조사, 로트번호, 유통기한)과 안전성(PHI, REI, PPE)을 자동 관리하여 GAP 인증 준비를 지원합니다.',
    icon: 'nutrition-outline',
    iconColor: '#059669',
    dismissible: true,
    category: 'report',
  },

  // ==========================================
  // === 농장 설정 섹션별 도움말 ===
  // ==========================================
  farmBasic: {
    id: 'help_farm_basic',
    title: '왜 기본정보가 필요한가요?',
    body: '농장명과 주소, 재배 품종 정보를 정확히 입력하면 지역 기상 데이터를 연동하고, 품종별 맞춤 병해 예측이 가능합니다. AI 분석의 첫 번째 단계입니다.',
    icon: 'information-circle-outline',
    iconColor: '#10B981',
    dismissible: true,
    category: 'settings',
  },
  farmFacility: {
    id: 'help_farm_facility',
    title: '왜 시설정보가 필요한가요?',
    body: '하우스 유형(비가림/유리온실 등)과 동수에 따라 관개 모델과 환기 알고리즘이 달라집니다. 정확한 입력이 AI 분석 정확도를 높입니다.',
    icon: 'business-outline',
    iconColor: '#3B82F6',
    dismissible: true,
    category: 'settings',
  },
  farmSoil: {
    id: 'help_farm_soil',
    title: '왜 토양정보가 필요한가요?',
    body: '토양 종류와 pH, EC 값에 따라 시비 처방과 관수량 계산이 달라집니다. 토양 분석 결과지가 있다면 참고하여 입력하세요. 성적서 사진도 보관할 수 있습니다.',
    icon: 'earth-outline',
    iconColor: '#8B5CF6',
    dismissible: true,
    category: 'settings',
  },
  farmCultivation: {
    id: 'help_farm_cultivation',
    title: '왜 재배정보가 필요한가요?',
    body: '정식일과 수형(선반/울타리 등)에 따라 생육 단계를 자동 추적하고, 병해 예측 시기를 조정합니다.',
    icon: 'leaf-outline',
    iconColor: '#F59E0B',
    dismissible: true,
    category: 'settings',
  },
  farmVariety: {
    id: 'help_farm_variety',
    title: '왜 품종정보가 필요한가요?',
    body: '품종마다 병해 발생 패턴과 숙기가 다릅니다. 샤인머스캣과 캠벨얼리는 방제 시기가 전혀 다르며, 대목 품종은 뿌리 병해 예측에 영향을 줍니다. 정확한 품종 정보가 AI 처방의 핵심입니다.',
    icon: 'nutrition-outline',
    iconColor: '#8B5CF6',
    dismissible: true,
    category: 'settings',
  },
  farmTreeShape: {
    id: 'help_farm_tree_shape',
    title: '왜 수형·재식 정보가 필요한가요?',
    body: '울타리식과 평덕식은 통풍, 일조, 병해 발생이 완전히 다릅니다. 재식거리와 주수에 따라 관수량 계산과 살포량 추천이 달라지며, 전정 방법은 생육 예측 모델에 반영됩니다.',
    icon: 'git-branch-outline',
    iconColor: '#059669',
    dismissible: true,
    category: 'settings',
  },
  farmExport: {
    id: 'help_farm_export',
    title: 'GAP·수출 설정은 왜 필요한가요?',
    body: '수출 포도는 농약잔류허용기준(MRL)이 국내보다 엄격합니다. GAP 인증 농가는 살포 기록과 PHI(수확전사용금지기간)를 자동 관리하여 인증 유지를 도와드립니다. 블록체인 기반 이력추적으로 수출 신뢰도를 높입니다.',
    icon: 'airplane-outline',
    iconColor: '#EC4899',
    dismissible: true,
    category: 'settings',
  },

  // ==========================================
  // === 센서 등록 도움말 ===
  // ==========================================
  sensorRegistration: {
    id: 'help_sensor_reg',
    title: '센서를 많이 등록할수록 좋아요',
    body: '센서가 많을수록 AI가 농장 환경을 정밀하게 파악합니다. 등록된 센서가 없으면 지역 모델팜 데이터를 대신 사용합니다. 온도, 습도, 토양수분, CO2, 일사량 등 다양한 센서를 지원합니다.',
    icon: 'hardware-chip-outline',
    iconColor: '#6366F1',
    dismissible: true,
    category: 'sensor',
  },
  externalSensor: {
    id: 'help_external_sensor',
    title: '외부 센서 연동',
    body: '다른 서비스에서 운영 중인 센서가 있다면 API 키를 입력하여 FarmSense에 연동할 수 있습니다. 데이터가 통합되어 분석 정확도가 높아집니다.',
    icon: 'link-outline',
    iconColor: '#3B82F6',
    dismissible: true,
    category: 'sensor',
  },

  // ==========================================
  // === 영농일지 도움말 ===
  // ==========================================
  farmingLog: {
    id: 'help_farming_log',
    title: '영농일지의 가치',
    body: '매일의 기록이 쌓이면 1~2년 후 당신의 농장에 딱 맞는 AI 분석이 완성됩니다. 사진과 함께 기록하면 진단 학습 데이터로도 활용됩니다. 자동 일지 생성 기능으로 센서·기상·살포 데이터가 자동 채워집니다.',
    icon: 'book-outline',
    iconColor: '#10B981',
    dismissible: true,
    category: 'log',
  },
  autoLog: {
    id: 'help_auto_log',
    title: '자동 일지 생성이란?',
    body: '센서 데이터(온도, 습도, 토양수분)와 기상 정보, 최근 살포 기록을 자동으로 합쳐서 일일 영농일지를 생성합니다. 농가는 자동 생성된 내용을 확인하고, 작업 내용만 체크하면 됩니다.',
    icon: 'sparkles-outline',
    iconColor: '#8B5CF6',
    dismissible: true,
    category: 'log',
  },

  // ==========================================
  // === 온보딩에서 사용된 핵심 안내 ===
  // ==========================================
  onboardingWelcome: {
    id: 'help_onboarding_welcome',
    title: 'FarmSense 소개',
    body: '실시간 센서 데이터와 AI 분석으로 스마트한 포도 농장 관리를 시작하세요. 7가지 보고서(관개/병해진단/병해예측/DSS/센서/실시간/농약살포)로 농장 상태를 한눈에 파악합니다.',
    icon: 'leaf-outline',
    iconColor: '#10B981',
    dismissible: true,
    category: 'onboarding',
  },
  onboardingSettings: {
    id: 'help_onboarding_settings',
    title: '설정이 왜 복잡한가요?',
    body: '농장 정보를 정확히 입력하면 AI 분석 정확도가 크게 올라갑니다. 지역/품종별 맞춤 병해 예측, 토양 정보 기반 시비 처방, 시설 유형별 관개 모델을 제공합니다. 처음엔 번거롭지만 한 번만 입력하면 됩니다.',
    icon: 'settings-outline',
    iconColor: '#3B82F6',
    dismissible: true,
    category: 'onboarding',
  },
  onboardingExport: {
    id: 'help_onboarding_export',
    title: '수출 농가 안내',
    body: '살포기 센서 자동 연동, 농약잔류기준(MRL) 자동 확인, GAP 인증 데이터 자동 생성을 지원합니다. 수출용 추적성 인증을 자동으로 관리할 수 있습니다.',
    icon: 'airplane-outline',
    iconColor: '#8B5CF6',
    dismissible: true,
    category: 'onboarding',
  },
  onboardingPhoto: {
    id: 'help_onboarding_photo',
    title: '사진 진단의 이해',
    body: '사진 진단은 예방 목적입니다. 정확도가 100%가 아니므로 의심되면 전문가에게 문의하세요. 꾸준한 촬영이 AI 정확도를 높이며, 시간이 지날수록 당신 농장에 맞는 진단이 됩니다.',
    icon: 'camera-outline',
    iconColor: '#EF4444',
    dismissible: true,
    category: 'onboarding',
  },
  onboardingPromise: {
    id: 'help_onboarding_promise',
    title: '1~2년 후의 약속',
    body: '영농일지를 충실히 기록하면 1~2년 뒤 당신의 농장에 딱 맞는 AI 분석이 완성됩니다. 매일의 기록이 AI 학습 데이터가 되며, 시간이 지날수록 분석이 정확해집니다.',
    icon: 'trending-up-outline',
    iconColor: '#F59E0B',
    dismissible: true,
    category: 'onboarding',
  },

  // ==========================================
  // === GAP·수출·블록체인 ===
  // ==========================================
  blockchain: {
    id: 'help_blockchain',
    title: '블록체인 이력추적이란?',
    body: '살포 기록, 수확 정보, 출하 데이터를 블록체인에 기록하여 위변조가 불가능한 이력 증명을 제공합니다. 수출 농가는 바이어가 QR코드로 재배 이력을 실시간 확인할 수 있어 신뢰도가 높아지고, 프리미엄 가격을 받을 수 있습니다.',
    icon: 'shield-checkmark-outline',
    iconColor: '#6366F1',
    dismissible: true,
    category: 'export',
  },
  gapCertification: {
    id: 'help_gap_cert',
    title: 'GAP 인증 관리',
    body: 'GAP(우수농산물인증)은 농산물의 안전성을 보증하는 제도입니다. FarmSense는 살포 기록, PHI 준수, 잔류농약 기준 적합 여부를 자동 관리합니다. 인증 갱신 시기도 알려드리며, 사후관리 점검 데이터를 자동 생성합니다.',
    icon: 'ribbon-outline',
    iconColor: '#10B981',
    dismissible: true,
    category: 'export',
  },
  qrCodeMarketing: {
    id: 'help_qr_marketing',
    title: 'QR코드로 판로 개척·제값받기',
    body: '포도 박스에 QR코드를 부착하면 소비자가 재배 이력(농장 정보, 살포 기록, 수확일, 당도)을 직접 확인할 수 있습니다. 투명한 정보 공개는 소비자 신뢰를 높이고, 직거래·프리미엄 판매에 유리합니다. 수출 시에는 바이어의 신뢰도를 크게 높입니다.',
    icon: 'qr-code-outline',
    iconColor: '#3B82F6',
    dismissible: true,
    category: 'export',
  },
  productHistory: {
    id: 'help_product_history',
    title: '농산물 이력 관리란?',
    body: '재배포장 정보, 수확·출하 기록을 체계적으로 관리합니다. GAP 인증·사후관리에 필요한 모든 데이터를 자동 수집하며, 이력추적번호 발급과 연동됩니다. 소비자가 QR코드로 이력을 조회할 수 있습니다.',
    icon: 'document-text-outline',
    iconColor: '#F59E0B',
    dismissible: true,
    category: 'export',
  },

  // ==========================================
  // === 토양·수질 검사 / 교육 이수 ===
  // ==========================================
  soilWaterTest: {
    id: 'help_soil_water_test',
    title: '토양·수질 검사 결과 관리',
    body: '토양 검사 성적서와 수질 검사 성적서를 사진으로 보관하고, pH·EC·유기물 등 주요 항목의 기준 적합 여부를 자동 판정합니다. GAP 인증에 필요한 토양·수질 검사 증빙으로 활용됩니다.',
    icon: 'flask-outline',
    iconColor: '#92400E',
    dismissible: true,
    category: 'settings',
  },
  educationCert: {
    id: 'help_education_cert',
    title: '교육 이수 증빙',
    body: 'GAP 인증에 필요한 농산물 안전관리 교육 이수증을 사진으로 보관합니다. 교육 이수일과 유효기간을 관리하여 갱신 시기를 알려드립니다.',
    icon: 'school-outline',
    iconColor: '#059669',
    dismissible: true,
    category: 'settings',
  },

  // ==========================================
  // === 커뮤니티 ===
  // ==========================================
  community: {
    id: 'help_community',
    title: '커뮤니티 안내',
    body: '시기별 주요 이슈를 함께 토론하고, 자유게시판에서 농가 간 정보를 교환합니다. 이슈 토론에서는 AI 딥리서치 자료를 제공하여 전문적인 토론이 가능합니다. 오류신고나 건의사항도 남겨주세요.',
    icon: 'people-outline',
    iconColor: '#3B82F6',
    dismissible: true,
    category: 'community',
  },

  // ==========================================
  // === AI 상담 ===
  // ==========================================
  aiConsult: {
    id: 'help_ai_consult',
    title: 'AI 상담소 이용법',
    body: '포도 재배에 대한 궁금한 점을 텍스트 또는 음성으로 질문하세요. 농사로 데이터와 전문 재배 지식을 기반으로 답변합니다. 답변은 참고용이며, 중요한 결정은 전문가와 상의하세요.',
    icon: 'chatbubble-ellipses-outline',
    iconColor: '#8B5CF6',
    dismissible: true,
    category: 'consult',
  },
};

export type HelpKey = keyof typeof HELP;

// Category labels for help screen grouping
export const HELP_CATEGORIES: Record<string, string> = {
  report: '보고서 도움말',
  settings: '농장 설정 도움말',
  sensor: '센서 도움말',
  log: '영농일지 도움말',
  onboarding: '시작 가이드',
  export: 'GAP·수출·블록체인',
  community: '커뮤니티',
  consult: 'AI 상담',
};

// HelpModal structure for report screens
interface HelpModalContent {
  title: string;
  subtitle: string;
  points: { title: string; description: string }[];
  category?: string;
}

export const HELP_CONTENTS: Record<string, HelpModalContent> = {
  REPORT_DSS: {
    title: 'DSS 알림',
    subtitle: '의사결정지원시스템이 센서 데이터를 실시간 모니터링합니다',
    points: [
      { title: '실시간 감시', description: '온도, 습도 등 센서 데이터를 24시간 모니터링합니다' },
      { title: '임계값 알림', description: '설정된 임계값을 벗어나면 즉시 알림을 받습니다' },
      { title: '개인화 설정', description: '농장 환경에 맞게 임계값을 조정할 수 있습니다' },
    ],
    category: 'report',
  },
  REPORT_IRRIGATION: {
    title: '관개 관리',
    subtitle: 'CWSI와 VPD 분석으로 최적의 관수 시기를 판단합니다',
    points: [
      { title: 'CWSI 분석', description: '작물수분스트레스지수로 물 부족 상태를 확인합니다' },
      { title: 'VPD 측정', description: '증기압차를 통해 작물의 증산 활동을 파악합니다' },
      { title: '관수 시기', description: '수치가 높을수록 관수가 필요한 상태입니다' },
    ],
    category: 'report',
  },
  REPORT_DIAGNOSIS: {
    title: '병해 진단',
    subtitle: 'AI가 작물 사진을 분석하여 병해충을 감별합니다',
    points: [
      { title: 'AI 분석', description: '딥러닝 모델이 잎과 과일의 병해를 진단합니다' },
      { title: '예방 참고', description: '정확한 진단은 전문가 상담을 권장합니다' },
      { title: '데이터 축적', description: '꾸준한 촬영으로 AI 정확도가 향상됩니다' },
    ],
    category: 'report',
  },
  REPORT_PREDICTION: {
    title: '병해 예측',
    subtitle: 'PMI와 GDD를 기반으로 병해 발생 위험을 예측합니다',
    points: [
      { title: 'PMI 지수', description: '병해관리지수로 현재 위험도를 평가합니다' },
      { title: 'GDD 적산', description: '적산온도로 병해 발생 시기를 예측합니다' },
      { title: '예방 조치', description: '위험 등급에 따라 예방 살포를 권장합니다' },
    ],
    category: 'report',
  },
  REPORT_REALTIME: {
    title: '실시간 모니터링',
    subtitle: 'MQTT 프로토콜로 센서 데이터를 실시간 수신합니다',
    points: [
      { title: '실시간 수신', description: '센서 데이터를 즉시 확인할 수 있습니다' },
      { title: '트렌드 분석', description: '데이터 변화 추이를 실시간으로 파악합니다' },
      { title: '네트워크 상태', description: '통신 상태에 따라 지연이 발생할 수 있습니다' },
    ],
    category: 'report',
  },
  REPORT_SENSOR: {
    title: '센서 상태',
    subtitle: '연결된 센서의 상태와 배터리를 확인합니다',
    points: [
      { title: '센서 상태', description: '각 센서의 작동 상태를 모니터링합니다' },
      { title: '배터리 관리', description: '배터리 잔량을 확인하고 교체 시기를 알려줍니다' },
      { title: '연결 상태', description: '네트워크 연결 품질을 실시간으로 표시합니다' },
    ],
    category: 'report',
  },
  REPORT_FERTILIZER: {
    title: 'GAP 비료 관리',
    subtitle: 'GAP 기준에 맞는 비료 살포량을 자동 계산합니다',
    points: [
      { title: '영양소 수지', description: 'N, P, K 등 영양소 결핍/과잉을 분석합니다' },
      { title: 'GAP 준수', description: '비료 추적성, 안전성, 장비 관리 등 GAP 요구사항을 자동 체크합니다' },
      { title: '비용 분석', description: '비료별 단가 기반 ha당 비용을 계산하고 효율성을 평가합니다' },
    ],
    category: 'report',
  },
};
