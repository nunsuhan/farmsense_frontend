# Play Store 제출 체크리스트 (사용자 직접 작업)

**작성일**: 2026-04-23
**기준 APK**: Phase B 완료 + 옵션 C (결제 숨김) 적용본

---

## 🔴 반드시 먼저 해야 하는 것 (앱 제출 불가능한 블로커)

### 1. Upload Keystore 생성 + Release 서명

**왜 필요?**
- Play Store는 debug keystore로 서명된 APK를 거부함
- 한 번 keystore 잃으면 **앱 업데이트 영구 불가** (Play App Signing 안 쓸 경우)

**어떻게?**

```powershell
# PowerShell에서 (JDK가 PATH에 있어야 함)
cd D:\farmsense-project\frontend\android\app

keytool -genkeypair -v `
  -keystore farmsense-upload.keystore `
  -alias farmsense-upload `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -storepass <STRONG_PASSWORD> -keypass <STRONG_PASSWORD> `
  -dname "CN=한문수, OU=FarmSense, O=팜센스, L=Daegu, ST=Daegu, C=KR"
```

생성 후:
- [ ] `farmsense-upload.keystore` 파일을 **안전한 곳 3곳**에 백업 (1Password, Google Drive 암호화 폴더, 외장 드라이브)
- [ ] 비밀번호를 1Password에 저장
- [ ] `.gitignore`에 `*.keystore` 추가 (이미 있을 수 있음, 확인)

다음 파일 수정 (`android/gradle.properties`):
```properties
MYAPP_UPLOAD_STORE_FILE=farmsense-upload.keystore
MYAPP_UPLOAD_KEY_ALIAS=farmsense-upload
MYAPP_UPLOAD_STORE_PASSWORD=<비밀번호>
MYAPP_UPLOAD_KEY_PASSWORD=<비밀번호>
```

`android/app/build.gradle`의 `signingConfigs` 블록 수정 (Claude가 다음 빌드 전에 패치해드릴 수 있음):
```gradle
signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release  // debug → release
        ...
    }
}
```

---

### 2. AAB (Android App Bundle) 생성

**왜?** Play Store는 2021년 8월부터 APK를 받지 않음. AAB 필수.

**어떻게?** (keystore 설정 완료 후)
```bash
cd D:/farmsense-project/frontend/android
./gradlew bundleRelease
# 결과: android/app/build/outputs/bundle/release/app-release.aab
```

- [ ] `.aab` 파일 생성 확인
- [ ] 크기 체크 (보통 40~60 MB)

---

### 3. Google Cloud Console — Maps API 키 제한

**왜?** 현재 `AIzaSyDp8IyjI7i36M1K4MXI5Zj8Zs35BMq8P2c`는 **어디서든 사용 가능**. 타인이 퍼가면 과금 폭탄.

**어떻게?**
1. https://console.cloud.google.com/google/maps-apis/credentials 접속
2. 해당 API 키 → "애플리케이션 제한사항" → **Android 앱**
3. 패키지 이름: `com.artmer.FarmSenseExpo`
4. SHA-1: `keytool -list -v -keystore farmsense-upload.keystore -alias farmsense-upload` 결과 중 SHA1 값 복사
5. "API 제한사항" → **Maps SDK for Android만** 선택

- [ ] 제한 설정 완료
- [ ] 다른 API(Geocoding, Directions 등) 쓰면 함께 등록

---

### 4. Play Console 가입 + 앱 등록

**왜?** 개발자 계정 필요 (최초 $25 1회 결제).

**어떻게?**
1. https://play.google.com/console 접속 → 개인 계정 선택
2. 개발자 등록 ($25)
3. **앱 만들기**:
   - 앱 이름: `FarmSense`
   - 기본 언어: 한국어
   - 앱 vs 게임: 앱
   - 무료 vs 유료: **무료** (옵션 C 채택)
   - 선언 체크박스 전부 동의

- [ ] 계정 생성
- [ ] 앱 등록

---

### 5. 개인정보처리방침 공개 URL

**왜?** Play Console 앱 등록 시 HTTPS URL 필수 입력. 앱 내 화면만으론 불가.

**어떻게?**
1. `farmsense.kr` 홈페이지에 `/privacy` 페이지 추가 (정적 페이지 OK)
2. 내용: 앱 `src/screens/settings/PrivacyPolicyScreen.tsx` 본문 재사용
3. URL 예: `https://farmsense.kr/privacy`

