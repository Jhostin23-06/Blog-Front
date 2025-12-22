"use client"

import type React from "react"
import { Dialog, DialogContent, IconButton, Box, Typography, Avatar, TextField, Fade, Divider, CircularProgress, Link } from "@mui/material"
import { Close, Favorite, FavoriteBorder, MoreHoriz, Send, ChatBubbleOutline } from "@mui/icons-material"
import { useUser } from "../modules/blog/application/useUser"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../modules/blog/application/useAuth"
import { useImageComments, useImageDetails, useLikeImage, usePostImageComment, useUnlikeImage } from "../modules/blog/application/useImage"
import { useQueryClient } from "@tanstack/react-query"
import type { ImageComment } from "../modules/blog/domain/Image"
import { useAuthContext } from "../context/AuthContext"

interface ImageModalProps {
    imageId: string
    imageUrl: string
    ownerId?: string
    createdAt?: string
    onClose: () => void
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageId, imageUrl, ownerId, createdAt, onClose }) => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const { data: imageDetails, isLoading: isImageLoading } = useImageDetails(imageId);
    const { data: comments } = useImageComments(imageId);
    const { data: owner } = useUser(ownerId || "")
    // const { data: userImages } = useUserImages(ownerId || "")
    // const [liked, setLiked] = useState(false)
    const [comment, setComment] = useState("")

    const postComment = usePostImageComment();
    const like = useLikeImage();
    const unlike = useUnlikeImage();

    const API_BASE_URL = import.meta.env.VITE_API_NOTIFI || 'http://localhost:8000';

    const { subscribeToImageUpdates, unsubscribeFromImageUpdates } = useAuthContext();

    const isLiked = Boolean(currentUser?.id && imageDetails?.liked_by?.includes(currentUser.id));

    const likeCounts = imageDetails?.likes_count || 0;

    const commentCount = imageDetails?.comments_count! || 0;

    useEffect(() => {
        subscribeToImageUpdates(imageId);
        return () => {
            unsubscribeFromImageUpdates(imageId);
        };
    }, [imageId, subscribeToImageUpdates, unsubscribeFromImageUpdates]);

    const buildImageUrl = (urlPath?: string) => {
        if (!urlPath) return '';
        if (urlPath.startsWith('http')) return urlPath;
        return `${API_BASE_URL}${urlPath}`;
    };


    const formatDate = (dateString?: string) => {
        if (!dateString) return "Fecha no disponible"
        const date = new Date(dateString)
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleLike = useCallback(() => {
        if (!imageDetails || !currentUser?.id) return;

        // Actualización optimista
        queryClient.setQueryData(['imageDetails', imageId], (old: any) => {
            const wasLiked = old?.liked_by?.includes(currentUser.id);

            return {
                ...old,
                likes_count: wasLiked ? old.likes_count - 1 : old.likes_count + 1,
                liked_by: wasLiked
                    ? old.liked_by.filter((id: string) => id !== currentUser.id)
                    : [...old.liked_by, currentUser.id]
            };
        });

        // Llamar a la API
        const mutation = isLiked ? unlike : like;
        mutation.mutate(imageId);
    }, [imageDetails, imageId, isLiked, currentUser?.id, queryClient, like, unlike]);

    const handleSendComment = () => {
        if (comment.trim()) {
            postComment.mutate({ imageId, content: comment });
            setComment("");
        }
    }

    if (isImageLoading) {
        return (
            <Dialog open={true} onClose={onClose}>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: "90vh",
                    maxHeight: "90vh",
                    borderRadius: 3,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(8px)",
                },
            }}
        >
            <DialogContent sx={{ p: 0, height: "100%", display: "flex" }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        backdropFilter: "blur(10px)",
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            transform: "scale(1.1)",
                        },
                        transition: "all 0.2s ease-in-out",
                    }}
                >
                    <Close />
                </IconButton>

                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.9) 100%)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Fade in timeout={600}>
                        <img
                            src={imageUrl || "/placeholder.svg?height=600&width=800&query=beautiful+landscape"}
                            alt="Imagen ampliada"
                            style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: 8,
                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                            }}
                        />
                    </Fade>
                </Box>

                <Box
                    sx={{
                        width: "400px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderLeft: "1px solid rgba(0, 0, 0, 0.08)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                    src={buildImageUrl(owner?.profile_picture_url) || "/placeholder.svg?height=40&width=40&query=user+avatar"}
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        border: "2px solid rgba(99, 102, 241, 0.2)",
                                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                    }}
                                />
                                <Box>
                                    <Typography fontWeight="600" sx={{ color: "rgba(15, 23, 42, 0.9)" }}>
                                        {owner?.username || "Usuario"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "rgba(100, 116, 139, 0.8)" }}>
                                        {formatDate(createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton
                                size="small"
                                sx={{
                                    color: "rgba(100, 116, 139, 0.6)",
                                    "&:hover": {
                                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                                        color: "rgba(99, 102, 241, 0.8)",
                                    },
                                }}
                            >
                                <MoreHoriz />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            p: 3,
                            display: "flex",
                            alignItems: "center",
                            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                            background: "rgba(255, 255, 255, 0.5)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", flex: 1, gap: 2 }}>
                            <IconButton
                                onClick={handleLike}
                                size="small"
                                sx={{
                                    color: isLiked ? "#ef4444" : "inherit",
                                    "&:hover": {
                                        backgroundColor: isLiked ? "rgba(239, 68, 68, 0.1)" : "rgba(100, 116, 139, 0.1)",
                                        transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                {isLiked ? <Favorite /> : <FavoriteBorder />}
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "rgba(51, 65, 85, 0.8)" }}>
                                {likeCounts} me gusta
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ChatBubbleOutline sx={{ fontSize: 18, color: "rgba(100, 116, 139, 0.6)" }} />
                            <Typography variant="body2" sx={{ color: "rgba(100, 116, 139, 0.8)" }}>
                                {commentCount} comentarios
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            p: 3,
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "rgba(0, 0, 0, 0.05)",
                                borderRadius: "3px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "rgba(99, 102, 241, 0.3)",
                                borderRadius: "3px",
                                "&:hover": {
                                    background: "rgba(99, 102, 241, 0.5)",
                                },
                            },
                        }}
                    >
                        {comments?.map((comment: ImageComment) => (
                            <Fade in key={comment._id}>
                                <Box sx={{ mb: 3, display: "flex" }}>
                                    <Link href={`/profile/${comment.author_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <Avatar
                                        src={buildImageUrl(comment.profile_picture)}
                                        alt={comment.author_username}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            mr: 2,
                                            border: "2px solid rgba(99, 102, 241, 0.1)",
                                        }}
                                    />
                                    </Link>
                                    <Box sx={{ flex: 1 }}>
                                        <Box
                                            sx={{
                                                background:
                                                    "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)",
                                                borderRadius: "18px",
                                                p: 2,
                                                width: "fit-content",
                                                maxWidth: "85%",
                                                border: "1px solid rgba(226, 232, 240, 0.5)",
                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "rgba(15, 23, 42, 0.9)",
                                                    mb: 0.5,
                                                }}
                                            >
                                                {comment.author_username}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "rgba(51, 65, 85, 0.8)",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {comment.content}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                ml: 2,
                                                color: "rgba(100, 116, 139, 0.7)",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {formatDate(comment.created_at)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Fade>
                        ))}
                    </Box>

                    <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.08)" }} />

                    <Box
                        sx={{
                            p: 3,
                            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                                src={buildImageUrl(currentUser?.profile_picture_url)}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    border: "2px solid rgba(99, 102, 241, 0.2)",
                                }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Escribe un comentario..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                                disabled={postComment.isPending}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
                                        background: "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)",
                                        border: "1px solid rgba(226, 232, 240, 0.5)",
                                        "&:hover": {
                                            border: "1px solid rgba(99, 102, 241, 0.3)",
                                        },
                                        "&.Mui-focused": {
                                            border: "2px solid rgba(99, 102, 241, 0.5)",
                                            boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                                        },
                                    },
                                }}
                            />
                            <IconButton
                                onClick={handleSendComment}
                                disabled={!comment.trim()}
                                sx={{
                                    background: comment.trim()
                                        ? "linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
                                        : "rgba(148, 163, 184, 0.3)",
                                    color: "white",
                                    "&:hover": {
                                        background: comment.trim()
                                            ? "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)"
                                            : "rgba(148, 163, 184, 0.3)",
                                        transform: comment.trim() ? "scale(1.05)" : "none",
                                    },
                                    "&:disabled": {
                                        color: "rgba(148, 163, 184, 0.5)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                <Send sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
