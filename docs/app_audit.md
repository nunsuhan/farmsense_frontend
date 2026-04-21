# FarmSense 앱 정적 분석 (Step 1)

**작성일**: 2026-04-21  
**기준 커밋**: `64011fa` (master)  
**대상**: `src/navigation/**`, `src/screens/**`, `src/services/**`

---

## A. Navigator 등록 Screen 목록

### RootNavigator (37개)
```
MainTab, FarmDoctor, SmartFarm, Irrigation, Fertilizer, Environment,
PesticideManagement, BarcodeScanner, ReceiptOCR,
NotificationSettings, Help, AppInfo,
HarvestPrediction, Prevention, DiagnosisHistory, PrescriptionGuide,
Login, SignUp, ForgotPassword, PermissionRequest, FarmRegistration,
Profile, NotificationList, Terms, AccountSettings,
ReverseAnalysis,
Menu (transparentModal),
SmartLens, Diagnosis, DiagnosisResult, LogWrite, PostWrite (fullScreenModal),
OnboardingSlides (showMainFlow=false일 때)
```

### MainTabNavigator (6탭)
| 탭 name | 컴포넌트 |
|---|---|
| HomeTab | HomeStackNavigator |
| ConsultTab | ConsultScreen |
| DiagnosisTab | DiagnosisHubScreen |
| LogTab | FarmingLogStackNavigator |
| MyFarmTab | SettingsStackNavigator |
| MoreTab | MoreScreen |

### HomeStackNavigator (14개)
```
Home, Benchmark, PesticideManagement, FarmMap, FarmMapAdvanced,
PostDetail, QnAScreen, DailyPrescription, GrowthDiary,
ReverseAnalysis, PesticideRecord, CanopyCamera,
NotificationList, NotificationSettings
```

### FarmingLogStackNavigator (3개)
```
FarmingLogTab, LogWrite, SprayRecord
```

### SettingsStackNavigator = MyFarmTab (21개)
```
Settings, FarmBasicInfo, FarmDetailInfo, AlertSettings,
SensorRegistration, AccountSettings, NotificationSettings,
FarmDetail, SoilEnvironment, SectorManage, SensorManage,
Notification, Help, Support, AppInfo, PrivacyPolicy, Terms,
YearlyReport, FertilizerPrescription, SmartGreenhouse, SensorDashboard
```

### MyFarmStackNavigator (별도, 20개)
```
MyFarmHub, UnifiedFarmSettings, SensorManage, SensorDashboard,
SensorRegistration, ExternalSensor, FarmMap, ProductHistory,
Certificates, GAPHub, GAPChecklist, SoilTestForm, WaterTestForm,
FertilizerForm, HarvestForm, TrainingForm, ExportDashboard,
Sealing, SmartGreenhouse, IrrigationDashboard
```

### DiagnosisStackNavigator (6개)
```
DiagnosisHub, DiagnosisCamera, DiagnosisResult,
GrowthRecord, CanopyGuide, CanopyCamera
```

### CommunityStackNavigator (3개)
```
Community, PostDetail, PostWrite
```

**전체 등록**: 약 103개 Screen (중복 포함)

---

## B. 화면별 동작 매핑 (요약)

