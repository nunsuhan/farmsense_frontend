# FarmSense 이미지 분석 파이프라인 재설계

**작성일**: 2026-04-22
**작성 배경**: "즉시 병해진단" 독립 기능 폐기 + 성장일지 중심 자동 분석 구조로 이관

---

## 3줄 요약 (사용자 승인 필요 핵심)

1. **자산은 이미 충분함**: 10-class 병해 모델(2-Stage EfficientNet) + 29-trait Claude Vision + 규칙 기반 BBCH 23단계 + LAI→수확량 예측. 조립만 하면 됨.
2. **제안 파이프라인**: 성장일지 사진 업로드 → (Stage 0 품질 게이트 → Stage 1 이미지 타입/BBCH 추정 → Stage 2A 로컬 병해 10클래스 → Stage 2B 선택적 Claude Vision 29-trait) → Stage 3 교차검증(휴면기 노균 기각 등) → Stage 4 DB 저장 + 시계열 비교 + 알림.
3. **승인 필요**: ① "즉시진단" 카드 완전 제거 / "건강 체크" 리네이밍 여부, ② Phase 1 스코프(Stage 0/1/2A만 출시 전, Claude Vision은 Phase 2로 미루기), ③ Claude Vision 일일 호출 한도 정책 (현재 **비용 제어 로직 없음**).

---

## Step 1: 자산 재고 (서버 실측)

### 1.1 병해진단 모델

| 자산 | 경로 | 클래스 수 | 용도 | 상태 |
|---|---|---|---|---|
| **4-class 필터** | `dss/models/best_4class_filter.pt` | 4 (normal/disease/physiological/pesticide) | 1차 분류 (이상 여부 + 대범주) | ✅ 사용 중 (`inference_service.py`) |
| **10-class 정밀** | `dss/models/best_band_model_v3_10class.pt` | 10 (00_normal + a11탄저/a12노균/a13흰가루/a14갈색무늬/a15꼭지마름 + b4일소/b5축과/b6열과/b7변색) | 2차 정밀 진단 | ✅ EfficientNet timm |
| **YOLO disease** | `dss/models/grape_disease_best.pt` | — | 객체 위치/영역 | ⚠️ lazy load, 파일 존재 미확인 |
| **YOLO variety** | `dss/models/grape_variety_best.pt` | — | 품종 인식 | ⚠️ 동상 |
| **2-Stage EfficientNet** | `diagnosis_server/models/grape_2stage_v2_20260203_153950.pt` | — | 32MB, 별도 서버(`diagnosis_server.py`)에서 사용 | 🟡 중복 자산 의심 |
| **생리장해 분류기** | `diagnosis_server/models/task2_physiological.pt` | — | 90MB, B계열(일소/축과/열과/변색) 세분화 | 🟡 별도 서버 |
| **15-class 구버전** | 코드상 `ml_model.py:15 num_classes=15` | 15 | `ai_models/best_model.pth`? 경로 일치 여부 불명 | 🔴 미사용/레거시 의심 |
| **앱 호출 엔드포인트** | `POST /api/diagnosis/hybrid/` (`HybridDiagnosisView`) | — | 4-class 필터 → 10-class 정밀 → prescription | ✅ 앱 `diagnoseDisease()`가 호출 |

**결론**: 실질적으로 **2-stage 10-class가 핵심**. 이외는 dead code 또는 별도 서버 자산.

### 1.2 포도 발달단계 모델 ⭐

| 자산 | 경로 | 종류 | 상태 |
|---|---|---|---|
| `BBCHStage` enum (23단계) | `disease_prediction/services/growth_stage.py` + `/growth_stage.py` (중복) | **규칙 기반** (GDD 임계치) | ✅ 사용 중 |
| `GrowthStageService` | 동상 | 품종별 GDD factor + 단계별 관수/병해리스크/작업 | ✅ |
| **이미지 → 발달단계 AI 분류기** | — | — | 🔴 **없음** (학습된 .pt 파일 0개) |

