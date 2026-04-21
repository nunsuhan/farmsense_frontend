# FarmSense 서버 API 전수조사 & 앱 매칭

**작성일**: 2026-04-21
**대상 서버**: `152.42.248.236` (`/home/django/django_project`, gunicorn)
**앱 기준 커밋**: `b1884fd` (master)
**총 URL 등록 수**: **653** (admin·debug 제외 기준)

---

## 🔴 최우선 — 앱이 호출하는데 서버에 없는 엔드포인트 (404 발생)

| # | 호출처(앱) | 앱에서 보낸 URL | 서버 실제 URL (후보) | 원인/조치 |
|---|---|---|---|---|
| 1 | `src/services/ragApi.ts` (`RAGResponse`) | `POST /api/rag/query/` | `POST /api/rag/ask/` 또는 `POST /api/rag/chat/` | 앱 URL 수정 |
| 2 | `src/services/ragApi.ts` | `GET /api/rag/load-history/` | **없음** | 서버 미구현. 히스토리 저장은 앱 AsyncStorage로만 처리되는 상태일 가능성 |
| 3 | `src/services/ragApi.ts` | `POST /api/rag/save-history/` | **없음** | 동상 |
| 4 | `src/services/pesticideApi.ts` | `GET /api/pesticide/search/` | **없음** | 서버에는 `info/`, `prohibited/`, `scan/`, `pls/check/`만 존재 |
| 5 | `src/services/pesticideApi.ts` | `GET /api/pesticide/safety/` | **없음** (PLS 관련이면 `pls/check/`) | URL 수정 or 서버 추가 |
| 6 | `src/services/pesticideApi.ts` | `POST /api/pesticide/record/` | **없음** (spray_system의 `/api/pesticide/spray/*`에 기록 API는 있음) | 기능 매핑 재설계 |
| 7 | `src/services/farmmapApi.ts` | `GET /api/farmmap/search/` | **farmmap 앱 자체가 서버에 없음** | farms/geo/ 로 이전됐는지 조사 필요 |
| 8 | `src/services/farmmapApi.ts` | `GET /api/farmmap/nearby/` | **없음** | 동상 |
| 9 | `src/services/farmmapApi.ts` | `POST /api/farmmap/search-by-location/` | **없음** | 동상 |
| 10 | `src/services/farmmapApi.ts` | `POST /api/farmmap/search-by-pnu/` | **없음** | 동상 |
| 11 | `src/services/farmmapApi.ts` | `POST /api/farmmap/search-radius/` | **없음** | 동상 |
| 12 | `src/services/farmmapApi.ts` | `GET /api/farmmap/field-info/{pnu}/` | **없음** | 동상 |
| 13 | `src/services/soilApi.ts` | `GET /api/soil/address-to-pnu/` | **없음** (external_apis/urls에 없음) | 서버 추가 or 외부 VWorld 호출로 변경 |
| 14 | `src/services/authApi.ts` | `POST /api/auth/logout/` | **없음** | JWT 특성상 refresh 제외 logout 불필요 or blacklist 미구현 |
| 15 | `src/services/diagnosisApi.ts` | `POST /api/diagnosis/diagnoses/batch_diagnose/` | (DRF @action 미구현 가능) | 서버 ViewSet에 action 추가 or 앱에서 제거 |
| 16 | `src/services/reverseAnalysisApi.ts` | `POST /api/reverse-analysis/save/` | ViewSet의 @action 없음 | 앱 URL 수정 or 서버 action 추가 |
| 17 | `src/services/reverseAnalysisApi.ts` | `POST /api/reverse-analysis/prepare_data/` | 동상 | 동상 |
| 18 | `src/services/reverseAnalysisApi.ts` | `POST /api/reverse-analysis/analyze/` | 동상 | 동상 |
| 19 | `src/services/qnaApi.ts` | `POST /api/hot-questions/test/` | `/api/suggestions/hot-questions/`만 있음(GET) | test용인 듯 — 앱에서 제거 권장 |
| 20 | (확인 필요) | `GET /api/community/categories/` | DRF ViewSet 내부 `categories/` 존재 — 스크립트 false negative 가능성 | 재검증 필요 |