| 파일 경로 | Navigate 타겟 | API/서비스 | 로컬 저장 | 상태 |
|---|---|---|---|---|
| **Auth** | | | | |
| auth/LoginScreen.tsx | SignUp, ForgotPassword | authApi.login | SecureStore(토큰) | ✓ |
| auth/ForgotPasswordScreen.tsx | — | authApi.findId/resetPassword | — | ✓ |
| SignUpScreen.tsx | Login | authApi.register | SecureStore(토큰) | ✓ |
| **홈** | | | | |
| home/HomeRouter.tsx | — | — | — | 분기자 |
| home/ReportHomeScreen.tsx | QnAScreen(via AskReportBar) | apiClient.get(/v1/farms/{id}/report/today/) | — | ✓ |
| home/GuestHomeScreen.tsx | Login | — | — | ✓ |
| dashboard/HomeScreen.tsx | NotificationList, Profile, Login, Menu, FarmDoctor, QnAScreen, LogWrite, DailyPrescription, SmartFarm | sensorApi, avatarApi, dssApi | — | ✓ |
| today/HomeScreen.tsx | HomeTab(TodayReport), DiagnosisTab, ConsultTab, LogTab | — | — | ✓ |
| today/TodayReportScreen.tsx | ReportList(❌), IrrigationDetail, DiagnosisDetail, PredictionDetail, DSSDetail, SensorDetail, RealtimeDetail, SprayDetail, FertilizerDetail | reportApi | — | ⚠️ X1 |
| **진단** | | | | |
| DiagnosisScreen.tsx | DiagnosisResult(modal) | diagnosisApi.createHybridDiagnosis/createCanopyDiagnosis | — | ✓ |
| diagnosis/DiagnosisHubScreen.tsx | SmartLens (1개 카드로 통합됨) | — | — | ✓ |
| diagnosis/DiagnosisResultScreen.tsx | QnAScreen | diagnosisApi.getQuickRisk, dssApi | — | ✓ |
| smart-lens/SmartScannerScreen.tsx | DiagnosisResult(modal) | diagnoseDisease | — | ✓ |
| **AI 상담** | | | | |
| consult/ConsultScreen.tsx | HomeTab→QnAScreen | — | — | ✓ |
| QnAScreen.tsx | — | ragApi.askQuestion, ragApi.saveHistory, ragApi.chat | AsyncStorage(히스토리) | ✓ |
| **커뮤니티** | | | | |
| CommunityScreen.tsx | PostDetail, PostWrite | communityApi (import) | — | ✓ |
| community/PostDetailScreen.tsx | — | communityApi | — | ✓ |
| community/PostWriteScreen.tsx | — | **없음** | — | 🔴 X3 저장 미구현 |
| **영농일지** | | | | |
| farming-log/FarmingLogScreen.tsx | LogWrite | — | — | ✓ |
| farming-log/LogWriteScreen.tsx | — (route.params.receiptOCR 수신) | **저장 API 미확인** | — | ⚠️ X3 검증 필요 |
| farming-log/SprayRecordScreen.tsx | — | — | — | 상세 불명 |
| GrowthDiaryScreen.tsx | LogWrite | nongsaroApi | AsyncStorage(GUIDE_SHOWN) | ✓ |
| **팜닥터** | | | | |
| farmDoctor/FarmDoctorScreen.tsx | Diagnosis, Prevention, DiagnosisHistory, PrescriptionGuide | — | — | ✓ |
| farmDoctor/DiagnosisHistoryScreen.tsx | DiagnosisResult | diagnosisApi | — | ✓ |
| farmDoctor/PreventionScreen.tsx | — | dssApi | — | ✓ |
| farmDoctor/PrescriptionGuideScreen.tsx | — | pesticideApi | — | ✓ |
| **스마트팜** | | | | |
| smartFarm/SmartFarmScreen.tsx | Irrigation, Fertilizer, PesticideManagement, Environment, HarvestPrediction, ReverseAnalysis | — | — | ✓ |
| smartFarm/IrrigationScreen.tsx | — | dssApi | — | ✓ |
| smartFarm/FertilizerScreen.tsx | — | dssApi | — | ✓ |
| smartFarm/EnvironmentScreen.tsx | — | dssApi | — | ✓ |
| smartFarm/HarvestPredictionScreen.tsx | — | dssApi | — | ✓ |
| **관개** | | | | |
| irrigation/IrrigationDashboardScreen.tsx | ThermalMeasurement(❌) | dssApi, irrigationApi | — | ⚠️ X1 |
| irrigation/ThermalMeasurementScreen.tsx | IrrigationDashboard | irrigationApi | — | ✓ |
| **농약** | | | | |
| pesticide/BarcodeScannerScreen.tsx | PesticideRecord | smartLensApi.scanBarcode | — | ✓ |
| pesticide/PesticideManagementScreen.tsx | — | pesticideApi | — | ✓ |
| PesticideRecordScreen.tsx | — (route.params.prefill/barcode 수신) | pesticideApi | — | ✓ |
| **영수증** | | | | |
| fieldbook/ReceiptOCRScreen.tsx | LogWrite(params로 OCR 전달) | smartLensApi.ocrReceipt | — | ✓ |
| **설정** | | | | |
| settings/SettingsMainScreen.tsx | 동적 navigate | — | — | ✓ |
| settings/FarmBasicInfoScreen.tsx | FarmMap, SoilEnvironment, FarmDetail | farmmapApi | — | ✓ |
| settings/FarmDetailScreen.tsx | — | — | — | ✓ |
| settings/SensorManageScreen.tsx | SensorRegistration | sensorApi.getSettings/updateSettings | — | ✓ |
| settings/SoilEnvironmentScreen.tsx | FertilizerPrescription | soilApi | — | ✓ |
| settings/AccountSettingsScreen.tsx | — | authApi.getFullProfile (/users/profile/ 우회), avatarApi | — | ✓ |
| settings/NotificationSettingsScreen.tsx | — | — | AsyncStorage(NOTI_SETTINGS) | ✓ |
| settings/HelpScreen.tsx | Support | — | — | ✓ |
| settings/SupportScreen.tsx | — | fetch(formspree.io/f/xvgelwkv) | — | ✓ (간소화 적용됨) |
| **기타** | | | | |
| MenuScreen.tsx | MainTab.screen=FarmingLog(❌), MainTab.screen=Community(❌) | — | — | 🔴 X1 |
| more/MoreScreen.tsx | BarcodeScanner, ReceiptOCR, NotificationSettings, Help, AccountSettings, AppInfo | authApi.clearTokens | — | ✓ (이번에 복구) |
| TermsScreen.tsx | — | — | — | ✓ |
| ProfileScreen.tsx | NotificationSettings, FarmBasicInfo, Terms, ReverseAnalysis, AccountSettings | authApi, avatarApi | — | ✓ |
| NotificationsScreen.tsx | — | notificationApi | — | ✓ |
| FarmMapScreen.tsx | — | farmmapApi | — | ✓ |
| FarmMapAdvancedScreen.tsx | — | farmmapApi | AsyncStorage(MY_FARM) | ✓ |
| DailyPrescriptionScreen.tsx | — | sensorApi, pesticideApi, dssApi | — | ✓ |
| ReverseAnalysisScreen.tsx | — | reverseAnalysisApi | — | ✓ |
| CanopyCameraScreen.tsx | — | — | — | ✓ |
| myfarm/ServiceGuideScreen.tsx | TrialApplication(❌) | — | — | 🔴 X1 |
| myfarm/SmartGreenhouseScreen.tsx | SensorManage | — | — | ✓ |

