"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    TextField,
    Box,
    Typography,
    Avatar,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
    Card,
    CardContent,
    Fade,
    Paper,
    Badge,
} from "@mui/material"
import {
    Favorite as FavoriteIcon,
} from "@mui/icons-material"
import { Send as SendIcon, Close as CloseIcon, Comment as CommentIcon } from "@mui/icons-material"
import type { Post } from "../modules/blog/domain/Post"
import { useComments, useCreateComment } from "../modules/blog/application/useComment"
import { useAuthContext } from "../context/AuthContext"
import { useAuth } from "../modules/blog/application/useAuth"

interface CommentsModalProps {
    open: boolean
    onClose: () => void
    post: Post
}

// const ActionButton = styled(IconButton)(({ theme }) => ({
//     borderRadius: 12,
//     padding: 8,
//     transition: "all 0.2s ease",
//     "&:hover": {
//         backgroundColor: theme.palette.action.hover,
//         transform: "scale(1.1)",
//     },
// }))

export function CommentsModal({ open, onClose, post }: CommentsModalProps) {
    // const theme = useTheme()
    const { user } = useAuth();
    const [commentText, setCommentText] = useState("");
    const { data: comments, isLoading } = useComments(post._id);
    const createCommentMutation = useCreateComment(post._id);
    const { subscribeToPostUpdates } = useAuthContext();

    const API_BASE_URL = import.meta.env.VITE_API_NOTIFI || 'http://localhost:8000';

    const buildImageUrl = (urlPath?: string) => {
        if (!urlPath) return '';
        if (urlPath.startsWith('http')) return urlPath;
        return `${API_BASE_URL}${urlPath}`;
    };


    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;
        await createCommentMutation.mutateAsync({
            content: commentText,
            post_id: post._id,
        });
        setCommentText("");
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            handleSubmitComment()
        }
    }

    // useEffect 
    useEffect(() => {
        if (open) {
            subscribeToPostUpdates(post._id);
        }
    }, [open, post._id, subscribeToPostUpdates]);


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    maxHeight: "90vh",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
            }}
            TransitionComponent={Fade}
            transitionDuration={300}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "16px 16px 0 0",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CommentIcon />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Comentarios ({comments?.length || 0})
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        p: 3,
                        flexDirection: { xs: "column", md: "row" },
                        minHeight: 500,
                    }}
                >
                    {/* Post Column */}
                    <Card
                        sx={{
                            width: { xs: "100%", md: "40%" },
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "grey.200",
                            position: "relative",
                            overflow: "hidden",
                            "&:before": {
                                content: '""',
                                position: "absolute",
                                left: 0,
                                top: 0,
                                height: "100%",
                                width: "4px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    color: "primary.main",
                                    lineHeight: 1.3,
                                }}
                            >
                                {post.title}
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: "text.secondary",
                                    whiteSpace: "pre-line",
                                    lineHeight: 1.6,
                                    mb: 3,
                                }}
                            >
                                {post.content}
                            </Typography>

                            {post.image_url && (
                                <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
                                    <img
                                        src={buildImageUrl(post.image_url)}
                                        alt={post.title}
                                        style={{ width: "100%", height: "auto" }}
                                    />
                                </Box>
                            )}


                            <Divider sx={{ my: 2 }} />

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        mr: 1.5,
                                        border: "2px solid",
                                        borderColor: "primary.100",
                                    }}
                                    src={buildImageUrl(post.author_profile_picture)}
                                >
                                    {post.author_username?.[0]?.toUpperCase() || "U"}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {post.author_username || "Usuario"}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        {new Date(post.created_at).toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </Typography>
                                </Box>

                                <Box sx={{ 
                                    display: "flex", 
                                    alignItems: "center",
                                    marginLeft: "auto" // Pushes the box to the end
                                }}>
                                    <Badge
                                        badgeContent={post.likes_count}
                                        color="error"
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                fontSize: "0.75rem",
                                                minWidth: 18,
                                                height: 18,
                                            },
                                        }}
                                    >
                                        <FavoriteIcon sx={{ fontSize: 20, color: "error.main" }} />
                                    </Badge>   
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Comments Column */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "60%" },
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Paper
                            sx={{
                                flexGrow: 1,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "grey.200",
                                overflow: "hidden",
                            }}
                        >
                            <List
                                sx={{
                                    maxHeight: 400,
                                    overflow: "auto",
                                    p: 0,
                                    "&::-webkit-scrollbar": {
                                        width: "6px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "rgba(0,0,0,0.2)",
                                        borderRadius: "3px",
                                    },
                                }}
                            >
                                {comments?.map((comment, index) => (
                                    <Fade in={true} timeout={300 + index * 100} key={comment._id}>
                                        <Box>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 3,
                                                    py: 2.5,
                                                    "&:hover": {
                                                        bgcolor: "grey.50",
                                                    },
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Box
                                                        component="a" 
                                                        href={`/profile/${comment.author_id}`}
                                                        sx={{
                                                            textDecoration: 'none',
                                                            display: 'block',
                                                            '&:hover': {
                                                                opacity: 0.8,
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: "primary.main",
                                                                width: 40,
                                                                height: 40,
                                                                border: "2px solid",
                                                                borderColor: "primary.100",
                                                            }}
                                                            src={buildImageUrl(comment.author_profile_picture)}
                                                        >
                                                            {/* {comment.author_username.charAt(0).toUpperCase()} */}
                                                        </Avatar>
                                                    </Box>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                {comment.author_username}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {new Date(comment.created_at).toLocaleDateString("es-ES", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: "text.primary" }}>
                                                            {comment.content}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                                        </Box>
                                    </Fade>
                                ))}
                            </List>
                        </Paper>

                        {/* Comment Form */}
                        <Paper
                            sx={{
                                mt: 2,
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "grey.200",
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                                <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>U</Avatar>
                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    placeholder="Escribe un comentario..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={!user || createCommentMutation.isPending}
                                    onKeyPress={handleKeyPress}
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                            bgcolor: "grey.50",
                                            "&:hover": {
                                                bgcolor: "white",
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSubmitComment}
                                    disabled={!user || !commentText.trim() || createCommentMutation.isPending}
                                    sx={{
                                        minWidth: 56,
                                        height: 56,
                                        borderRadius: 3,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                                        },
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
