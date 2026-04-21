# 서버 API 전수조사 — Phase 2 (사용자 피드백 반영 심층 조사)

**작성일**: 2026-04-21
**목적**: Phase 1(`server_api_audit.md`)에서 "🔴 서버 없음"으로 판정된 건 중 사용자 피드백으로 재검증 필요한 4개 항목 심층 조사

---

## 조사 1: farmmap ↔ farms 경로 매칭

### 결론: **`farmmap` 앱은 서버에 존재하지 않음. 실제 기능은 `farms` 앱과 `external_apis`(soil)에 분산되어 있음**

| 앱이 호출하는 URL (현재) | 서버 실제 URL | 상태 |
|---|---|---|
| `GET /api/farmmap/search/` | **없음** | 🔴 서버 미구현 or 제거 |
| `GET /api/farmmap/nearby/` | **없음** | 🔴 |
| `POST /api/farmmap/search-by-location/` | **없음** | 🔴 |
| `POST /api/farmmap/search-by-pnu/` | **없음** | 🔴 |
| `POST /api/farmmap/search-radius/` | **없음** | 🔴 |
| `GET /api/farmmap/field-info/{pnu}/` | `/api/soil/character/{pnu}/` + `/api/soil/grape-evaluation/{pnu}/` 등이 PNU 기반 정보 제공 | 🟡 부분 대체 가능 |
| (기존) `/api/farms/geo/geocode/`, `/geo/reverse/`, `/{id}/map-data/`, `/{id}/sync-geo/`, `/sectors/{id}/sync-geo/` | `farms` 앱 ✅ | ✅ 이미 사용 중 |

### 권장 조치
- `src/services/farmmapApi.ts`의 6개 호출 **전부 리팩터**:
  - 주소 → 농장 조회: `search/`, `search-by-location/`, `search-radius/`, `search-by-pnu/` → **서버 구현 없음**. 제거 or 서버에 신규 뷰 추가(VWorld/NGII API 래핑)
  - `nearby/` → 없음
  - `field-info/{pnu}/` → `/api/soil/character/{pnu}/` 또는 `/api/soil/comprehensive/{pnu}/` 로 매핑
- **"주소 → PNU 변환" 기능은 서버에 없음**. 외부 VWorld API 직접 호출 or 서버 래퍼 신규 필요

---

## 조사 2: 영농일지 저장 🚨 — 사용자 기대 vs 실제 구현 갭 분석

### 🎯 핵심 발견
**서버 모델·주요 엔드포인트는 이미 풍부하게 구축됨. 앱 쪽 연결이 끊긴 상태 (LogWriteScreen: Alert만)**

### 2-a. 서버 `field_book` 앱 모델 (완전한 영농일지 구조, 전부 0 rows)

| 모델 | 주요 필드 | rows | 용도 |
|---|---|---|---|
| `FieldBookEntry` | profile, farm, recorded_by, intervention_type, intervention_date, details(JSON), weather_snapshot | 0 | **메인 일지 엔트리** |
| `FieldBookPhoto` | entry, image, caption, uploaded_at | 0 | 사진 첨부 |
| `SprayRecord` | entry, pesticide_name, pesticide_type, target_pest, dilution_ratio, spray_volume_liters, area_pyeong | 0 | **방제 기록 (고압 살포기 용량)** |
| `GaRecord` | entry, treatment_stage, ga_concentration_ppm, fulmet_added, fulmet_ppm, dipping_seconds, clusters_treated | 0 | 지베렐린 |
| `HarvestRecord` | entry, harvest_weight_kg, cluster_count, brix_average, grade_distribution | 0 | 수확 |
| `IrrigationRecord` | entry, method, volume_liters, duration_minutes, soil_moisture_before/after | **⚠️ ProgrammingError** | 관수 (마이그레이션 누락) |
| `FertilizerRecord` | entry, fertilizer_name, type, application_method, amount_kg, nitrogen_percent | **⚠️ ProgrammingError** | 비료 (동일) |

### 2-b. 다른 앱의 관련 모델 (중복/분산)

- `farmsense.thermalmeasurement` (0) — 열화상 + canopy_temperature
- `farmsense.irrigationdecisionlog` (0) — 관수 의사결정
- `farmsense.journalentry` (0) — **또 다른 "일지" 모델** (farm_id, date, crop, entry_type, data) → **중복 구조 경고**
- `user_profiles.farmdiary` (**1 row**, 샘플) — 자동 일지
- `spray_system.pesticideinventory` (0), `spraysession`, `spraydatapoint` — **고압 살포기 IoT 세션** (flow_rate, pressure, GPS, 누적 용량)
- `pesticide.plsstandard` (**336 rows**) — PLS 기준