---

## C. 잠재 이슈

### 🔴 X1. 링크 끊김 (navigate 대상이 Navigator에 미등록)

| # | 호출 위치 | navigate 대상 | 원인 | 권장 조치 |
|---|---|---|---|---|
| 1 | `today/TodayReportScreen.tsx` | `ReportList` | TodayStack/HomeStack 모두 미등록 | Stack 등록 or 호출 제거 |
| 2 | `myfarm/ServiceGuideScreen.tsx` | `TrialApplication` | 어느 Navigator에도 미등록 | 화면 구현 or CTA 수정 |
| 3 | `MenuScreen.tsx` | `MainTab.screen='FarmingLog'` | 실제 탭 name은 `LogTab` | `LogTab`으로 변경 |
| 4 | `MenuScreen.tsx` | `MainTab.screen='Community'` | MainTab에 Community 탭 없음 | 호출 제거 or 별도 Stack 등록 |
| 5 | `irrigation/IrrigationDashboardScreen.tsx` | `ThermalMeasurement` | MyFarmStack에만 있고 현재 호출 context에서 접근 불가 | RootStack에도 등록 |

### 🟠 X2. API / 인증 구조

**publicEndpoints (토큰 없이 호출 가능)**:
```
/auth/login/
/auth/register/
/auth/refresh/
/v1/auth/phone/send/
/v1/auth/phone/verify/
```

**주요 서비스 호출 맵**:
- `authApi`: `/auth/login/`, `/auth/register/`, `/users/profile/update/` (**임시 우회 중: `/users/profile/`**), `/users/change-password/`
- `authService`: `/v1/auth/phone/send/`, `/v1/auth/phone/verify/`, `/v1/billing/*`
- `sensorApi`: `/v2/today/{farmId}/`, `/mqtt/latest/{farmId}/`
- `dssApi`: `/v1/dss/{farmId}/dashboard/`, `/irrigation/`, `/fertilizer/`
- `diagnosisApi`: `/v1/diagnosis/hybrid/`, 기타
- `farmmapApi`: `/farmmap/farms/{id}/`, `/farmmap/search/`
- `pesticideApi`: `/pesticide/record/`, `/pesticide/search/`
- `ragApi`: `/rag/ask/`, `/rag/smart/`, `/rag/chat/`
- `reportApi`: `/disease/farms/{id}/disease/quick/`, `/mqtt/latest/{id}/`
- `smartLensApi`: `/pesticide/scan/`, `/fieldbook/receipt-ocr/`
- `soilApi`: `/soil/my-farm/`, `/soil/grape-fertilizer/{pnu}/`

**이슈**:
- 외부: `fetch(https://formspree.io/f/xvgelwkv)` (SupportScreen) — 네트워크/CORS 별개
- axios interceptor는 401 발생 시 refresh 후 재시도 로직 있음

### 🔴 X3. 저장 버튼 미구현/의심

