// En src/hooks/useComments.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { 
  createComment, 
  getCommentById, 
  listCommentsByPost, 
  deleteComment 
} from "../infrastructure/PostApi";
import type { 
  Comment, 
  CommentCreateRequest, 
  CommentsListResponse 
} from "../domain/Post";
import { useAuth } from "./useAuth";

// Hook para obtener comentarios de un post con paginación
export function usePostComments(postId: number, size: number = 10) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['comments', 'post', postId],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      return listCommentsByPost(postId, { size }, token);
    },
    enabled: !!postId && !!token,
    staleTime: 2 * 60 * 1000, // 2 minutos
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
      // Invalidar y refetch comentarios del post
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', variables.postId] });
      
      // Actualizar contador de comentarios en el post cache
      queryClient.setQueryData(['post', variables.postId], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          commentsCount: (oldPost.commentsCount || 0) + 1
        };
      });
      
      // También actualizar listas de posts
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
      
      // Actualizar contador de comentarios en el post cache
      queryClient.setQueryData(['post', variables.postId], (oldPost: any) => {
        if (!oldPost) return oldPost;
        const newCount = Math.max((oldPost.commentsCount || 1) - 1, 0);
        return {
          ...oldPost,
          commentsCount: newCount
        };
      });
      
      // También actualizar listas de posts
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