BBCH 단계 정의 (GDD 기반, 캠벨얼리 실측):
```
DORMANCY(0) → BUD_SWELLING(1) → BUD_BURST(9,GDD 151) → FIRST_LEAF(11,200)
→ LEAVES_UNFOLDED(15,300) → INFLORESCENCE_VISIBLE(53,400) → ELONGATING(55,480)
→ FLOWERS_SEPARATING(57,520) → BEGINNING_FLOWERING(61,600) → FULL_FLOWERING(65,700)
→ END_FLOWERING(69,780) → FRUIT_SET(71,850) → BERRIES_GROAT(73,950)
→ BERRIES_PEA(75,1100) → BUNCH_CLOSURE(77,1250) → BERRIES_TOUCH(79,1350)
→ VERAISON_BEGIN(81,1500) → VERAISON(83,1650) → BERRIES_RIPE(89,1850)
→ SENESCENCE(91,2000) → LEAF_FALL(93,2100) → DORMANCY_START(97,2200)
```
품종 factor: shine_muscat 1.0 · campbell_early 0.9 · kyoho 0.95 · MBA 0.92 · delaware 0.88.

→ **이미지 기반 BBCH 추정은 Claude Vision의 `bbch_estimate` trait으로만 가능 (전용 학습 모델 없음)**. GDD 규칙과 교차검증 구조가 합리적.

### 1.3 Claude Vision 통합 (29-trait MVP)

- **위치**: `micro_decision/services/image_analyzer.py:150` `class ImageFeatureExtractor`
- **호출 방식**: 동기, `anthropic.Anthropic().messages.create(model='claude-sonnet-4-5', max_tokens=1500)` 
- **API 키**: `settings.ANTHROPIC_API_KEY` or env
- **🔴 비용 제어 로직 없음** (`rate_limit`, `daily_limit`, `cost_budget` 검색 결과 0건)
- **29 traits (실측)**:

```
bbch_estimate, coloring_pct, berry_size_mm, cluster_compactness,
disease_type, disease_severity, water_stress_visual, surface_moisture,
leaf_condition, leaf_color, leaf_yellowing_pattern, leaf_burn_edge,
leaf_count, leaf_size,
shoot_regrowth, shoot_thickness, shoot_density_per_m,
shoot_count_per_node, internode_length_cm, adventitious_root, trunk_crack,
first_bloom_detected, bloom_stage, calyptra_retention_pct,
vigor, canopy_density, tendril_present,
image_quality, image_type  ← Stage 0 품질 게이트/이미지 타입 분류에 활용 가능
```

`image_type` 분류값: `fruit_closeup / leaf_closeup / canopy / shoot_detail / equipment / farmlog`
→ **equipment/farmlog = 비식물 사진** 감지에 직접 활용 가능

### 1.4 차폐율 / 수확량 모델

- **파일**: `dss/yield_predictor.py`
- **클래스**: `GrapeYieldPredictor(variety, area_m2)` / `LAIReading(date, lai, canopy_cover)` / `YieldPrediction(predicted_yield_kg, confidence, lai_factor, variety_factor, area_factor, message)`
- **메서드**: `predict_yield_from_lai(lai_series, growth_stage='veraison')` — 평균 LAI + 품종 계수 + 면적 적용
- **품종별 기준 수확량(kg/ha)**: shine_muscat 25,000 · campbell 30,000 · kyoho 28,000 · MBA 32,000
- **최적 LAI 범위**: 3.5~4.5 (광소멸계수 0.5)
- **앱 엔드포인트**: `POST /api/diagnosis/canopy/` (`CanopyAnalysisView`)
  - 이미지 저장 → `_analyze_canopy_image()` → LAI 추정 → `GrapeYieldPredictor.predict_yield_from_lai()` 호출 → **수확량까지 응답에 포함**
  - fallback: `_estimate_lai_from_stage(growth_stage)` (이미지 실패 시 BBCH 기반 추정)

### 1.5 기타 CV 자산

- **열화상**: `patrol.Patrol.thermal_image`, `farmsense.models.irrigation_models.ThermalMeasurement.thermal_image` — ImageField만 있고 **서버 내 OpenCV 분석 로직 없음** (외부 InfiRay 앱에서 처리 후 값만 전송 받는 구조로 추정)
- **SummerScanner / NightCamera**: 코드에 없음
- **OpenCV import**: 서버 전체 grep 0건 (venv 제외)

### 1.6 28-event 엔진

