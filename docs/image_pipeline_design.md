# FarmSense 이미지 분석 파이프라인 재설계 (v2)

**작성일**: 2026-04-22 (v1) / **개정**: 2026-04-22 (v2)
**개정 사유**: 발달단계 AI 모델 부재 확인 + 사용자 승인 사항 반영 (UX/스코프/비용)

---

## 3줄 요약 (승인 완료)

1. **자산 재조립**: 10-class 병해 모델 + 29-trait Claude Vision (실행 코드 완비) + **GDD 기반 BBCH 23단계 규칙 엔진**(발달단계 AI 모델 없음을 확인) + LAI→수확량 예측. 조립만 하면 됨.
2. **Phase 1 파이프라인**: 성장일지 업로드 → Stage 0 품질 게이트 → **Stage 1 GDD 컨텍스트 주입** → Stage 2A 로컬 10-class → **Stage 2B Claude Vision 29-trait (요금제 한도 내)** → Stage 3 교차검증(GDD vs Vision) → Stage 4 DB 저장 + 시계열 + 알림.
3. **승인 반영**: 진단 탭=팜닥터 전체 확정, "진단"→"건강 체크" 리네이밍, Vision 요금제별 한도(월1만=주3회/연10만=매일), 긴급 트리거 일1회, 월 하드 한도 $1,500 (또는 유저별 한도 방식 — 아래 4.3 참조).

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
      ┌─────────────▼───────────────┐
      │ Stage 0: 품질 게이트          │
      │ - 파일 크기/포맷 검증          │
      │ - Vision image_type 판정       │
      │   (equipment/farmlog → 비식물) │
      │ - 비식물이면 Stage 1~3 스킵    │
      │   메모만 저장                  │
      └─────────────┬───────────────┘
                    │
      ┌─────────────▼───────────────┐
      │ Stage 1: GDD 컨텍스트 주입   │
      │  (AI 발달단계 분류기 없음 —   │
      │   GDD 규칙 엔진이 정답 역할)  │
      │                               │
      │ A) 서버에서 현재 BBCH 계산:   │
      │    Farm.budbreak_date +       │
      │    일평균 기온 → GDD 누적 →   │
      │    BBCHStage 반환 (규칙 정답)  │
      │                               │
      │ B) Vision 프롬프트에 컨텍스트 │
      │    주입:                      │
      │    "현재 이 농장은 GDD        │
      │     {gdd}° 누적, BBCH={code} │
      │     ({korean}) 단계입니다.    │
      │     이 생육 단계 기준으로     │
      │     관찰해주세요."             │
      │                               │
      │ C) Vision 응답의              │
      │    bbch_estimate 는 "검증값"  │
      │    GDD 규칙이 최종 정답       │
      └─────────────┬───────────────┘
                    │
      ┌─────────────▼───────────────┐
      │ Stage 2A: 로컬 병해 체크      │
      │ POST /api/diagnosis/hybrid/   │
      │ ├ 4-class 필터                │
      │ │  normal / pesticide /       │
      │ │  physiological / disease    │
      │ └ 10-class (a11~a15 / b4~b7)  │
      └─────────────┬───────────────┘
                    │
      ┌─────────────▼───────────────┐
      │ Stage 2B: Claude Vision       │
      │   (Phase 1 포함 — MVP 완성)   │
      │                               │
      │ 실행 조건:                    │
      │  1) 요금제 한도 내 (유저별)    │
      │  2) OR confidence<0.6 트리거  │
      │     (긴급, 한도 무관 일 1회)   │
      │                               │
      │ 프롬프트에 Stage 1 BBCH       │
      │ 컨텍스트 포함                 │
      │ → 29 trait JSON 추출          │
      └─────────────┬───────────────┘
                    │
      ┌─────────────▼───────────────┐
      │ Stage 3: GDD vs Vision 교차  │
      │ R1. GDD=DORMANCY이면 병해    │
      │     신뢰도 × 0.2              │
      │ R2. Vision_BBCH와 GDD_BBCH   │
      │     차이 2단계 이상 → 이상    │
      │     로그 + 사용자 확인 제안    │
      │ R3. Vision "꽃" 감지          │
      │     + GDD=휴면기 → 기각       │
      │     (생태 불가능)              │
      │ R4. Vision "수확기 과실" +    │
      │     GDD=개화기 → 기각         │
      │ R5. image_type=leaf_closeup   │
      │     + diagnosis=b6열과 → 기각 │
      │ R6. local_disease vs vision_  │
      │     disease_type 충돌 → 둘    │
      │     다 표시 + 재촬영 안내      │
      └─────────────┬───────────────┘
                    │
      ┌─────────────▼───────────────┐
      │ Stage 4: DB 저장 + 알림       │
      │ - FieldBookEntry + Photo      │
      │ - ImageAnalysisResult:        │
      │    gdd_bbch (정답)             │
      │    vision_bbch (검증)          │
      │    stage_mismatch (bool)       │
      │    disease_local / severity    │
      │    traits_json (Vision 29)    │
      │    cei_at_capture              │
      │    vision_used (비용 추적)     │
      │ - 시계열: 전일 대비 severity   │
      │ - 알림: 중증+추세↑ 또는       │
      │   stage_mismatch=true         │
      └─────────────────────────────┘
