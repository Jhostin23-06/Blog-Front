// En src/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  createPost,
  getPostById,
  listPosts,
  updatePost,
  deletePost,
  listCategories,
  createCategory,
  createComment,
  getPostComments,
  listCommentsByPost,
  deleteComment
} from "../infrastructure/PostApi";
import type {
  Post,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  PostListParams,
  CommentsListResponse
} from "../domain/Post";
import { useAuth } from "./useAuth";

// Hook para obtener posts con paginación
export function usePosts(params: PostListParams = {}) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['posts', 'list', params],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      return listPosts(params, token);
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para posts infinitos (scroll infinito)
export function useInfinitePosts(params: Omit<PostListParams, 'page'> = {}) {
  const { token } = useAuth();
  
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      if (!token) throw new Error('No hay token disponible');
      return listPosts({ ...params, page: pageParam }, token);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.first) return undefined;
      return firstPage.number - 1;
    },
    enabled: !!token,
  });
}

// Hook para un post específico
export function usePost(postId: number) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      return getPostById(postId, token);
    },
    enabled: !!postId && !!token,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear post
export function useCreatePost() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<PostCreateRequest, 'userId'>) => {
      if (!token) throw new Error('No hay token disponible');
      if (!user?.id) throw new Error('Usuario no identificado');
      
      const postData: PostCreateRequest = {
        ...data,
        userId: user.id
      };
      
      return createPost(postData, token);
    },
    onSuccess: (newPost) => {
      // Invalidar queries de posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
      
      // Agregar el nuevo post al cache
      queryClient.setQueryData(['post', newPost.id], newPost);
    },
  });
}

// Hook para actualizar post
export function useUpdatePost() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, data }: { postId: number; data: PostUpdateRequest }) => {
      if (!token) throw new Error('No hay token disponible');
      return updatePost(postId, data, token);
    },
    onSuccess: (updatedPost) => {
      // Actualizar cache del post específico
      queryClient.setQueryData(['post', updatedPost.id], updatedPost);
      
      // Invalidar queries de lista de posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}


// Hook para eliminar post
export function useDeletePost() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: number) => {
      if (!token) throw new Error('No hay token disponible');
      return deletePost(postId, token);
    },
    onSuccess: (_, postId) => {
      // Remover post del cache
      queryClient.removeQueries({ queryKey: ['post', postId] });
      
      // Invalidar queries de lista de posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
    },
  });
}

// Hook para categorías
export function useCategories() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      return listCategories(token);
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para crear categoría (admin/superadmin)
export function useCreateCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      if (!token) throw new Error('No hay token disponible');
      return createCategory(name, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Hook para comentarios
// Hook para comentarios de un post (con paginación)
export function usePostComments(postId: number, size: number = 10) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['comments', 'post', postId],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      return listCommentsByPost(postId, { size }, token);
    },
    enabled: !!postId && !!token,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para crear comentario
export function useCreateComment() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      if (!token) throw new Error('No hay token disponible');
      if (!user?.id) throw new Error('Usuario no identificado');
      
      const commentData: CommentCreateRequest = {
        content,
        postId,
        userId: user.id
      };
      
      return createComment(commentData, token);
    },
    onSuccess: (newComment, variables) => {
      // Invalidar comentarios del post
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', variables.postId] });
      
      // Incrementar contador de comentarios en el post
      queryClient.setQueryData(['post', variables.postId], (oldPost: Post) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          commentsCount: (oldPost.commentsCount || 0) + 1
        };
      });
      
      // También invalidar listas de posts para actualizar contadores
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['recentPosts'] });
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
    }
  });
}

// Hook para eliminar comentario
export function useDeleteComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: number; postId: number }) => {
      if (!token) throw new Error('No hay token disponible');
      return deleteComment(commentId, token);
    },
    onSuccess: (_, variables) => {
      // Invalidar comentarios del post
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', variables.postId] });
      
      // Decrementar contador de comentarios en el post
      queryClient.setQueryData(['post', variables.postId], (oldPost: Post) => {
        if (!oldPost) return oldPost;
        const newCount = Math.max((oldPost.commentsCount || 1) - 1, 0);
        return {
          ...oldPost,
          commentsCount: newCount
        };
      });
      
      // También invalidar listas de posts para actualizar contadores
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['recentPosts'] });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
    }
  });
}

// Hook para comentarios infinitos (scroll infinito)
export function useInfiniteComments(postId: number, pageSize: number = 10) {
  const { token } = useAuth();
  
  return useInfiniteQuery({
    queryKey: ['comments', 'infinite', postId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!token) throw new Error('No hay token disponible');
      return listCommentsByPost(postId, { page: pageParam, size: pageSize }, token);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: CommentsListResponse) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    getPreviousPageParam: (firstPage: CommentsListResponse) => {
      if (firstPage.first) return undefined;
      return firstPage.number - 1;
    },
    enabled: !!postId && !!token,
  });
}

// Hook para posts de un usuario específico
export function useUserPosts(userId: number) {
  return usePosts({ userId });
}

// Hook para posts destacados
export function useFeaturedPosts() {
  return usePosts({ sort: 'featured', size: 5 });
}

// Hook para posts recientes
export function useRecentPosts(limit: number = 10) {
  return usePosts({ sort: 'recent', size: limit });
}