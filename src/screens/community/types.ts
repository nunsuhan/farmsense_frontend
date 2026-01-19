export type PostCategory = 'general' | 'qna' | 'tip' | 'notice' | 'inquiry';

export interface Comment {
    id: string;
    author: {
        name: string;
        avatar?: string;
    };
    content: string;
    createdAt: string;
    isExpert?: boolean; // 전문가 답변 여부
}

export interface Post {
    id: string;
    category: PostCategory;
    title: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
        level?: string; // e.g. '초보농부', '마스터'
    };
    createdAt: string;
    images: string[];
    likes: number;
    commentCount: number;
    viewCount: number;
    isResolved?: boolean; // Q&A 해결 여부
    comments?: Comment[];
}

export const POST_CATEGORIES: Record<PostCategory, string> = {
    general: '자유게시판',
    qna: '질문/답변',
    tip: '농사꿀팁',
    notice: '공지사항',
    inquiry: '문의게시판',
};