```

### 2.2 교차검증 규칙 (Stage 3 — v2: GDD vs Vision 중심)

**GDD 규칙 엔진이 항상 "정답"**, Vision 결과는 검증값/보조값.

| 룰 | 조건 | 조치 |
|---|---|---|
| R1. 휴면기 병해 기각 | `gdd_bbch ∈ {DORMANCY, LEAF_FALL, DORMANCY_START}` + `local_disease ≠ normal` | 진단 신뢰도 × 0.2 + "비시즌 진단 보류" 표기 |
| R2. BBCH 단계 불일치 경고 | `│vision_bbch_code − gdd_bbch_code│ ≥ 2단계` | `stage_mismatch=true` 저장 + "단계 불일치 — 농장 등록일 재확인?" 알림 |
| R3. Vision "꽃" + GDD=휴면기 | `vision.first_bloom_detected=true` + `gdd_bbch < BUD_BURST` | Vision 기각 (생태 불가능), 재촬영 제안 |
| R4. Vision "수확기 과실" + GDD=개화기 | `vision.coloring_pct ≥ 50` + `gdd_bbch < VERAISON_BEGIN` | Vision 기각 |
| R5. 잎 사진에 과실 병해 | `vision.image_type=leaf_closeup` + `local_disease ∈ {b5축과, b6열과}` | 기각 + "과실 사진이 필요합니다" |
| R6. Local vs Vision 충돌 | `local_disease != vision.disease_type` + 양쪽 `confidence ≥ 0.6` | 둘 다 표시 + "재촬영 권장" 알림 |
| R7. 비식물 감지 | `vision.image_type ∈ {equipment, farmlog}` | Stage 2 전체 스킵 + 메모만 저장 |
| R8. 약해 분기 | 4-class filter=`pesticide` | 약해 안내 (Stage 2B 스킵) |
| R9. 생리장해 분기 | 4-class filter=`physiological` | 10-class b* 클래스로 진입 + "영양/환경 원인 가능성" 안내 |

### 2.3 비용 모델 (Claude Vision) — v2 승인안

**현재 설정**: `claude-sonnet-4-5`, `max_tokens=1500`, 이미지 1장당 ~$0.025/호출 (상한 기준).

#### 요금제별 유저 한도 (승인)

| 요금제 | 정기 Vision 호출 | 원가/유저 | 긴급 트리거 |
|---|---|---|---|
| 무료 / 시범 | **OFF** (Stage 2B 스킵, 로컬만) | $0.00 | ❌ |
| 월 10,000원 | 주 3회 (월 12회) | **$0.30** | 일 1회 허용 (월 +$0.75) |
| 연 100,000원 | 매일 (월 30회) | **$0.75** | 일 1회 허용 (월 +$0.75) |

긴급 트리거 조건: **Stage 2A confidence < 0.6** (오진 리스크 실시간 보완)

#### 서버 측 하드 한도 — **유저별 월 한도 방식으로 변경 (승인)**

전역 월 $1,500 방식(=월 유저 1,000명 기준)도 가능하나 **한 명이 초과하면 전 유저가 막히는 위험**이 있어 다음 방식 채택:

```
per-user monthly budget:
  free:       $0
  monthly:    $1.50   (정기 12 + 긴급 최대 30)
  yearly:     $1.75   (정기 30 + 긴급 최대 30)

global safety:
  total monthly cap: $1,500
  알림: 80% 도달 시 관리자 이메일
  초과: 신규 유저 대기열 (기존 유저는 본인 한도 내 계속 사용)