사용자 메모리의 `docs/verified_rules/` 4파일(판정/용어/매트릭스/DAG)은 **서버에 없음**. 서버 `docs/verified_rules/`에는:
```
01_technical_overview.md · 02_system_architecture.md · 03_api_specification.md
04_security_privacy.md · 05_ai_model_card.md · 06_sla.md
embedding_rules.md · model_fields_final.md
FARMSENSE_BACKEND_BRIEFING.md · FRONTEND_API_GUIDE.md
```
→ 28-event 규칙 정식 문서는 **로컬 전용**. 추후 서버 반영 필요시 별도 동기화.

---

## Step 2: 제안 파이프라인

### 2.1 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│  성장일지 사진 업로드 (앱)                                        │
│    └─→ POST /api/fieldbook/entries/ (Phase B 신규)               │
└───────────────────┬─────────────────────────────────────────────┘
                    │
      ┌─────────────▼─────────────┐
      │ Stage 0: 품질 게이트       │
      │ - 이미지 크기/포맷 검증     │
      │ - image_type 추정           │
      │   (Claude Vision 또는      │
      │    간이 CNN)                │
      │ - 'equipment/farmlog' 이면 │
      │   비식물로 분류 → 분석 스킵 │
      │   + "식물 사진이 아닙니다"  │
      └─────────────┬─────────────┘
                    │
      ┌─────────────▼─────────────┐
      │ Stage 1: 발달단계 추정      │
      │ A) Farm.budbreak_date +     │
      │    일평균 GDD 누적 →        │
      │    BBCHStage 규칙 (기본값)  │
      │ B) Claude Vision            │
      │    bbch_estimate trait      │
      │    (검증용, 차이 시 재확인) │
      └─────────────┬─────────────┘
                    │
      ┌─────────────▼─────────────┐
      │ Stage 2A: 로컬 병해 체크    │
      │ diagnoseDisease 호출        │
      │ ├ 4-class 필터              │
      │ │  normal: 정상 분기        │
      │ │  pesticide: 약해 안내     │
      │ │  physiological: b*로 진입 │
      │ │  disease: 10-class 정밀   │
      │ └ 10-class (a11~a15/b4~b7)  │
      └─────────────┬─────────────┘
                    │
      ┌─────────────▼─────────────┐
      │ Stage 2B: Claude Vision    │
      │   (선택적 / 트리거 기반)   │
      │ 트리거 조건:                │
      │  - 10-class confidence<0.6 │
      │  - 주간 1회 상세 모니터링   │
      │  - 사용자 수동 "상세 분석"  │
      │  - 유료 플랜 사용자         │
      │ 29-trait 전수 추출          │
      └─────────────┬─────────────┘
                    │
      ┌─────────────▼─────────────┐
      │ Stage 3: 교차검증 + 종합   │
      │ 생태 불가능 케이스 기각:    │
      │  - DORMANCY → 노균 기각     │
      │  - FLOWERING 전 → 탄저 낮춤 │
      │  - 잎 closeup → 과실 병해   │
      │    기각                     │
      │ local vs vision 합의 계산   │
      │ BBCH vs GDD 차이 알림        │
      └─────────────┬─────────────┘
                    │
      ┌─────────────▼─────────────┐
      │ Stage 4: DB 저장 + 알림     │
      │ - FieldBookEntry + Photo    │
      │ - ImageAnalysisResult       │
      │   (bbch_estimate, traits,   │
      │    diagnosis, severity,     │
      │    cei_at_capture)          │
      │ - 시계열 비교:              │
      │   전일 대비 증가 추세 탐지  │
      │ - 알림 트리거:              │
      │   심각도≥중증 + trend↑     │
      └─────────────────────────────┘
