// communityApi.ts - 커뮤니티 API 서비스
import api from './api';

// ==================== 인터페이스 ====================

export interface Category {
  id: number;
  name: string;
  icon: string;
  order: number;
  is_active: boolean;
  post_count: number;
  created_at: string;
}

export interface PostImage {
  id: number;
  image: string;
  order: number;
  created_at: string;
}

export interface Post {
  id: number;
  category: number;
  category_name: string;
  category_icon: string;
  author_name: string;
  title: string;
  content?: string;
  is_anonymous: boolean;
  is_answered: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  image_count?: number;
  images?: PostImage[];
  is_liked: boolean;
  is_bookmarked: boolean;
  is_author?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  post: number;
  author_id: number;
  author_name: string;
  parent: number | null;
  content: string;
  is_anonymous: boolean;
  is_accepted: boolean;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PostCreateData {
  category: number;
  title: string;
  content: string;
  is_anonymous: boolean;
  images?: any[];
}

// ==================== API 함수 ====================

/**
 * 카테고리 목록 조회
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/community/categories/');
  return response.data.results || response.data;
};

/**
 * 게시글 목록 조회
 */
export const getPosts = async (
  category?: number,
  page: number = 1,
  search?: string,
  ordering: string = 'latest'
): Promise<PaginatedResponse<Post>> => {
  const params: any = {
    page,
    page_size: 10,
    ordering,
  };

  if (category) {
    params.category = category;
  }

  if (search) {
    params.search = search;
  }

  const response = await api.get('/community/posts/', { params });
  return response.data;
};

/**
 * 게시글 상세 조회
 */
export const getPostDetail = async (id: number): Promise<Post> => {
  const response = await api.get(`/community/posts/${id}/`);
  return response.data;
};

/**
 * 게시글 작성
 */
export const createPost = async (data: FormData): Promise<Post> => {
  const response = await api.post('/community/posts/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 게시글 수정
 */
export const updatePost = async (id: number, data: FormData): Promise<Post> => {
  const response = await api.put(`/community/posts/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 게시글 삭제
 */
export const deletePost = async (id: number): Promise<void> => {
  await api.delete(`/community/posts/${id}/`);
};

/**
 * 게시글 좋아요 토글
 */
export const likePost = async (id: number): Promise<{ message: string; is_liked: boolean }> => {
  const response = await api.post(`/community/posts/${id}/like/`);
  return response.data;
};

/**
 * 게시글 북마크 토글
 */
export const bookmarkPost = async (id: number): Promise<{ message: string; is_bookmarked: boolean }> => {
  const response = await api.post(`/community/posts/${id}/bookmark/`);
  return response.data;
};

/**
 * 댓글 목록 조회
 */
export const getComments = async (postId: number): Promise<Comment[]> => {
  const response = await api.get(`/community/posts/${postId}/comments/`);
  return response.data;
};

/**
 * 댓글 작성
 */
export const createComment = async (
  postId: number,
  content: string,
  parentId?: number,
  isAnonymous: boolean = false
): Promise<Comment> => {
  const response = await api.post(`/community/posts/${postId}/comments/`, {
    content,
    parent: parentId || null,
    is_anonymous: isAnonymous,
  });
  return response.data;
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (id: number): Promise<void> => {
  await api.delete(`/community/comments/${id}/`);
};

/**
 * 댓글 좋아요 토글
 */
export const likeComment = async (id: number): Promise<{ message: string; is_liked: boolean }> => {
  const response = await api.post(`/community/comments/${id}/like/`);
  return response.data;
};

/**
 * 답변 채택
 */
export const acceptComment = async (id: number): Promise<{ message: string; is_accepted: boolean }> => {
  const response = await api.post(`/community/comments/${id}/accept/`);
  return response.data;
};

/**
 * 내가 쓴 글
 */
export const getMyPosts = async (page: number = 1): Promise<PaginatedResponse<Post>> => {
  const response = await api.get('/community/my-posts/', {
    params: { page, page_size: 10 },
  });
  return response.data;
};

/**
 * 내가 쓴 댓글
 */
export const getMyComments = async (page: number = 1): Promise<PaginatedResponse<Comment>> => {
  const response = await api.get('/community/my-comments/', {
    params: { page, page_size: 10 },
  });
  return response.data;
};

/**
 * 북마크한 글
 */
export const getMyBookmarks = async (page: number = 1): Promise<PaginatedResponse<any>> => {
  const response = await api.get('/community/my-bookmarks/', {
    params: { page, page_size: 10 },
  });
  return response.data;
};