최소 포함 항목:
- 수집 개인정보: 이름, 전화번호, 이메일, 위치, 사진
- 수집 목적: 서비스 제공(농장 분석, AI 상담)
- 보유 기간: 회원 탈퇴 시까지
- 3rd party 공유: Toss(결제 시), Claude(AI 분석), Google(지도)
- 사용자 권리: 열람·수정·삭제 요청
- 문의처: `support@farmsense.kr` 또는 `artmer3061@gmail.com`

- [ ] 페이지 배포
- [ ] 공개 URL 접근 확인

### 5b. 이용약관 공개 URL (선택이나 권장)

동일하게 `farmsense.kr/terms` 페이지 추가.

- [ ] 배포

---

### 6. 스크린샷 + 그래픽 자산

**왜?** Play Store 상세 페이지 필수 항목.

필요 자산:

| 항목 | 규격 | 개수 |
|---|---|---|
| 앱 아이콘 | 512 × 512 PNG, 32-bit, **투명 배경 불가** | 1 |
| 피처 그래픽 | 1024 × 500 PNG/JPG | 1 |
| 폰 스크린샷 | 1080 × 1920 or 16:9 비율 | **최소 2장, 권장 4~8장** |

- [ ] 앱 아이콘 업로드용 512×512 PNG (기존 `assets/icon.png` 1024→512 리사이즈)
- [ ] 피처 그래픽 (Canva/Figma로 제작, "🌱 FarmSense · AI 포도 재배 관리" 등)
- [ ] 스크린샷 (홈 보고서, 건강 체크, 영농일지 작성, AI 상담, 내농장 — 5장 권장)

**스크린샷 촬영 방법**:
```
adb shell screencap -p /sdcard/sc1.png
adb pull /sdcard/sc1.png D:\farmsense-project\store-assets\
```
또는 폰 볼륨↓ + 전원 버튼.

---

## 🟠 Play Console 제출 양식에서 작성

### 7. 데이터 보안 섹션

**왜?** 2022년 7월부터 필수. 수집 데이터 공개 책임.

체크해야 할 항목:

| 데이터 | 수집 여부 | 선택/필수 | 용도 | 3rd 공유 |
|---|---|---|---|---|
| 이름 | 예 | 필수 | 계정 관리 | 아니오 |
| 전화번호 | 예 | 필수 | SMS 인증 | 알리고(SMS 업체) |
| 이메일 | 예 | 선택 | 계정 복구 | 아니오 |
| 위치 (정확) | 예 | 선택 | 농장 구역 설정 | 아니오 |
| 사진/동영상 | 예 | 선택 | AI 분석 | Anthropic(Claude Vision) |
| 음성 | 아니오 (기기 내 처리) | - | 음성 입력 | 아니오 |
| 결제 정보 | **아니오** (옵션 C) | - | - | - |
| 앱 활동 로그 | 예 (최소) | - | 오류 리포트 | 아니오 |

- [ ] 각 데이터 항목 체크
- [ ] "모든 데이터는 전송 중 암호화" 체크 (HTTPS 사용)
- [ ] "사용자가 데이터 삭제 요청 가능" 체크 + 절차 안내

### 8. 콘텐츠 등급 설문

- [ ] "IARC 설문" 진행
- [ ] 예상 등급: **전체 이용가** (앱 내 폭력/성적/도박 요소 없음)

### 9. 타겟층 및 광고

- [ ] **타겟 연령**: 전 연령 또는 18세 이상
- [ ] **광고 포함 여부**: 아니오
- [ ] **어린이 대상**: 아니오

### 10. 앱 카테고리

- [ ] **카테고리**: 교육 / 도구 / 라이프스타일 중 택 (권장: **도구**)
- [ ] 태그: 농업, 스마트팜, AI

### 11. 앱 설명

- [ ] **짧은 설명** (80자 이내):
  > AI가 도와주는 포도 재배 일지. 사진 한 장으로 생육 단계·이상 증상 확인.

- [ ] **긴 설명** (4000자 이내): 아래 템플릿 활용
  ```
  🌱 FarmSense — 포도 재배 AI 파트너
  
  📸 사진 한 장으로 끝나는 성장일지
  - 생육 단계 자동 감지 (발아~수확)
  - 이상 증상 조기 발견 (탄저·노균·흰가루 등)
  - 촬영한 사진이 자동으로 일지에 정리됩니다
  
  🌡️ 센서 없어도 OK
  - 기상청 데이터 + AI 분석으로 관수/시비 가이드
  - 외부 센서 연결 시 정밀도 향상
  
  📖 농업인 친화 기능
  - 음성으로 영농일지 기록
  - 영수증 사진 → 자동 기입
  - 농약 바코드 스캔 → PLS 체크
  
  🤖 AI 재배 상담
  - 포도 재배 질문에 즉각 답변
  - 농사로 API 연동 (정부 공인 데이터 기반)
  
  ℹ️ AI 분석은 참고용입니다. 정확한 진단은 전문가에게 문의하세요.
  ```