### 2-c. 서버 엔드포인트 (이미 존재)

```
POST /api/fieldbook/receipt-ocr/                ✅ 영수증 OCR (앱 사용 중)
POST /api/fieldbook/spray/                      ✅ 방제 기록 생성 (PLS 체크 포함)
GET  /api/fieldbook/spray/list/                 ✅ 방제 기록 목록
GET/PUT/DELETE /api/fieldbook/spray/<id>/       ✅

POST /api/pesticide/barcode/scan/               ✅ (spray_system)
POST /api/pesticide/spray/start/                ✅ IoT 살포 세션 시작
POST /api/pesticide/spray/data/                 ✅ GPS + flow_rate 데이터 누적
POST /api/pesticide/spray/end/                  ✅ 세션 종료
GET  /api/pesticide/spray/history/<farm>/       ✅ 농장별 이력
POST /api/pesticide/spray/quick/                ✅ IoT 없이 수기 간편 기록
POST /api/pesticide/export/check/               ✅ PHI 수출 적합성
GET  /api/pesticide/export/report/<farm>/{pdf,excel}/ ✅ 사용일지 PDF/Excel
```

### 2-d. 🔴 앱 LogWriteScreen 저장 (확정 — Alert만)

```tsx
// src/screens/farming-log/LogWriteScreen.tsx:198-210
onPress={() => {
    if (!memo.trim()) { Alert.alert('알림', '작업 내용을 입력해주세요.'); return; }
    Alert.alert('저장 완료', '영농일지가 저장되었습니다.');   // ← 거짓 성공
    navigation.goBack();                                     // ← API 호출 없음
}}
```

### 2-e. 과거 연결 흔적 (git log)

```
814ffcb  feat: 핵심 3개 API 서버 연결 (농장설정/영농일지/보고서)
cc43c45  feat: 영농일지 방제기록 PLS 체크 완성
3b9aa5d  feat: API 서비스 레이어 + 화면별 API 연결
39b2a03  Add GAP fertilizer management system with auto farming-log integration
```
**과거 연결이 있었다가 현재 사라진 상태**. 복구 가능.

### 2-f. 사용자 기대 vs 실제 매핑

| 사용자 기대 | 서버 | 앱 연결 |
|---|---|---|
| 영수증 → 영농일지 자동 | ✅ `receipt-ocr/` 구현 | ⚠️ OCR→LogWrite prefill만, **저장 자체 안 됨** |
| 농약병 바코드 → 영농일지 | ✅ `pesticide/scan/` + `FieldBookEntry+SprayRecord` | ⚠️ 바코드 → PesticideRecord 이동만, **저장 없음** |
| 고압 살포기 계량센서 → 영농일지 | ✅ `pesticide/spray/{start,data,end}/` + `SpraySession+SprayDataPoint` | 🔴 **앱 UI 아예 없음** |
| 일반 메모 → 영농일지 | ✅ `FieldBookEntry` 모델 있음, **POST 엔드포인트 없음** | 🔴 |
| 관수/비료 기록 | ⚠️ 모델 있으나 **마이그레이션 에러** | 🔴 |

### 2-g. 결론 (영농일지)

- **서버 완성도 ~80%**. 모델과 방제 엔드포인트는 있음.
- **부족한 서버 작업**:
  1. `POST /api/fieldbook/entries/` (FieldBookEntry 생성, intervention_type별 details JSON + photos) — **신규 필요**
  2. `IrrigationRecord` / `FertilizerRecord` **마이그레이션 수정** (ProgrammingError 원인: 테이블 없음)
- **앱 작업**: LogWriteScreen 저장 핸들러 → 위 신규 엔드포인트 호출 + intervention_type별 분기 (방제는 기존 `/fieldbook/spray/` 사용)
- **고압 살포기 IoT UI**는 별도 기능 (향후 과제)

---

## 조사 3: RAG 히스토리 — ✅ 서버 완전 구현, 앱 연결만 누락

### 3-a. 서버 모델 (`rag/models.py`)
```python
class Conversation(Model):
    user = FK(AUTH_USER_MODEL)
    farm = FK(FarmProfile)
    updated_at = DateTimeField

class Message(Model):
    conversation = FK(Conversation)
    role = 'user' | 'assistant'
    content = Text
```

