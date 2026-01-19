# Frontend Community Feature Documentation

This document provides a comprehensive overview of the frontend implementation for the "Community" feature in FarmSense. Use this information to guide the backend implementation.

## 1. Feature Overview
The Community feature allows users to share posts, ask questions, and interact via comments. It supports multiple categories, image uploads, likes, bookmarks, and expert verification.

## 2. API Endpoints (Planned)

Based on `src/constants/config.ts` and `src/services/communityApi.ts`, the frontend expects the following endpoints:

### 2.1 Categories
- **GET** `/community/categories/`
  - Returns list of categories (e.g., General, Q&A, Tips).

### 2.2 Posts
- **GET** `/community/posts/`
  - Params: `category` (id), `page`, `page_size`, `search`, `ordering` ('latest', 'popular').
- **POST** `/community/posts/`
  - Body (FormData): `category` (id), `title`, `content`, `is_anonymous` (bool), `images` (files).
- **GET** `/community/posts/{id}/`
  - Detailed post info including images, stats, and author info.
- **PUT** `/community/posts/{id}/`
  - Update post content/images.
- **DELETE** `/community/posts/{id}/`
- **POST** `/community/posts/{id}/like/`
  - Toggle like.
- **POST** `/community/posts/{id}/bookmark/`
  - Toggle bookmark.

### 2.3 Comments
- **GET** `/community/posts/{postId}/comments/`
  - List comments for a post.
- **POST** `/community/posts/{postId}/comments/`
  - Body: `content`, `parent` (for nested replies), `is_anonymous`.
- **DELETE** `/community/comments/{id}/`
- **POST** `/community/comments/{id}/like/`
- **POST** `/community/comments/{id}/accept/`
  - Mark a comment as the accepted answer (for Q&A).

### 2.4 User Specific
- **GET** `/community/my-posts/`
- **GET** `/community/my-comments/`
- **GET** `/community/my-bookmarks/`

## 3. Data Structures (Types)

### 3.1 Post (`src/services/communityApi.ts`)
```typescript
interface Post {
  id: number;
  category: number;
  category_name: string;
  category_icon: string;
  author_name: string;
  title: string;
  content?: string;
  is_anonymous: boolean;
  is_answered: boolean;     // For Q&A resolution status
  view_count: number;
  like_count: number;
  comment_count: number;
  image_count?: number;
  images?: PostImage[];     // Array of image objects
  is_liked: boolean;
  is_bookmarked: boolean;
  is_author?: boolean;      // If current user is author
  created_at: string;
  updated_at: string;
}
```

### 3.2 Comment (`src/services/communityApi.ts`)
```typescript
interface Comment {
  id: number;
  post: number;
  author_id: number;
  author_name: string;
  parent: number | null;    // ID of parent comment (for 1-level nesting)
  content: string;
  is_anonymous: boolean;
  is_accepted: boolean;     // For Q&A accepted answer
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}
```

### 3.3 Static Categories (`src/screens/community/types.ts`)
*Currently used for hardcoded UI, should sync with Backend DB.*
- `general`: 자유게시판
- `qna`: 질문/답변
- `tip`: 농사꿀팁
- `notice`: 공지사항
- `inquiry`: 문의게시판

## 4. UI/UX Requirements

### 4.1 Screen List
1.  **Community List Screen (`CommunityScreen.tsx`)**:
    - Tabs for category filtering.
    - Badges for current status ("답변대기", "해결됨").
    - FAB (Floating Action Button) for writing new posts.
2.  **Post Detail Screen (`PostDetailScreen.tsx`)**:
    - Scrollable content with images.
    - Comment section with nesting support (implied).
    - "Expert" badge handling in comments.
3.  **Write Screen (`PostWriteScreen.tsx`)**:
    - Category selector.
    - Title & Content input (multiline).
    - Image picker (up to 5 images).

### 4.2 Key Logic
- **Q&A Status**: If category is 'qna', display "Resolved" vs "Waiting" badge based on `is_answered` or `isResolved` flag.
- **Expert Badge**: Comments from users with expert role/level should display a distinct badge.
- **Anonymous**: Posts/Comments can be anonymous.
