# 🏘️ 커뮤니티 화면 완성!

## ✅ 생성된 파일

```
frontend/src/screens/community/
├── CommunityScreen.tsx      ✅ 완료 - 메인 화면
├── PostDetailScreen.tsx     ✅ 완료 - 상세 화면
└── PostWriteScreen.tsx      ✅ 완료 - 작성/수정 화면
```

---

## 🎯 주요 기능

### **1. CommunityScreen (메인)**
- ✅ 카테고리 탭 (전체, 💬자유, ❓질문, 📸자랑, 💡팁, 🛒장터)
- ✅ 게시글 목록 (카드 형태)
- ✅ 썸네일 이미지 표시
- ✅ 좋아요/댓글/조회수 표시
- ✅ 우측 하단 FAB 버튼
- ✅ 당겨서 새로고침
- ✅ 무한 스크롤 페이지네이션 (10개씩)
- ✅ 빈 목록 안내 메시지

### **2. PostDetailScreen (상세)**
- ✅ 카테고리 & 제목 표시
- ✅ 작성자 & 작성 시간
- ✅ 이미지 슬라이더 (가로 스크롤)
- ✅ 본문 내용
- ✅ 좋아요/북마크 버튼
- ✅ 조회수/댓글수 통계
- ✅ 댓글 목록 (대댓글 표시)
- ✅ 댓글 입력창 (답글 기능)
- ✅ 댓글 좋아요
- ✅ 내 글이면 수정/삭제 버튼
- ✅ 질문 카테고리면 답변 채택 버튼

### **3. PostWriteScreen (작성/수정)**
- ✅ 카테고리 선택 (가로 스크롤 칩)
- ✅ 제목 입력 (100자 제한)
- ✅ 내용 입력 (5000자 제한, multiline)
- ✅ 이미지 첨부 (최대 10장)
  - 갤러리에서 선택
  - 카메라로 촬영
  - 이미지 순서 표시
  - 삭제 버튼
- ✅ 익명 체크박스
- ✅ 등록/완료 버튼
- ✅ 수정 모드 지원
- ✅ 글자 수 카운터

---

## 🔗 네비게이션 설정

`src/navigation/AppNavigator.tsx`에 다음 코드를 추가하세요:

### **1. Import 추가**
```typescript
import CommunityScreen from '../screens/community/CommunityScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import PostWriteScreen from '../screens/community/PostWriteScreen';
```

### **2. Stack.Navigator에 Screen 추가**
```typescript
<Stack.Screen 
  name="Community" 
  component={CommunityScreen} 
  options={{ headerShown: false }} 
/>
<Stack.Screen 
  name="PostDetail" 
  component={PostDetailScreen} 
  options={{ headerShown: false }} 
/>
<Stack.Screen 
  name="PostWrite" 
  component={PostWriteScreen} 
  options={{ headerShown: false }} 
/>
```

### **3. 하단 탭에 추가 (선택사항)**
```typescript
<Tab.Screen
  name="Community"
  component={CommunityScreen}
  options={{
    tabBarLabel: '커뮤니티',
    tabBarIcon: ({ color }) => (
      <Ionicons name="chatbubbles" size={24} color={color} />
    ),
  }}
/>
```

---

## 🚀 백엔드 마이그레이션 실행

### **Windows CMD:**
```cmd
cd C:\Users\한문수\farmsense-project\backend
python manage.py makemigrations community
python manage.py migrate community
python manage.py migrate
python scripts\init_community_data.py
```

### **또는 PowerShell 스크립트:**
```powershell
cd C:\Users\한문수\farmsense-project\backend
.\community_migrate.ps1
```

---

## 🧪 테스트

### **1. Django 서버 실행**
```cmd
cd C:\Users\한문수\farmsense-project\backend
python manage.py runserver 192.168.25.7:8000
```

### **2. Metro Bundler 실행**
```cmd
cd C:\Users\한문수\farmsense-project\frontend
npx expo start
```

### **3. 앱에서 테스트**
1. ✅ 커뮤니티 화면 접근
2. ✅ 카테고리 탭 전환
3. ✅ 게시글 작성 (이미지 포함)
4. ✅ 게시글 상세 보기
5. ✅ 좋아요/북마크
6. ✅ 댓글 작성
7. ✅ 답글 작성
8. ✅ 게시글 수정/삭제
9. ✅ 답변 채택 (질문 게시판)

---

## 🎨 스타일 특징

### **색상**
- Primary: `#10B981` (초록)
- 좋아요: `#ff4444` (빨강)
- 북마크: `#FFA500` (주황)
- 배경: `#F9FAFB` (밝은 회색)
- 카드: `#FFF` (흰색)

### **카드 스타일**
- 둥근 모서리 (`borderRadius: 12`)
- 그림자 효과 (`elevation: 3`)
- 카테고리 뱃지
- 통계 정보 (좋아요, 댓글, 조회수)

### **FAB 버튼**
- 우측 하단 고정
- 초록색 원형 (`borderRadius: 28`)
- 그림자 (`elevation: 8`)
- 아이콘: 글쓰기 (create)

### **카테고리 탭**
- 가로 스크롤
- 선택 시 초록색 배경
- 이모지 아이콘 포함

---

## 📦 필요한 패키지

모두 이미 설치되어 있어야 합니다:

```json
{
  "expo-image-picker": "^14.x.x",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/stack": "^6.x.x",
  "react-native-safe-area-context": "^4.x.x",
  "@expo/vector-icons": "^13.x.x"
}
```

---

## 🐛 문제 해결

### **이미지 업로드 실패**
- Django `MEDIA_URL`, `MEDIA_ROOT` 설정 확인
- `settings.py`에 미디어 파일 설정 추가:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### **네트워크 오류**
- `src/services/api.ts`의 `baseURL` 확인:
```typescript
baseURL: 'http://192.168.25.7:8000/api/'
```

### **권한 오류**
- 카메라/갤러리 권한이 필요합니다
- `app.json`에 권한 추가:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "포도박사가 사진을 선택하기 위해 갤러리 접근 권한이 필요합니다."
        }
      ]
    ]
  }
}
```

---

## 📊 API 엔드포인트

모든 API는 `src/services/communityApi.ts`에 정의됨:

- ✅ `getCategories()` - 카테고리 목록
- ✅ `getPosts()` - 게시글 목록
- ✅ `getPostDetail()` - 게시글 상세
- ✅ `createPost()` - 게시글 작성
- ✅ `updatePost()` - 게시글 수정
- ✅ `deletePost()` - 게시글 삭제
- ✅ `likePost()` - 좋아요
- ✅ `bookmarkPost()` - 북마크
- ✅ `getComments()` - 댓글 목록
- ✅ `createComment()` - 댓글 작성
- ✅ `deleteComment()` - 댓글 삭제
- ✅ `likeComment()` - 댓글 좋아요
- ✅ `acceptComment()` - 답변 채택

---

## ✅ 완료 체크리스트

- [x] `CommunityScreen.tsx` 생성
- [x] `PostDetailScreen.tsx` 생성
- [x] `PostWriteScreen.tsx` 생성
- [x] `communityApi.ts` 생성
- [ ] `AppNavigator.tsx` 수정 (네비게이션 추가)
- [ ] 백엔드 마이그레이션 실행
- [ ] 앱 테스트

---

**마지막 업데이트:** 2025-11-28  
**상태:** ✅ 프론트엔드 완료, 백엔드 마이그레이션 대기 중