### 3-b. 이미 구현된 동작
- `POST /api/rag/enhanced/` (`NongsaroEnhancedView`): 요청 body `conversation_id` 포함 시 → `build_conversation_context()` 자동 로드 → 응답 후 `_update_conversation()` 자동 저장
- `POST /api/rag/ask/`, `/rag/chat/` (`RAGQueryView`) 도 `conversation_id` 지원

### 3-c. 🟢 앱이 할 일
- **별도 `load-history/`, `save-history/` 엔드포인트 호출 X** — 존재하지 않음
- **`conversation_id`를 AsyncStorage에 관리**하고 매 질문 body에 포함
- `src/services/ragApi.ts::askSmartRAG`는 이미 `conversation_id` 옵션 수용 — **QnAScreen에서 전달만 하면 됨**

### 3-d. 🔴 앱 현재 상태
QnAScreen에서 `conversation_id`를 한 번도 전달하지 않음. 매 질문이 새 세션. 히스토리 누적 안 됨.

**조치**: QnAScreen에서 conversation_id 생성/저장/로드 로직 추가 (AsyncStorage 키: `rag_conversation_id_{farmId}`)

---

## 조사 4: TrialApplication — ✅ 서버 완전 구현, 앱 폼만 추가하면 끝

### 4-a. 서버 구조
- `trial.TrialApplication` 테이블 (결제 `billing.Subscription`과 **완전 별개**)
- 필드: name, phone, location, farm_type(`rain_shelter`|`greenhouse`|`open_field`), area_pyeong, status(`submitted`|`selected`|`rejected`), created_at
- 엔드포인트:
  - `POST /api/trial/apply/` (AllowAny, 비로그인 가능)
  - `GET /api/trial/my-status/?phone=...` (AllowAny)
- 신청 → `artmer3061@gmail.com`에 메일 발송
- **선정(status=selected) → 별도 권한/플래그 부여 로직 없음** (수동 프로세스)

### 4-b. 결제 trial vs 시범농가 trial

| 구분 | `billing.Subscription.trial_end` | `trial.TrialApplication` |
|---|---|---|
| 트리거 | 토스 카드 등록 시 자동 | 사용자 폼 제출 |
| 기간 | 60일 후 자동 결제 | status 기반, 운영자 수동 선정 |
| 권한 | `is_trial_active()` → 프리미엄 접근 | **별도 권한 없음**, 선정 시 수동 |
| 용도 | 유료 서비스 체험 | **시범농가 모집 (무료 둘러보기)** |

### 4-c. 🟢 앱 구현 난이도: 낮음
`ServiceGuideScreen`의 "신청하기" 버튼 → 5필드 폼 (name/phone/location/farm_type/area_pyeong) → `POST /api/trial/apply/` → 성공 메시지.

---

## Phase 2 종합 판정표

| 이슈 | 서버 | 앱 | 권장 방향 |
|---|---|---|---|
| **farmmap 6건** | ⚠️ 일부 farms로, 일부 미구현 | 🔴 | 앱 URL `/api/farms/*`, `/api/soil/*`로 재매핑 + 미구현 기능은 서버 신규 or 외부 API 직접 |
| **영농일지 저장** | ✅ 모델 80% 완성, 방제 엔드포인트만 있음 | 🔴 Alert만 | 🚨 **서버 신규: `POST /api/fieldbook/entries/` + migration 수정 / 앱 LogWrite 저장 핸들러 연결** |
| **고압 살포기 IoT** | ✅ 완성 | 🔴 UI 없음 | 별도 기능, 향후 |
| **관수/비료 migration** | ⚠️ ProgrammingError | — | 서버 `makemigrations + migrate` |
| **RAG 히스토리** | ✅ Conversation+Message 완성 | 🔴 conversation_id 미전송 | 앱 QnAScreen에 conversation_id AsyncStorage 관리 추가 |
| **TrialApplication** | ✅ 완성 | 🔴 화면 없음 | 앱에 5필드 폼 신규 (비로그인 가능) |

## 결정 요청

1. **farmmap** — 앱 URL 재매핑 후 없는 기능(주소→PNU 검색) 제거? or 서버에 신규?
2. **영농일지** — 서버 `POST /api/fieldbook/entries/` 신규 + migration 수정 진행? (필수)
3. **RAG 히스토리** — 앱 conversation_id 관리 추가?
4. **TrialApplication** — 앱 폼 추가?
5. **커뮤니티 전체 삭제** — 진행?
