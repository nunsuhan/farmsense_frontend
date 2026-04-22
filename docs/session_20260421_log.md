# 세션 로그 — 2026-04-21 ~ 04-22 (Phase A + A-2 + v2 설계)

> 다음 세션에서 Phase B 시작 시 이 문서를 먼저 읽고 컨텍스트 복구.

---

## 완료 커밋 요약

### 앱 (`github.com:nunsuhan/farmsense_frontend` master — 전부 push 완료)

| 해시 | 메시지 | 범주 |
|---|---|---|
| `4fdf0bd` | docs(v2): 이미지 파이프라인 재설계 — GDD 컨텍스트 주입 방식 | v2 설계 |
| `2b2592e` | docs: 이미지 분석 파이프라인 재설계 (v1) | 설계 |
| `0ddf89e` | revert: authApi.getFullProfile 원복 (서버 복구 완료) | C |
| `f1737f2` | feat: RAG 대화 영속 유지 + TrialApplication 화면 (#3, #4) | Phase A |
| `241d689` | feat!: 커뮤니티 기능 완전 제거 | Phase A #5 |
| `72f0372` | docs(audit): Phase 2 심층 조사 | 감사 |
| `8595c65` | docs: 서버 API 전수조사 + 앱 매칭 (653 endpoints) | 감사 |
| `b1884fd` | docs: Step 1 앱 정적 분석 리포트 | 감사 |
| `64011fa` | fix: 앱 UX 정리 (상담/진단/영농일지/오류신고/더보기) | UX |
| `4127ad3` | feat: 바코드/영수증/AI질문 prefill 연동 (후속) | UX |
| `7d34a85` | feat: 바코드 스캔 + 영수증 OCR + 보고서 AI 질문창 | UX |
| `dfd9fa3` | fix: 계정정보 API URL + 카카오채널 URL + 게스트홈 CTA | 버그 |
| `a05a16a` | fix(onboarding): SMS 인증 후 토큰 SecureStorage 저장 누락 | 결제 |
| `46243d4` | Merge branch 'feature/onboarding' | 병합 |

### 서버 (`github.com:nunsuhan/farmsense-backend` main — 전부 push 완료)

| 해시 | 메시지 |
|---|---|
| `a147218` | fix(rag): MyConversationView의 IsAuthenticated import 누락 수정 |
| `34919b8` | feat(rag): MyConversationView 추가 — 유저별 영속 대화 (`GET /api/rag/my-conversation/`) |
| `4b71da7` | fix(user_profiles): ProfileUpdateView 중복 클래스 제거 |

---

## 설계 문서 (다음 세션 필독)

- **`docs/image_pipeline_design.md`** (v2, 4fdf0bd) — 성장일지 + 자동 분석 파이프라인 최종 설계. Phase B 실행 근거.
- `docs/server_api_audit.md` (8595c65) — 서버 653 endpoints 전수 + 앱 매칭
- `docs/server_api_audit_phase2.md` (72f0372) — 피드백 반영 심층 재조사
- `docs/app_audit.md` (b1884fd) — 앱 navigation + API + 저장 경로 정적 분석

---

## Phase A 완료 항목 (빌드 + 폰 테스트 완료된 것)

- ✅ #5 커뮤니티 완전 삭제 (10곳 참조 제거, 10개 파일 삭제)
- ✅ #3 RAG 대화 영속 유지 (AsyncStorage `rag_conversation_id` + 서버 `MyConversationView` + QnAScreen 복원 로직)
- ✅ #4 TrialApplication 앱 화면 (5필드 폼 → `POST /api/trial/apply/`)
- ✅ C `authApi.getFullProfile` 원복 (`/users/profile/update/`)
- ✅ APK 빌드 성공 (2026-04-22 00:19, 54.6 MiB)
- ✅ gunicorn restart 완료 (2026-04-21 15:01 UTC)

## A-2 미완료 (Phase B 전/중간에 끼워 처리 예정)

- 🔴 **#1 팜닥터 이관**: 진단 탭 컴포넌트를 `DiagnosisHubScreen` → `FarmDoctorScreen`으로 교체
  - `src/navigation/MainTabNavigator.tsx:53` `component={DiagnosisHubScreen}` → `FarmDoctorScreen`
- 🔴 **#1b 햄버거 전면 삭제** (12개 화면 `showMenu=true`):
  - `DailyPrescriptionScreen`, `farming-log/FarmingLogScreen`, `QnAScreen`, `AlertSettingsScreen`, `FarmBasicInfoScreen`, `FarmDetailInfoScreen`, `FarmDetailScreen`, `NotificationScreen`(중복본), `PrivacyPolicyScreen`, `SensorRegistrationScreen`, `SettingsMainScreen`, `TermsScreen`
- 🔴 **#3 차폐율 → 수확량 연결**: SmartScannerScreen 차폐율 탭이 `createCanopyDiagnosis` 호출하도록 (또는 Phase B에서 성장일지로 통합되며 해체)

## Phase C 연기 항목 (출시 후)

- `diagnosis_server/` 별도 서버 폐기 판단
- `ai_models/best_model.pth` (15-class 구버전) 삭제
- YOLO 파일 (`grape_disease_best.pt`, `grape_variety_best.pt`) 존재 확인 + 정리
- farmmap 앱 URL 재매핑 (`/farmmap/*` → `/farms/*`, `/soil/*`)
- 병해진단 이미지 품질 필터 (모델 재학습 or confidence threshold)

---

## Phase B 실행 계획 (다음 세션)

### 순서 (각 단계 종료 시 사용자 확인 필수, 연속 실행 X)

**B-1. 서버 모델 + 엔드포인트**
- `FieldBookEntry` 모델 필드 확장 (필요 시)
- `ImageAnalysisResult` 모델 신규 (`gdd_bbch`/`vision_bbch`/`stage_mismatch`/`disease_local`/`severity`/`traits_json`/`cei_at_capture`/`vision_used`)
- `POST /api/fieldbook/entries/` view + serializer + urls
- `IrrigationRecord`/`FertilizerRecord` migration 수정 (ProgrammingError 해결)
- `makemigrations + migrate` + git commit

**B-2. 서버 교차검증 + Vision 게이트**
- `diagnosis/services/stage3_validator.py` 신규 (R1~R9)
- Claude Vision 호출 래퍼 — `micro_decision.services.image_analyzer.ImageFeatureExtractor` 재사용
- 요금제별 per-user budget 게이트
- `billing.VisionUsageLog` 테이블 신규 + migration
- `POST /api/fieldbook/entries/` 내부에서 Stage 0~4 파이프라인 오케스트레이션

**B-3. 앱 UI/용어**
- 진단 탭 컴포넌트 교체 (`MainTabNavigator.tsx`)
- `LogWriteScreen` 저장 핸들러 실제 API 연결 (`POST /api/fieldbook/entries/`)
- 자동 분석 결과 카드 UI (BBCH/disease/severity/traits/mismatch)
- "진단" → "건강 체크" 문자열 일괄 치환
- SmartScannerScreen 3탭 해체
- #1b 햄버거 12곳 제거

**B-4. 통합 검증 + APK 빌드**
- 서버 gunicorn restart
- 앱 빌드 + 폰 검증 체크리스트 (BBCH/병해/Vision 트리거/시계열)

### 다음 세션 시작 시 실행 템플릿

```bash
# 1. 현재 상태 확인
cd D:/farmsense-project/frontend
git log --oneline -5
git status --short | head

# 2. 서버 최신 여부
ssh -i "C:\Users\한문수\id_han_new" django@152.42.248.236 \
  "cd /home/django/django_project && git log --oneline -5 && \
   sudo systemctl is-active gunicorn"

# 3. 설계 문서 읽기
cat docs/image_pipeline_design.md | head -60

# 4. Phase B-1 시작 (서버 모델 신규)
ssh -i "C:\Users\한문수\id_han_new" django@152.42.248.236 \
  "cd /home/django/django_project/field_book && ls models*.py"

# 5. 기존 FieldBookEntry 모델 구조 재확인 후 ImageAnalysisResult 추가 위치 결정
```

---

## 현재 롤백 백업 파일

### 서버
```
/home/django/django_project/user_profiles/views.py.bak_20260421_102635
/home/django/django_project/rag/views.py.bak_*
/home/django/django_project/rag/urls.py.bak_*
```

### 앱
```
/home/django/django_project/.env.bak_20260419_235132          (파일 보존 중)
settings.py.bak_20260420_002023
sshd_config.bak_20260420_003516
```

### 서버 배포 상태
- **gunicorn**: active since 2026-04-21 15:01 UTC
- **PostgreSQL**: 정상, max_connections=50 (Phase C에서 150으로 상향 예정)
- **celery-worker/beat**: active
- **DEBUG**: False (프로덕션)

---

## 미해결 별건 이슈 (메모)

1. **이미지 진단 "노균병 반복" 현상**: 서버 `diagnosis/views.py:50` `'a12_downy_mildew': '노균병'` 매핑은 정상. 모델이 특정 입력에서 a12 반복 반환. Phase B에서 Stage 3 교차검증(GDD=휴면기 → 진단 신뢰도 × 0.2)으로 완화 예정.
2. **celery-beat 정체** (2026-04-19 23:15 이후 스케줄 정체 관찰): Plan B 이후 미확인. 다음 세션에서 재점검 필요.
3. **DRF browsable API `/static/rest_framework/*` 404**: nginx `/static` alias와 STATIC_ROOT 불일치. Phase C에서 정리.
4. **`/etc/sudoers.d/django` = `NOPASSWD:ALL`**: 보안 개선 항목. Phase C.
5. **`/root/backup_20260417_farm_migration/`** 단일 migration 파일 잔재: 정리 대상.

---

## 세션 종료 시각

오늘 작업 종료. 다음 세션에서 Phase B 시작.