```

### 2.2 교차검증 규칙 예시 (Stage 3)

| 룰 | 조건 | 조치 |
|---|---|---|
| R1. 휴면기 병해 기각 | `BBCH ∈ {DORMANCY, LEAF_FALL}` + `disease ≠ normal` | 진단 신뢰도 × 0.2, "비시즌 진단은 보류" 표기 |
| R2. 착색기 이전 노균 보류 | `BBCH < VERAISON_BEGIN` + `disease = a12_downy` + `confidence < 0.7` | "착색기 이전 노균 오진 가능성" 경고 |
| R3. 과실 병해 on 잎 사진 | `image_type ∈ {leaf_closeup}` + `disease ∈ {b5축과, b6열과}` | 기각 + "과실 사진이 필요합니다" |
| R4. BBCH 역행 차단 | `today BBCH < yesterday BBCH` | Claude 결과 대신 GDD 규칙 채택 |
| R5. Vision/Local 충돌 | `local_disease != vision_disease_type` + 둘 다 confidence ≥ 0.6 | 양쪽 모두 표시, Stage 2B 재호출 |
| R6. 비식물 감지 | `image_type ∈ {equipment, farmlog}` | Stage 2 전면 스킵 + 메모로만 저장 |

### 2.3 비용 모델 (Claude Vision)

**현재 설정**: `claude-sonnet-4-5`, `max_tokens=1500` (공식 가격 기준 약 $0.003 input + $0.015 output = **~$0.02/호출**).

| 시나리오 | 일일 호출 | 월 비용 (30일) |
|---|---|---|
| 비수기 (10 농가 × 주 1회) | ~1.5 | ~$0.9 |
| 성장기 (50 농가 × 일 1회) | 50 | ~$30 |
| 성장기 (500 농가 × 일 1회) | 500 | ~$300 |
| 성장기 대량 (500 농가 × 일 3회) | 1,500 | ~$900 |

**권장 플랜별 한도**:
- 무료/시범: Claude Vision **OFF** (Stage 2B 스킵, 로컬 모델만)
- 월 1만원: **주 3회**
- 연 10만원: **주 7회 (매일)**
- 이벤트 트리거(심각 병해 의심, confidence<0.6)는 요금제 무관 1일 1회 허용
- **하드 월 한도**: 기본 $100/월, 초과 시 관리자 알림

### 2.4 우선순위별 구현 단계

| Phase | 스코프 | 범위 | 블로커 |
|---|---|---|---|
| **1 (출시 전 필수)** | Stage 0 품질 게이트 + Stage 1 GDD 기반 BBCH + Stage 2A 로컬 10-class + Stage 4 저장 | 서버: `/api/fieldbook/entries/` 신규, Claude Vision은 `image_type`만 최소 사용 (비식물 필터) / 앱: LogWrite 저장 + 결과 카드 UI | Phase B 영농일지 서버 엔드포인트와 통합 |
| **2 (출시 직후)** | Stage 2B 선택적 Claude Vision 29-trait | 트리거 로직 + 요금제 연동 + 비용 카운터 서버 구현 | 결제(`billing.Subscription`) 연동 필요 |
| **3 (성장기)** | Stage 3 시계열 비교 + 알림 | 전일 대비 severity 증가 추세, CEI 연계, 푸시 알림 | `ImageAnalysisResult` 모델 신규 (migration) |
| **4 (중장기)** | 자체 VineTraitNet 학습 | 수집된 앱 데이터로 SFT → Claude Vision 의존 축소 | 데이터 1만 장 이상 축적 후 |

---

## Step 3: 앱 UX 변경

### 3.1 화면 구조 변경

**현재**:
```
하단 탭 "진단" → DiagnosisHubScreen(1카드) → SmartScannerScreen(3탭 stub)
```

**변경 후 (Phase 1)**:
```
하단 탭 "진단" → FarmDoctorScreen (팜닥터 4카드: 즉시진단/예방진단/진단이력/처방가이드)
영농일지 탭 → 사진+메모 기록 → 자동 분석 결과 카드
```

- **즉시진단**: 팜닥터 내부에 유지 (하지만 "즉시 진단"이란 명칭을 **"잎/과실 체크"**로 리네이밍)
- **차폐율 탭**: SmartScanner에서 제거 → 성장일지 분석 결과에 `canopy_cover + LAI + 예상 수확량` 카드로 자동 표시
- **생육기록 탭**: 성장일지 자체가 이 역할 → 제거

### 3.2 성장일지 사진 업로드 UX

```
[사진 선택] → [메모 입력] → [저장]
    │
    └─→ 업로드 중... (spinner)
        ├─ 자동 분석 카드 표시:
        │   ● 발달단계: VERAISON 시작 (BBCH 81) ← GDD 규칙 + Vision 합의
        │   ● 이미지 타입: fruit_closeup
        │   ● 건강 상태: 정상 (confidence 0.92)
        │   ● 차폐율: 78% (LAI 4.1) · 예상 수확량 22.3t/ha
        │   ● [시계열 보기] [상세 분석 요청]
        │
        └─ 조건부 알림:
           "어제보다 노균 위험도 증가. 관수 줄이세요" (푸시)