```

#### 월별 총 비용 시뮬레이션

| 유저 구성 | 월 호출 | 월 비용 |
|---|---|---|
| 월 10K × 100명 (100% 활성) | 1,200 | ~$30 |
| 월 10K × 500명 | 6,000 | ~$150 |
| 연 10만 × 100명 | 3,000 | ~$75 |
| 연 10만 × 500명 | 15,000 | ~$375 |
| 혼합(월500+연500) + 긴급 20% | ~22,500 | **~$565** |

→ $1,500 전역 한도는 **월 2,000명 수준까지 안전**. 그 이상이면 한도 상향 또는 로컬 모델 단독 운영 강화.

#### 비용 추적 구현

- `ImageAnalysisResult.vision_used: bool` 저장
- `billing.VisionUsageLog(user, called_at, cost_cents)` 신규 테이블
- `POST /api/fieldbook/entries/` 내부에서 호출 전 한도 체크

### 2.4 우선순위별 구현 단계 (v2 승인안)

| Phase | 스코프 | 비고 |
|---|---|---|
| **1 (Phase B = 출시 전 필수)** | Stage 0 + Stage 1 GDD 컨텍스트 + Stage 2A 로컬 10-class + **Stage 2B Claude Vision (요금제 한도 내)** + Stage 3 교차검증 + Stage 4 저장 | **Vision MVP 이미 완성 → 요금제 게이트만 추가하면 Phase 1에 포함**. 별도 Phase 2 없음 |
| **2 (성장기 실제 트래픽 후)** | 시계열 알림 고도화 + 확정 제안 플로우 (budbreak/flowering/veraison 자동 제안) | 실측 데이터 누적 필요 |
| **3 (중장기)** | 자체 VineTraitNet 학습으로 Claude Vision 의존 축소 | 1만 장 이상 축적 후 |

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

## 승인 결과 (v2 — 2026-04-22 사용자 승인)

### ✅ 승인 완료
- **UX**: 진단 탭 = 팜닥터 전체. "진단" → "건강 체크" 리네이밍. DiagnosisHub/SmartScanner 3탭 해체.
- **Phase 1 스코프 확장**: Vision MVP가 이미 `image_analyzer.py`에 완성돼 있으므로 **Stage 2B도 Phase 1에 포함** (요금제 게이트만 추가).
- **비용 정책**: 요금제별 유저 한도 (월1만=주3회, 연10만=매일) + 긴급 트리거 일1회 + **유저별 월 한도 방식** (전역 $1,500 safety cap).
- **Phase B 재정의**: "영농일지 저장 API"가 아니라 "성장일지 + 자동 분석 Phase 1" 전체.

### 🟡 조건부 승인 — Phase B 이후로 연기
- `diagnosis_server/` 별도 서버: **Phase B 중에는 건드리지 않음**. 의존성 실측 후 Phase C에서 폐기.
- `ai_models/best_model.pth` (15-class 구버전): Phase B 끝나고 실측 후 삭제 판단.
- YOLO(grape_disease_best.pt / grape_variety_best.pt): **파일 존재 여부만 Phase B 중 확인** (`ls dss/models/`). 폐기는 Phase C.

### 🚨 v2 핵심 개정
- **발달단계 AI 모델 없음 확정** → Stage 1을 "AI 분류"가 아니라 **"GDD 규칙 엔진 결과를 Vision 프롬프트에 컨텍스트로 주입"** 방식으로 변경.
- Stage 3 교차검증도 "휴면기 노균 기각" 같은 생태학 룰은 **항상 GDD 규칙이 정답**, Vision은 검증값으로 재구성.

---

## 결론 (v2)

**모델은 이미 있다. 조립과 UX가 없었다. 발달단계는 AI 대신 GDD 규칙 엔진이 담당.**

### Phase B 작업 범위 (확정)

**서버 신규/수정**
1. `POST /api/fieldbook/entries/` 신규 (FieldBookEntry + Photo + 자동 분석 트리거)
2. `ImageAnalysisResult` 모델 신규 (gdd_bbch/vision_bbch/stage_mismatch/disease_local/severity/traits_json/cei_at_capture/vision_used)
3. `diagnosis/services/stage3_validator.py` 신규 (R1~R9 룰)
4. Claude Vision 호출 래퍼 + 요금제 게이트 (`micro_decision.image_analyzer` 재사용 + per-user budget 체크)
5. `billing.VisionUsageLog` 테이블 신규 (월 비용 추적)
6. `IrrigationRecord` / `FertilizerRecord` migration 수정 (기존 ProgrammingError 해결)

**앱 신규/수정**
7. 진단 탭 컴포넌트 교체: `DiagnosisHubScreen` → `FarmDoctorScreen`
8. LogWriteScreen 저장 핸들러 실제 API 연결
9. 성장일지 업로드 후 자동 분석 결과 카드 UI (BBCH/disease/severity/traits/mismatch 알림)
10. "진단" 용어 일괄 치환: "건강 체크" (팜닥터 내부 카드 라벨 포함)
11. SmartScannerScreen 3탭 해체 (차폐율/생육기록은 성장일지로 통합되므로 제거)

**건드리지 않음 (Phase C)**
- `diagnosis_server/` 별도 서버
- `ai_models/best_model.pth` (15-class 구버전)
- YOLO 파일

### 다음 단계
1. 이 v2 문서 최종 확인
2. Phase B 실행 (서버 6개 + 앱 5개 작업)
3. Phase B 완료 후 APK 빌드 + 폰 검증
