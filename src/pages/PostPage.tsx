// En src/pages/PostPage.tsx
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  ArrowBack,
  Send,
  MoreVert,
  Delete,
  Edit,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/blog/application/useAuth';
import { usePermissions } from '../modules/blog/application/usePermissions';
import { useCreateComment, usePost, usePostComments, useDeleteComment } from '../modules/blog/application/usePost';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canDeletePost, canEditPost } = usePermissions();
  
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  
  // Obtener post y comentarios
  const { 
    data: postData, 
    isLoading: isLoadingPost, 
    isError: isPostError,
    error: postError,
    refetch: refetchPost
  } = usePost(Number(postId));
  
  const { 
    data: commentsData, 
    isLoading: isLoadingComments,
    refetch: refetchComments 
  } = usePostComments(Number(postId));
  
  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();
  
  // Extraer datos del post
  const post = postData || null;
  
  // Extraer comentarios del response
  const comments = commentsData?.content || [];
  const totalComments = commentsData?.totalElements || 0;
  
  const handleSubmitComment = async () => {
    if (!comment.trim() || !postId || !user) return;
    
    setIsSubmittingComment(true);
    setCommentError(null);
    
    try {
      await createComment({
        postId: Number(postId),
        content: comment,
      });
      
      setComment('');
      refetchComments();
    } catch (error: any) {
      setCommentError(error.message || 'Error al crear comentario');
      console.error('Error al crear comentario:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !postId) {
      handleMenuClose();
      return;
    }
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      handleMenuClose();
      return;
    }
    
    try {
      await deleteComment({ 
        commentId: selectedComment.id, 
        postId: Number(postId) 
      });
      refetchComments();
      setCommentError(null);
    } catch (error: any) {
      setCommentError(error.message || 'Error al eliminar comentario');
      console.error('Error al eliminar comentario:', error);
    } finally {
      handleMenuClose();
    }
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

  const canDeleteComment = (commentUserId: number) => {
    if (!user) return false;
    // El autor del post puede eliminar cualquier comentario
    if (post?.userId === user.id) return true;
    // El autor del comentario puede eliminarlo
    if (commentUserId === user.id) return true;
    // Admins pueden eliminar cualquier comentario
    if (canDeletePost(commentUserId)) return true;
    return false;
  };

  const canEditComment = (commentUserId: number) => {
    if (!user) return false;
    // Solo el autor del comentario puede editarlo
    return commentUserId === user.id;
  };

  if (isLoadingPost) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isPostError || !post) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Publicación no encontrada
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {postError?.message || 'La publicación que buscas no existe o no tienes permisos para verla.'}
          </Typography>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Volver
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Botón para volver */}
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      {/* Post principal */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header del post */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ 
                width: 60, 
                height: 60, 
                mr: 2,
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.username[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${post.userId}`)}
              >
                {post.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Publicado {formatDate(post.createdAt)}
              </Typography>
            </Box>
            
            <Chip
              label={post.categoryName}
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            
            {post.isFeatured && (
              <Chip 
                label="⭐ Destacado" 
                sx={{ 
                  bgcolor: '#FFD700',
                  color: '#000',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Contenido del post */}
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
            {post.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              fontSize: '1.1rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-line'
            }}
          >
            {post.content}
          </Typography>

          {/* Acciones del post */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <FavoriteBorder />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.likes || 0} likes
            </Typography>
            
            <IconButton>
              <ChatBubbleOutline />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {totalComments} comentarios
            </Typography>
            
            <IconButton>
              <Share />
            </IconButton>
            
            <Box sx={{ flex: 1 }} />
            
            <Typography variant="caption" color="text.secondary">
              {post.updatedAt && `Actualizado: ${formatDate(post.updatedAt)}`}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Sección de comentarios */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            💬 Comentarios ({totalComments})
          </Typography>

          {/* Formulario para nuevo comentario */}
          {user && (
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ mt: 1 }}>
                  {user.username[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Comentar como <strong>{user.username}</strong>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Escribe un comentario..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  
                  {commentError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {commentError}
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      endIcon={isSubmittingComment ? <CircularProgress size={20} /> : <Send />}
                      onClick={handleSubmitComment}
                      disabled={!comment.trim() || isSubmittingComment}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* Lista de comentarios */}
          {isLoadingComments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </Typography>
            </Box>
          ) : (
            <List>
              {comments.map((commentItem: any) => (
                <ListItem 
                  key={commentItem.id}
                  alignItems="flex-start"
                  sx={{
                    mb: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {commentItem.username[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {commentItem.username}
                        </Typography>
                        {commentItem.userId === post.userId && (
                          <Chip
                            label="Autor"
                            size="small"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText'
                            }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          • {formatDate(commentItem.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {commentItem.content}
                      </Typography>
                    }
                  />
                  
                  {(canDeleteComment(commentItem.userId) || canEditComment(commentItem.userId)) && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, commentItem)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Menú para acciones de comentarios */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        
        {selectedComment && canDeleteComment(selectedComment.userId) && (
          <MenuItem 
            onClick={handleDeleteComment}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
}