```

### 3.3 용어 리스크 완화

- "진단" → **"건강 체크"** 또는 **"관찰 기록"** (진단은 법적으로 의료/수의사 전용 용어 이슈 가능성)
- "병해" → **"이상 증상"** + 병해명은 참고 표기
- 화면 하단 고정 문구:
  > ⓘ AI 분석은 참고용이며, 정확한 진단은 전문가에게 문의하세요.

---

## Step 4: 28-event 엔진과의 연동

현재 서버에는 28-event 문서가 **없음** (로컬 전용). 향후 연동 시:

| 28-event 필드 | 입력 경로 | 우선순위 |
|---|---|---|
| `Farm.budbreak_date` | 수동 입력 (현재) / **AI 첫 BBCH=9 감지 시 자동 제안** | 🟠 |
| `Farm.flowering_date` | 수동 / **AI first_bloom_detected=true 감지 시 자동 제안** | 🟠 |
| `Farm.veraison_date` | 수동 / **AI coloring_pct ≥ 5% 첫날** | 🟠 |
| GDD 보정 | AI BBCH vs 규칙 BBCH 평균 편차로 품종별 GDD factor 자동 조정 | 🟢 중장기 |

**권장 동기화 방식**: AI 추정값은 **제안만 표시**, 사용자가 "이 날짜로 확정" 탭하면 Farm 필드 업데이트. AI가 자동으로 덮어쓰지 않음.

---

## 승인 필요 항목 (요약)

- [ ] **UX 변경 방향**
  - [ ] 진단 탭 = 팜닥터 전체 (DiagnosisHub 폐기)
  - [ ] SmartScannerScreen 3탭 구조 해체 → 팜닥터 내부 "즉시진단"만 남기고 나머지 삭제
  - [ ] "진단" → "건강 체크"/"관찰 기록" 리네이밍 진행 여부
- [ ] **Phase 1 스코프**
  - [ ] Stage 0/1/2A + Stage 4 DB 저장까지만 출시 전 필수 구현
  - [ ] Claude Vision은 `image_type` 감지(비식물 필터)용으로 최소만 사용
  - [ ] Stage 2B 선택적 Vision은 Phase 2로 미룸
- [ ] **서버 신규 작업 (Phase B와 통합)**
  - [ ] `POST /api/fieldbook/entries/` 신규
  - [ ] `ImageAnalysisResult` 모델 신규 (bbch_estimate/disease/traits/cei_at_capture)
  - [ ] `IrrigationRecord`/`FertilizerRecord` migration 수정
  - [ ] Stage 3 교차검증 서비스 클래스 신규 (`diagnosis/services/stage3_validator.py`)
- [ ] **Claude Vision 비용 제어**
  - [ ] 일일 호출 한도 (기본 $100/월) 설정 여부
  - [ ] 요금제 연동 (billing.Subscription) 설계 승인
- [ ] **중복 자산 정리 결정**
  - [ ] `diagnosis_server/` 별도 서버 유지/폐기
  - [ ] `ai_models/best_model.pth` (15-class 구버전) 처리
  - [ ] YOLO(grape_disease_best.pt/variety_best.pt) 파일 존재 확인 및 통합/제거

---

## 결론

**모델은 이미 있다. 조합과 UX가 없었다.**

Phase 1 작업량:
- 서버: 엔드포인트 1개 신규 + 모델 1개 신규 + 서비스 2개(교차검증/시계열) + migration 수정
- 앱: 팜닥터 탭 교체 + 성장일지 업로드 결과 카드 UI + "진단" 용어 정리

Claude Vision 통합은 **이미 코드는 완성, 호출 로직만 없음** — Phase 2에서 트리거 + 비용 제어만 추가.

**다음 단계**: Phase B(영농일지) 시작 전 이 설계서 승인 → Phase B 스코프를 "LogWrite 저장 API"가 아니라 **"성장일지 + 자동 분석 파이프라인 Phase 1"**으로 재정의.