### 영향도 상위 3건
1. **farmmap/*** (6건) — 지도/PNU 기반 기능 전면 404. 설정의 재배환경·구역관리·농장기본정보 등에서 API 실패로 지도/검색 불가. 앱 설계 문서와 서버 구현이 전혀 다름.
2. **pesticide/record, search, safety** — "농약 기록 저장/검색/안전성" 기능 실제 동작 안 함. `BarcodeScannerScreen` → `PesticideRecord` 이동 시 리스트/저장 자체가 불가.
3. **rag/query** — QnAScreen 또는 다른 채팅 기능이 `ragApi.askQuestion`을 쓰면 항상 404. (단, `ragApi.chat/askSmartRAG`는 `/rag/smart/`로 정상 작동)

---

## 서버 앱별 엔드포인트 개수 (653건)

| 앱 | 개수 | 비고 |
|---|---|---|
| user_profiles | 111 | 프로필, 농장, 아바타, 농가 CRUD |
| farmsense | 57 | 관개, 영농일지, 열화상, tomato, 메인 피드 |
| issue_tracker | 46 | 운영 이슈 관리 |
| quality_reports | 40 | 품질 보고서 |
| django_project | 37 | 루트 레벨 schema/docs 등 |
| sensor_data | 34 | 센서 멀티크롭 |
| disease_prediction | 32 | 병해 예측 DSS |
| community | 28 | 게시글/댓글 |
| farms | 27 | 농장, 섹터, geo, sync |
| sla_alerts | 24 | SLA 모니터링 |
| rest_framework | 24 | DRF 내장 |
| traceability | 23 | GAP/trace |
| diagnosis | 20 | AI 진단 |
| self_healing | 18 | 자동 복구 |
| spray_system | 17 | 농약 살포 시스템 |
| monitoring | 10 | 내부 모니터링 |
| notifications | 10 | 알림 |
| deep_research | 9 | 리서치 |
| billing | 7 | 토스 결제 |
| pesticide | 6 | PLS, 바코드 스캔, 금지 목록 |
| thermal | 6 | 열화상 |
| self_evolution | 6 | 자체 진화 로직 |
| patrol | 6 | 순찰 |
| pest_module | 7 | 병해충 |
| rag | 7 | 질의응답 |
| external_apis | 5 | 토양, 기상 |
| field_book | 4 | 영수증 OCR, 방제기록 |
| report | 3 | 보고서 루트 |
| cei | 3 | CEI 지수 |
| micro_decision | 3 | 마이크로 판단 |
| drf_spectacular | 3 | OpenAPI schema |
| rest_framework_simplejwt | 3 | JWT refresh/obtain |
| trial | 2 | **무료 체험 신청** (앱 미연결) |
| reverse_analysis | 2 | ViewSet |
| suggestions | 2 | hot-questions |
| phone_auth | 2 | SMS 인증 |
| mqtt | 2 | 최신 센서 |
| notices | 2 | 공지 |
| feedback | 2 | 피드백 |
| scrapbook | 2 | 스크랩 |
| dss | 1 | DSS 루트 |

---

## 앱 호출 URL 매칭 표

### ✅ 정상 동작 (앱 ↔ 서버 일치)

- `GET /users/avatar/`, `/users/avatar/presets/`, `/users/profile/`, `/users/profile/update/`
- `POST /users/avatar/upload/`, `/users/change-password/`, `PUT /users/avatar/`, `/users/profile/update/`, `DELETE /users/avatar/`
- `POST /auth/login/`, `/auth/register/`, `/auth/refresh/`, `/auth/social/`
- `POST /v1/auth/phone/send/`, `/v1/auth/phone/verify/`
- `POST /v1/billing/checkout/create/`, `/v1/billing/confirm/`, `/v1/billing/subscription/cancel/`, `GET /v1/billing/subscription/`
- `POST /diagnosis/hybrid/`, `/diagnosis/canopy/`, `GET /diagnosis/health/`, `/diagnosis/queue-status/`, `ANY /diagnosis/diagnoses/`, `/diagnosis/diagnoses/{id}/`
- `POST /fieldbook/receipt-ocr/`
- `POST /pesticide/scan/`, `/pesticide/barcode/scan/`
- `POST /pesticide/spray/{start,data,end,quick}/`, `GET /pesticide/spray/history/{id}/`, `/pesticide/inventory/{id}/`
- `GET /soil/my-farm/`, `POST /soil/my-farm/`
- `GET /v1/dss/farms/{id}/{irrigation,fertilizer,growth-stage}/`
- `GET /disease/farms/{id}/dss/gap/fertilizer/{recommendations,records,audit}/`
- `GET /disease/farms/{id}/disease/{realtime,auto,quick,full,season}/`
- `POST /rag/ask/`, `/rag/smart/`, `/rag/enhanced/`
- `GET /nongsaro/varieties/grape/`, `/nongsaro/schedules/grape/`, `/nongsaro/disasters/grape/`, `/nongsaro/search/`
- `GET /v2/today/{id}/`, `/mqtt/latest/{id}/`
- `GET /farms/geo/geocode/`, `/farms/geo/reverse/`, `/farms/{id}/map-data/`, `POST /farms/{id}/sync-geo/`, `/farms/sectors/{id}/sync-geo/`
- `GET /hot-questions/`
- `POST /reverse-analysis/` (ViewSet list/create)
- `GET /community/posts/`, `/community/posts/{id}/`, `/community/posts/{id}/comments/`

### 🔴 앱 호출 실패 (위 상단 표 참조)

### 🟡 서버에만 있음 (앱 미사용, 유용한 기능 발견)

| URL | 기능 | 앱에서 활용 가능성 |
|---|---|---|
| `POST /api/trial/apply/` | **무료 체험 신청** | 🔴 앱 `ServiceGuideScreen` "신청하기"에 연결 필요 |
| `GET /api/trial/my-status/` | 체험 상태 조회 | 상동 |
| `POST /api/v1/cei/calculate/` | CEI 지수 계산 | 가능 |
| `GET /api/v1/cei/history/{farmId}/` | CEI 이력 | 가능 |
| `POST /api/rag/chat/` | RAG 호환(ask alias) | `ragApi.chat` 이미 사용? 확인 필요 |
| `POST /api/rag/quick/` | 빠른 답변 | 가능 |
| `POST /api/rag/refine/` | 질문 보정 | 가능 |
| `POST /api/rag/smart-answer/` | 스마트 답변 | 가능 |
| `GET /api/suggestions/hot-questions/` | 추천 질문 (QnA 시작용) | 이미 사용(`/hot-questions/`) |
| `GET /api/notices/` | 공지 | 메인/더보기에 알림 섹션으로 활용 가능 |
| `POST /api/feedback/*` | 피드백 (별개) | `SupportScreen`에서 formspree 대신 여기 쓸 수 있음 |
| `POST /api/scrapbook/*` | 스크랩 | 기능 미정 |
| `POST /api/thermal/*` | 열화상 (6건) | `CanopyCamera`와 연결 가능 |
| `POST /api/pest_module/*` | 병해충 (7건) | 구역별 위험도 |
| `POST /api/patrol/*` | 순찰 | 작업 루틴 |
| `POST /api/field_book/spray/*` | 방제 기록(`LogWrite` 대체 후보) | 🔴 **영농일지 저장 후보 엔드포인트** |
| `POST /api/micro_decision/*` | 마이크로 결정 | 진단 연계 |
| `POST /api/issue_tracker/*` | 이슈 추적 (46건) | 내부 모니터링용일 가능성 |
| `POST /api/quality_reports/*` (40건) | 품질 보고서 | 리포트 기능 확장 |

### 🔴 영농일지(LogWrite) 저장 엔드포인트 후보

서버 `field_book/urls.py`:
```
path('spray/',  create_spray_entry)          POST — 방제 항목 작성
path('spray/list/', list_spray_entries)      GET — 목록
path('spray/<int:entry_id>/', spray_entry_detail)  GET/PUT/DELETE
```
→ **`field_book.spray` 엔드포인트는 "방제 기록"에 특화**. 일반 영농일지(비방제 메모/수확/관수 등) 저장은 **없음**.

`user_profiles` router의 `diaries` ViewSet:
```
GET /api/users/diaries/   — list
POST /api/users/diaries/  — create
GET /api/users/diaries/{pk}/
POST /api/users/diaries/{pk}/add_work/
GET /api/users/diaries/today/?profile_id=...
```
→ **`FarmDiary` 모델은 자동 생성/날씨 중심이고 memo·images는 미지원**. 그대로 POST해도 빈 레코드만 저장될 가능성.

**결론**: **일반 영농일지용 전용 엔드포인트가 서버에 없음**. 세 가지 선택지:
- **A.** 서버에 `field_book/entries/` 신규 엔드포인트 추가 (memo, images, tags 필드)
- **B.** `FarmDiary`에 memo/images 필드 추가 migration
- **C.** 방제/관수/수확/메모별로 분리: 방제는 `/spray/`, 그 외는 클라 AsyncStorage (단기)

---

## 🟢 앱에서 정책 결정 필요

### TrialApplication (이슈 4번)
서버 `/api/trial/apply/` 명확히 존재 + AllowAny. 앱에서 **간단한 신청 폼 화면** 만들어 연결하면 끝.
```
Body: { name, phone, location, farm_type('rain_shelter'|'greenhouse'|'open_field'), area_pyeong }
```

### ReportList (이슈 5번)
서버에 단일 `/api/v1/farms/{id}/report/today/`만 있고 "리스트" 엔드포인트 없음. → **앱에서 버튼 제거가 맞음**.

### 영농일지 저장 (이슈 3번)
위 분석대로 **전용 서버 엔드포인트 없음**. 단기 우회: AsyncStorage 저장 + 추후 서버 작업 별도 이슈로 분리.

---

## 요약

- **앱 호출 84개 중 ~20개 🔴 404**
- **farmmap 앱 전체(6건)** 와 **reverse_analysis ViewSet action 3건**, **pesticide 비-spray 3건**, **rag 히스토리 2건** 이 주 누락
- **trial 앱**은 서버 구현 완료 — 앱에 신청 화면만 붙이면 됨
- **영농일지 저장**은 서버에 적합한 엔드포인트 없음 — 서버 작업이 필요

### 다음 단계
- 🔴 위 20건을 서버/앱 어느 쪽에서 맞출지 건건이 판단
- 영농일지·TrialApplication·ReportList 정책 확정 후 빌드
- `app_audit.md`의 X3 저장 미구현 건(PostWriteScreen)은 **커뮤니티 전체 삭제**로 자동 해소

*생성: server_api_audit (653 endpoints 스캔, 앱 호출 84건 매칭).*
