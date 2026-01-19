# 🎨 FarmSense 설정 화면 개선 가이드

## 📁 파일 구조

```
src/screens/settings/
├── SettingsMainScreen.tsx         # 설정 메인 (4개 카테고리)
├── FarmBasicInfoScreen.tsx        # 1. 농장 기본정보 설정
├── SensorRegistrationScreen.tsx   # 2. 센서 등록설정
├── NotificationSettingsScreen.tsx # 3. 알림설정
└── AccountSettingsScreen.tsx      # 4. 계정정보 설정
```

---

## 🎯 화면 구조

### 1️⃣ 설정 메인 화면
```
⚙️ 설정
├── 🌱 농장 기본정보 설정
├── 📡 센서 등록설정
├── 🔔 알림설정
└── 👤 계정정보 설정
```

### 2️⃣ 농장 기본정보 설정
```
📝 농장 기본정보
├── 농장 이름
├── 시설 ID
├── 작기 일련번호
└── 주요 작물 품종

🏗️ 시설환경정보
├── 재배 형태
├── 시설 유형
└── 재배 면적

🌿 작물생육정보
├── 포도나무 수령
├── 대목 종류
├── 재식 수
├── 작기 시작일 (맹아일)
└── 수확 목표일

🔧 추가 시설정보
├── 토양배수 설치
├── 심토파쇄 실시
├── 객토 실시
├── UV차단 비닐 설치
└── 바닥 매트 종류
```

### 3️⃣ 센서 등록설정
```
📡 센서 목록
├── 센서 종류
├── 센서 상태 (정상/비활성/오류)
├── 센서 ID
├── 갱신 주기
└── 활성화/비활성화/삭제
```

### 4️⃣ 알림설정
```
🔔 푸시 알림
└── 모든 알림 활성화/비활성화

📋 알림 유형
├── 센서 이상 알림
├── 병해충 경고
├── 커뮤니티 알림
├── 기상 특보 알림
└── 농작업 리마인더 ✨ NEW

📊 센서 임계값
├── 온도 (최소/최대)
├── 습도 (최소/최대)
└── 토양수분 (최소)
```

### 5️⃣ 계정정보 설정
```
👤 기본 정보
├── 이메일 (아이디)
├── 전화번호
└── 주소

🔒 비밀번호 변경
├── 현재 비밀번호
├── 새 비밀번호
└── 새 비밀번호 확인

📄 법적 정보
├── 이용약관
└── 개인정보처리방침

ℹ️ 앱 정보
├── 앱 버전
├── 빌드 번호
└── 최종 업데이트
```

---

## 🚀 적용 방법

### 1단계: 파일 복사
```bash
# 다운로드한 파일들을 프로젝트에 복사
프로젝트/src/screens/settings/ 폴더에 5개 파일 복사

파일 목록:
- SettingsMainScreen.tsx
- FarmBasicInfoScreen.tsx
- SensorRegistrationScreen.tsx
- NotificationSettingsScreen.tsx
- AccountSettingsScreen.tsx
```

### 2단계: 네비게이션 설정
```typescript
// App.tsx 또는 MainNavigator.tsx

import SettingsMainScreen from './src/screens/settings/SettingsMainScreen';
import FarmBasicInfoScreen from './src/screens/settings/FarmBasicInfoScreen';
import SensorRegistrationScreen from './src/screens/settings/SensorRegistrationScreen';
import NotificationSettingsScreen from './src/screens/settings/NotificationSettingsScreen';
import AccountSettingsScreen from './src/screens/settings/AccountSettingsScreen';

// Stack Navigator 설정
const SettingsStack = createStackNavigator();

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsMainScreen} />
      <SettingsStack.Screen name="FarmBasicInfo" component={FarmBasicInfoScreen} />
      <SettingsStack.Screen name="SensorRegistration" component={SensorRegistrationScreen} />
      <SettingsStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <SettingsStack.Screen name="AccountSettings" component={AccountSettingsScreen} />
    </SettingsStack.Navigator>
  );
}
```

### 3단계: 탭 네비게이터에 추가
```typescript
<Tab.Screen
  name="Settings"
  component={SettingsNavigator}
  options={{
    title: '설정',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="settings" size={size} color={color} />
    ),
  }}
/>
```

---

## 🎨 디자인 특징

### 색상 테마
- **농장 기본정보**: 🟢 Green (#10B981)
- **센서 등록설정**: 🔵 Blue (#3B82F6)
- **알림설정**: 🟠 Orange (#F59E0B)
- **계정정보 설정**: 🟣 Purple (#8B5CF6)

### 컴포넌트
- ✅ 토글 스위치 (활성화/비활성화)
- 📝 텍스트 입력 필드
- 🔘 버튼 (저장, 삭제, 변경)
- 📊 섹션 구분
- 💬 모달 (센서 추가)
- ⚠️ Alert (확인, 경고)

---

## 📱 화면 흐름

```
[설정 메인]
    ↓
[농장 기본정보 설정]
    ↓
[센서 등록설정]
    ↓
[알림설정]
    ↓
[계정정보 설정]
    ↓
[이용약관/개인정보처리방침]
```

---

## 🔧 추가 개선 사항

### 기존 대비 개선점
1. ✅ 모든 설정을 4개 카테고리로 체계화
2. ✅ 농장 기본정보를 한 페이지에서 관리
3. ✅ 센서 등록/관리 기능 추가
4. ✅ 알림 유형에 농작업 리마인더 추가
5. ✅ 직관적인 아이콘과 색상 구분
6. ✅ 일관된 UI/UX 디자인

### 향후 확장 가능 사항
- [ ] API 연동 (저장/불러오기)
- [ ] 센서 실시간 상태 모니터링
- [ ] 농작업 일정 캘린더 연동
- [ ] 푸시 알림 테스트 기능
- [ ] 다크 모드 지원

---

## 🎯 사용자 경험

### 설정 메인 화면
- 4개의 큰 카드로 명확한 카테고리 구분
- 각 카드에 아이콘과 설명 포함
- 앱 정보와 로그아웃 버튼 하단 배치

### 서브 화면
- 뒤로가기 버튼으로 쉬운 네비게이션
- 섹션별 아이콘으로 시각적 구분
- 저장 버튼 하단 고정
- 입력 필드 명확한 라벨 표시

---

## ✅ 체크리스트

설정 화면 적용 완료 확인:

- [ ] 5개 파일 복사 완료
- [ ] 네비게이션 설정 완료
- [ ] 탭 바에 설정 탭 추가
- [ ] 각 화면 정상 작동 확인
- [ ] 저장 기능 API 연동 (선택)
- [ ] 디자인 검토 및 조정

---

## 🚀 빠른 테스트

```bash
# 프로젝트 실행
cd frontend
npm start

# 앱에서 확인
1. 하단 탭바에서 '설정' 탭 선택
2. 4개 메뉴 카드 확인
3. 각 화면 진입 및 기능 테스트
4. 저장/삭제 등 동작 확인
```

---

## 📞 문의

설정 화면 적용 중 문제 발생 시:
1. 파일 경로 확인
2. 네비게이션 설정 확인
3. import 문 확인
4. 콘솔 에러 로그 확인

**성공적인 설정 화면 개선을 응원합니다!** 🎉