| # | 파일 | 버튼 | 현재 동작 | 상태 |
|---|---|---|---|---|
| 1 | `community/PostWriteScreen.tsx` | "등록" | `Alert.alert('등록 완료')`만, API 호출 없음 | 🔴 **서버 저장 안 됨** |
| 2 | `farming-log/LogWriteScreen.tsx` | (저장) | 파일 하단 저장 핸들러 미검증 | ⚠️ 검증 필요 |
| 3 | `myfarm/ServiceGuideScreen.tsx` | "신청하기" | `navigate('TrialApplication')` 실패 | 🔴 미등록 화면 |

---

## D. 기타 발견

1. **다중 버전 파일 혼재**: `HomeScreen_backup.tsx`, `ProfileSettings.jsx` 등 — 정리 대상
2. **`HomeScreen.tsx` 두 버전**: `src/screens/HomeScreen.tsx` vs `src/screens/today/HomeScreen.tsx` vs `src/screens/home/HomeRouter.tsx` — 실제 사용 경로 명확화 필요
3. **`GrowthRecord`, `CanopyGuide`** (DiagnosisStack) — 이번 커밋에서 DiagnosisHubScreen에서 카드 제거됨. Screen 자체 삭제 여부는 별도 판단
4. **FacilityInfoScreen**: 코드 import는 있으나 주석 "삭제됨" — 정리 대상
5. **`pesticide/barcode/scan/` vs `pesticide/scan/`**: 서버에 2개 바코드 엔드포인트 존재. 앱은 전자만 사용

---

## E. Step 2 수동 검증 체크리스트 (폰에서)

### E-1. 링크 끊김 재현 확인
- [ ] TodayReport 진입 → 리스트 버튼 탭 → 튕김/무반응 확인
- [ ] MyFarm > ServiceGuide → "신청하기" 탭 → 튕김 확인
- [ ] 우상단 햄버거 메뉴(Menu) → 영농일지 탭 이동 안 됨 확인
- [ ] 동 메뉴 → 커뮤니티 탭 이동 안 됨 확인
- [ ] 관개 대시보드 → "열대 카메라 측정" 탭 동작 확인

### E-2. 저장 동작 확인
- [ ] 커뮤니티 > 새 글 작성 → "등록" → **서버에 저장되는지** (목록 재진입 시 보이는지)
- [ ] 영농일지 > 새 기록 → 저장 → **목록 재진입 시 보이는지**
- [ ] 농약 기록 > 저장 → 목록 확인
- [ ] 알림 설정 > 토글 변경 → 앱 재시작 후 유지 확인 (AsyncStorage)

### E-3. API 호출 실제 성공 여부
- [ ] 각 탭 첫 진입 시 **loading → 데이터 표시** 또는 **에러 메시지** 뜨는지 (무한 loading은 타임아웃 의심)
- [ ] 홈(보고서): 센서 데이터 표시 / 비어있음 구분
- [ ] 진단: 사진 촬영 후 결과 페이지 정상 진입
- [ ] AI상담: 질문 후 응답 도달 (60초 이내)
- [ ] 농약 바코드 스캔: 실제 바코드 → 제품명 표시 여부
- [ ] 영수증 OCR: 실제 영수증 → 품목 파싱 여부

### E-4. 로그 수집 방법
```
adb logcat | grep -iE "FarmSense|OperationalError|401|500|network|timeout" > /tmp/farmsense_runtime.log
```
또는 `expo run:android` 개발 빌드에서 Metro 콘솔 관찰.

---

## F. 우선순위별 수정 제안 (빌드 전)

| 우선 | 이슈 | 조치 |
|---|---|---|
| 🔴 1 | PostWriteScreen 저장 미구현 | `communityApi.createPost()` 호출 추가 |
| 🔴 2 | LogWriteScreen 저장 확인 | 전체 파일 읽고 API 호출 확인 후 없으면 추가 |
| 🔴 3 | MenuScreen 'FarmingLog'/'Community' | `LogTab`으로 교체 + Community는 제거 or Stack 추가 |
| 🟠 4 | ReportList 미등록 | Stack 등록 또는 호출 제거 |
| 🟠 5 | TrialApplication 미등록 | 화면 만들거나 CTA를 다른 경로로 |
| 🟡 6 | ThermalMeasurement 접근성 | RootStack 중복 등록 |
| 🟡 7 | 백업/구버전 파일 정리 | `_backup.tsx`, `.bak`, `ProfileSettings.jsx` 삭제 |

---

*생성: Step 1 정적 분석 완료. Step 2 수동 검증 및 F 순위 수정은 별도 세션에서 진행.*
