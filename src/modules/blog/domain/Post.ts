// En src/domain/Post.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string | null;
  userId: number;
  username: string;
  categoryId: number;
  categoryName: string;
  // Campos opcionales para UI
  likes?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  imageUrl?: string;
  tags?: string[];
}

export interface PostCreateRequest {
  title: string;
  content: string;
  userId: number;
  categoryId: number;
  isFeatured?: boolean;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  isFeatured?: boolean;
}

export interface PostsListResponse {
  content: Post[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  userId: number;
  username: string;
  // Campos opcionales para UI
  isAuthor?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
}

export interface CommentCreateRequest {
  content: string;
  postId: number;
  userId: number;
}

export interface CommentsListResponse {
  content: Comment[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export interface CommentUpdateRequest {
  content?: string;
}

// Tipos para parámetros de búsqueda
export interface PostListParams {
  categoryId?: number;
  sort?: 'recent' | 'popular' | 'featured';
  page?: number;
  size?: number;
  userId?: number; // Para filtrar por usuario
}