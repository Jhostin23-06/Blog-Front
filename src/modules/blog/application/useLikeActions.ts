import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "../infrastructure/PostApi";
import { useAuthContext } from "../../../context/AuthContext";

export function useLikeActions() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();

    const like = useMutation({
        mutationFn: likePost,
        // Actualización optimista
        onMutate: async (postId) => {
            // Cancelar queries en curso
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({ queryKey: ["postsbyusers"] });
            await queryClient.cancelQueries({ queryKey: ["postbyid", postId] });

            // Guardar estado anterior
            const previousPosts = queryClient.getQueryData(["posts"]);
            const previousUserPosts = queryClient.getQueryData(["postsbyusers", user?.id]);
            const previousPost = queryClient.getQueryData(["postbyid", postId]);

            // Actualizar la caché optimistamente
            queryClient.setQueryData(["posts"], (old: any) => {
                return old?.map((p: any) => {
                    if (p._id === postId) {
                        const newLikedBy = p.liked_by ? [...p.liked_by] : [];
                        // Añadir el ID del usuario si no está ya
                        if (!newLikedBy.includes(user?.id)) {
                            newLikedBy.push(user?.id);
                        }
                        return {
                            ...p,
                            likes_count: p.likes_count + 1,
                            liked_by: newLikedBy,
                            liked_by_user: true
                        };
                    }
                    return p;
                });
            });

            // Hacer lo mismo para postsbyusers
            queryClient.setQueryData(["postsbyusers", user?.id], (old: any) => {
                if (!old?.posts) return old;
                return {
                    ...old,
                    posts: old.posts.map((p: any) => {
                        if (p._id === postId) {
                            return {
                                ...p,
                                likes_count: p.likes_count + 1,
                                liked_by_user: true
                            };
                        }
                        return p;
                    })
                };
            });

            queryClient.setQueryData(["postbyid", postId], (old: any) => {
                if (!old) return old;
                
                const newLikedBy = old.liked_by ? [...old.liked_by] : [];
                // Añadir el ID del usuario si no está ya
                if (!newLikedBy.includes(user?.id)) {
                    newLikedBy.push(user?.id);
                }
                
                return {
                    ...old,
                    likes_count: old.likes_count + 1,
                    liked_by: newLikedBy,
                    has_liked: true
                };
            });

            // Devolver contexto para onError
            return { previousPosts, previousUserPosts, previousPost };

        },
        onError: (err, postId, context) => {
            console.error("Error al dar like:", err);
            console.log("PostID:", postId);
            // Revertir a estado anterior en caso de error
            queryClient.setQueryData(["posts"], context?.previousPosts);
            queryClient.setQueryData(["postsbyusers", user?.id], context?.previousUserPosts);
            queryClient.setQueryData(["postbyid", postId], context?.previousPost);
        },
        onSettled: () => {
            // Opcionalmente, invalidar queries después de completar
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["postsbyusers", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["postbyid"] });
        }
    });

    const unlike = useMutation({
        mutationFn: unlikePost,
        // Actualización optimista
        onMutate: async (postId) => {
            // Cancelar queries en curso
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({ queryKey: ["postsbyusers"] });
            await queryClient.cancelQueries({ queryKey: ["postbyid", postId] });


            // Guardar estado anterior
            const previousPosts = queryClient.getQueryData(["posts"]);
            const previousUserPosts = queryClient.getQueryData(["postsbyusers", user?.id]);
            const previousPost = queryClient.getQueryData(["postbyid", postId]);


            // Actualizar la caché optimistamente
            queryClient.setQueryData(["posts"], (old: any) => {
                return old?.map((p: any) => {
                    if (p._id === postId) {
                        // Filtrar el ID del usuario del array liked_by
            const newLikedBy = p.liked_by ? p.liked_by.filter((id: string) => id !== user?.id) : [];
                        return {
                            ...p,
                            likes_count: p.likes_count - 1,
                            liked_by: newLikedBy,
                            liked_by_user: false
                        };
                    }
                    return p;
                });
            });

            // Hacer lo mismo para postsbyusers
            queryClient.setQueryData(["postsbyusers", user?.id], (old: any) => {
                if (!old?.posts) return old;
                return {
                    ...old,
                    posts: old.posts.map((p: any) => {
                        if (p._id === postId) {
                            return {
                                ...p,
                                likes_count: p.likes_count - 1,
                                liked_by_user: false
                            };
                        }
                        return p;
                    })
                };
            });

            queryClient.setQueryData(["postbyid", postId], (old: any) => {
                if (!old) return old;
                
                const newLikedBy = old.liked_by ? old.liked_by.filter((id: string) => id !== user?.id) : [];
                
                return {
                    ...old,
                    likes_count: old.likes_count - 1,
                    liked_by: newLikedBy,
                    has_liked: false
                };
            });

            // Devolver contexto para onError
            return { previousPosts, previousUserPosts, previousPost};
        },
        onError: (_, postId, context) => {
            console.log(postId)
            // Revertir a estado anterior en caso de error
            queryClient.setQueryData(["posts"], context?.previousPosts);
            queryClient.setQueryData(["postsbyusers", user?.id], context?.previousUserPosts);
            queryClient.setQueryData(["postbyid", postId], context?.previousPost);
        },
        onSettled: () => {
            // Opcionalmente, invalidar queries después de completar
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["postsbyusers", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["postbyid"] });
        }
    });

    const toggleLike = (postId: string, isCurrentlyLiked: boolean) => {
        if (!user) return;

        if (isCurrentlyLiked) {
            unlike.mutate(postId);
        } else {
            like.mutate(postId);
        }
    };

    return {
        toggleLike,
        isLoading: like.isPending || unlike.isPending,
        isLiking: like.isPending,
        isUnliking: unlike.isPending
    };
}