### 12. 콘텐츠 정책 선언

- [ ] AI 생성 콘텐츠 사용: **예** (Claude Vision, RAG)
- [ ] "AI 생성 콘텐츠는 참고용" 앱 내 명시 확인 (앱 내 이미 추가됨 ✓)
- [ ] 금지된 기능 없음 체크 (도박, 의료 진단, 성인용)
- [ ] **"의료 진단 앱이 아님"** 명시 (병해진단은 "증상 관찰 보조")

---

## 🟡 제출 직전 최종 검증

### 13. 내부 테스트 (Internal Testing) 트랙 우선 업로드

**왜?** 프로덕션 바로 올리면 반려 시 재업로드에 **versionCode 증가** 필요.

**어떻게?**
1. Play Console → 테스트 → **내부 테스트** 트랙
2. AAB 업로드
3. 테스터 이메일 5명 이내 등록 (본인 + 지인)
4. 테스터용 링크 전송 → 폰에서 다운로드 → 전 화면 QA
5. 문제 없으면 **프로덕션**으로 승급

- [ ] 내부 테스트 업로드
- [ ] 본인 폰에서 다운로드 테스트
- [ ] 주요 시나리오 통과 확인

### 14. 출시 전 체크리스트 최종

- [ ] versionCode 2 이상
- [ ] 서명 keystore = upload keystore (debug 아님)
- [ ] AAB 파일 생성
- [ ] Google Maps API 키 제한 완료
- [ ] 개인정보처리방침 공개 URL
- [ ] 스크린샷 최소 2장 + 피처 그래픽
- [ ] 데이터 보안 양식 완료
- [ ] 결제 없음 확인 (옵션 C)
- [ ] AI 분석 "참고용" 안내 노출 확인

---

## 📋 앱 내 변경 요약 (Claude가 이미 완료)

- ✅ `SYSTEM_ALERT_WINDOW` 권한 제거
- ✅ `READ_EXTERNAL_STORAGE` → `READ_MEDIA_IMAGES` (Android 13+) + 레거시 호환
- ✅ `exp+farmsenseexpo` 딥링크 스킴 제거
- ✅ `versionCode 1 → 2`
- ✅ `babel-plugin-transform-remove-console` 설치 + release 적용
- ✅ `DiagnosisResultScreen` 상단 고정 안내 "AI 분석은 참고용" 배너
- ✅ 온보딩 결제 단계(PLAN/CARD) 스킵 → VERIFY → DONE 직행
- ✅ `DoneStep` "자동결제 10,000원" 문구 → "환영합니다"로 변경
- ✅ `ExpertProfileScreen` 결제 UI → 시범 기간 무료 상담 신청

## 📋 앱 내 남은 작업 (Claude가 할 수 있음)

- [ ] `ServiceGuideScreen` 프리미엄 요금제 카드 "가격 표시" → "시범 기간 무료" 로 변경
- [ ] `TossWebView` / `CardStep` import 제거 (dead code 정리)
- [ ] `authService.ts`의 billing 관련 함수 주석/비활성
- [ ] "구독/결제" 단어 추가 grep + UI 일괄 정리

위 항목은 사용자 요청 시 별도 커밋으로 처리 가능.

---

## 일정 예상

| 단계 | 예상 소요 |
|---|---|
| Keystore 생성 + 서명 설정 + AAB 빌드 | 30분 |
| Maps API 제한 | 10분 |
| Play Console 가입 + 앱 등록 | 30분 |
| 스크린샷·피처 그래픽 제작 | 1~2시간 |
| 개인정보처리방침 페이지 배포 | 30분 |
| 데이터 보안 양식 작성 | 30분 |
| 앱 설명·메타데이터 작성 | 30분 |
| 내부 테스트 업로드 + QA | 2~4시간 |
| Google 심사 대기 | **1~7일** (무료 앱은 보통 2~3일) |
| **합계 (심사 제외)** | **반나절~1일** |

---

## 참고 링크

- Play Console: https://play.google.com/console
- 개발자 정책: https://support.google.com/googleplay/android-developer/answer/11514320
- 데이터 보안 가이드: https://support.google.com/googleplay/android-developer/answer/10787469
- AAB 빌드: https://developer.android.com/studio/publish/app-signing
