// En src/components/CommentsSection.tsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    Menu,
    MenuItem,
    Paper,
} from '@mui/material';
import {
    Send,
    MoreVert,
    Delete,
    Edit,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../modules/blog/application/useAuth';
import { usePermissions } from '../modules/blog/application/usePermissions';
import { useDeleteComment, usePostComments } from '../modules/blog/application/useComment';
import { useCreateComment } from '../modules/blog/application/usePost';

interface CommentsSectionProps {
    postId: number;
    postAuthorId?: number;
}

export function CommentsSection({ postId, postAuthorId }: CommentsSectionProps) {
    const { user } = useAuth();
    const { canDeletePost, canEditPost } = usePermissions();

    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

    const { data: commentsData, isLoading, error, refetch } = usePostComments(postId);
    const { mutateAsync: createComment, isPending: isCreating } = useCreateComment();
    const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteComment();

    const [submitError, setSubmitError] = useState<string | null>(null);

    const comments = commentsData?.content || [];
    const totalComments = commentsData?.totalElements || 0;

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim()) {
            setSubmitError('El comentario no puede estar vacío');
            return;
        }

        if (!user) {
            setSubmitError('Debes iniciar sesión para comentar');
            return;
        }

        setSubmitError(null);

        try {
            await createComment({
                postId,
                content: newComment
            });
            setNewComment('');
        } catch (err: any) {
            setSubmitError(err.message || 'Error al publicar comentario');
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    const handleDeleteComment = async () => {
        if (!selectedComment) return;

        if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            handleMenuClose();
            return;
        }

        try {
            await deleteComment({
                commentId: selectedComment.id,
                postId
            });
            setSubmitError(null);
        } catch (err: any) {
            setSubmitError(err.message || 'Error al eliminar comentario');
        } finally {
            handleMenuClose();
        }
    };

    const handleStartEdit = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
        handleMenuClose();
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    const handleSaveEdit = async () => {
        if (!editingCommentId || !editContent.trim()) return;

        // TODO: Implementar actualización de comentario cuando tengas el endpoint
        console.log('Edit comment:', editingCommentId, editContent);
        setEditingCommentId(null);
        setEditContent('');
    };

    const canDeleteComment = (commentUserId: number) => {
        // El autor del post puede eliminar cualquier comentario
        if (user?.id === postAuthorId) return true;
        // El autor del comentario puede eliminarlo
        if (user?.id === commentUserId) return true;
        // Admins pueden eliminar cualquier comentario
        if (canDeletePost(commentUserId)) return true;
        return false;
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: es
            });
        } catch {
            return 'Fecha desconocida';
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error al cargar comentarios: {(error as Error).message}
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Comentarios ({totalComments})
            </Typography>

            {/* Formulario para nuevo comentario */}
            {user && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Comentar como {user.username}
                    </Typography>
                    <form onSubmit={handleSubmitComment}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe tu comentario..."
                            variant="outlined"
                            disabled={isCreating}
                            sx={{ mb: 2 }}
                        />

                        {submitError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {submitError}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={isCreating ? <CircularProgress size={20} /> : <Send />}
                                disabled={isCreating || !newComment.trim()}
                            >
                                {isCreating ? 'Publicando...' : 'Publicar comentario'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            )}

            {/* Lista de comentarios */}
            {comments.length === 0 ? (
                <Alert severity="info">
                    Sé el primero en comentar
                </Alert>
            ) : (
                <Box>
                    {comments.map((comment) => (
                        <Box key={comment.id} sx={{ mb: 3 }}>
                            <Paper sx={{ p: 2, position: 'relative' }}>
                                {/* Header del comentario */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            mr: 1,
                                            fontSize: '0.875rem',
                                            bgcolor: 'primary.main'
                                        }}
                                    >
                                        {comment.username[0].toUpperCase()}
                                    </Avatar>

                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {comment.username}
                                            {comment.userId === postAuthorId && (
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{
                                                        ml: 1,
                                                        bgcolor: 'primary.light',
                                                        color: 'primary.contrastText',
                                                        px: 0.5,
                                                        py: 0.25,
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    Autor
                                                </Typography>
                                            )}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(comment.createdAt)}
                                        </Typography>
                                    </Box>

                                    {(canDeleteComment(comment.userId)) && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, comment)}
                                            disabled={isDeleting}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                {/* Contenido del comentario */}
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {comment.content}
                                </Typography>
                            </Paper>

                            <Divider sx={{ mt: 2 }} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* Menú de opciones para comentarios */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedComment && canDeleteComment(selectedComment.userId) && (
                    <MenuItem
                        onClick={handleDeleteComment}
                        sx={{ color: 'error.main' }}
                    >
                        <Delete fontSize="small" sx={{ mr: 1 }} />
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}