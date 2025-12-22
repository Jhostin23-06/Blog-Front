import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadCoverPhoto,
  uploadProfilePicture,
  getUserImages,
  getImageDetails,
  deleteImage,
  getImageComments,
  postImageComment,
  likeImage,
  unlikeImage
} from "../infrastructure/ImageApi";
import type { IImage, ImageUploadResponse } from "../domain/Image";
import { useAuth } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';



export function useUserImages(userId: string) {
  return useQuery<IImage[], Error>({
    queryKey: ['userImages', userId],
    queryFn: () => getUserImages(userId),
    enabled: !!userId,
  });
}

export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<ImageUploadResponse, Error, File>({
    mutationFn: uploadProfilePicture,
    onSuccess: (data) => {
      // Guarda la imagen recién subida en el estado
      queryClient.setQueryData(['userImages', user?.id, 'profile_picture'], (old: IImage[] = []) => [
        ...old,
        data
      ]);
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id, 'profile_picture'] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id] });
    },
  });
}

export function useUploadCoverPhoto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<ImageUploadResponse, Error, File>({
    mutationFn: uploadCoverPhoto,
    onSuccess: (data) => {
      // Guarda la imagen recién subida en el estado
      queryClient.setQueryData(['userImages', user?.id, 'cover_photo'], (old: IImage[] = []) => [
        ...old,
        data
      ]);
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id, 'cover_photo'] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id] });

    },
  });
}

export function useImageDetails(imageId: string) {
  return useQuery<IImage, Error>({
    queryKey: ['imageDetails', imageId],
    queryFn: () => getImageDetails(imageId),
    enabled: !!imageId,
    staleTime: 0,
    refetchOnMount: 'always', // Forzar recarga al montar
    refetchOnWindowFocus: true // Recargar cuando la ventana gana foco
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: deleteImage,
    onSuccess: (_, imageId) => {
      // Actualizar las queries para eliminar la imagen del estado
      queryClient.setQueryData(['userImages', user?.id], (old: IImage[] = []) =>
        old.filter(img => img._id !== imageId)
      );

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
    },
  });
}

export function useSetProfilePicture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (imageId: string) =>
      fetch(`${API_URL}/users/${user?.id}/profile-picture`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ imageId }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id] });
    }
  });
}

export function useSetCoverPhoto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (imageId: string) =>
      fetch(`${API_URL}/users/${user?.id}/cover-photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ imageId }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userImages', user?.id] });
    }
  });
}

export function useImageComments(imageId: string) {
  return useQuery({
    queryKey: ['imageComments', imageId],
    queryFn: () => getImageComments(imageId),
    enabled: !!imageId,
    staleTime: 0,
    refetchOnMount: 'always', // Forzar recarga al montar
    refetchOnWindowFocus: true, // Recargar cuando la ventana gana foco
  });
}

export function usePostImageComment() {
  const queryClient = useQueryClient();
  // const { user } = useAuth();

  return useMutation({
    mutationFn: ({ imageId, content }: { imageId: string; content: string }) => postImageComment(imageId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries( { queryKey: ['imageComments', variables.imageId]});
      queryClient.invalidateQueries( { queryKey: ['imageDetails', variables.imageId]});
    }
  });
}

export function useLikeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => likeImage(imageId),
    onSuccess: (_, imageId) => {
      queryClient.invalidateQueries( { queryKey: ['imageDetails', imageId]});
    }
  });
}

export function useUnlikeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => unlikeImage(imageId),
    onSuccess: (_, imageId) => {
      queryClient.invalidateQueries( { queryKey: ['imageDetails', imageId]});
    }
  });
}