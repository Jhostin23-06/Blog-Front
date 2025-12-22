// En src/components/PostCard.tsx
import { useNavigate } from "react-router-dom";
import type { Post } from "../modules/blog/domain/Post";
// import { useAuth } from "../modules/blog/application/useAuth";
import { usePermissions } from "../modules/blog/application/usePermissions";
import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Alert
} from "@mui/material";
import {
  Bookmark,
  BookmarkBorder,
  ChatBubbleOutline,
  Delete,
  Edit,
  Favorite,
  FavoriteBorder,
  MoreVert,
  Share
} from "@mui/icons-material";
import { EditPostModal } from "./EditPostModal";
import { useDeletePost, usePostComments, useUpdatePost } from "../modules/blog/application/usePost";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const { canDeletePost, canEditPost } = usePermissions();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();

  const { data: commentsData } = usePostComments(post.id, 0);

  const commentsCount = commentsData?.totalElements || 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewPost = () => {
    navigate(`/post/${post.id}`);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = async (postId: number, data: any) => {
    try {
      await updatePost({ postId, data });
      setEditModalOpen(false);
      setError(null);
      if (onPostUpdated) onPostUpdated();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la publicación');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      handleMenuClose();
      return;
    }

    try {
      await deletePost(post.id);
      setError(null);
      if (onPostDeleted) onPostDeleted();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la publicación');
    } finally {
      handleMenuClose();
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Llamar a API para like
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Llamar a API para bookmark
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

  return (
    <>
      <Card sx={{
        borderRadius: 3,
        boxShadow: 2,
        mb: 3,
        borderLeft: post.isFeatured ? '4px solid #FFD700' : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        }
      }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.username[0].toUpperCase()}
            </Avatar>
          }
          action={
            (canEditPost(post.userId) || canDeletePost(post.userId)) && (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {canEditPost(post.userId) && (
                    <MenuItem onClick={handleEdit} disabled={isUpdating}>
                      <Edit fontSize="small" sx={{ mr: 1 }} />
                      {isUpdating ? 'Editando...' : 'Editar'}
                    </MenuItem>
                  )}
                  {canDeletePost(post.userId) && (
                    <MenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" sx={{ mr: 1 }} />
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </MenuItem>
                  )}
                </Menu>
              </>
            )
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${post.userId}`)}
              >
                {post.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • {formatDate(post.createdAt)}
              </Typography>
              {post.isFeatured && (
                <Chip
                  label="Destacado"
                  size="small"
                  sx={{
                    bgcolor: '#FFD700',
                    color: '#000',
                    fontWeight: 'bold',
                    ml: 1,
                    mr: 2
                  }}
                />
              )}
            </Box>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              en {post.categoryName}
            </Typography>
          }
        />

        <CardContent>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 2,
              cursor: 'pointer'
            }}
            onClick={handleViewPost}
          >
            {post.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              whiteSpace: 'pre-line',
              cursor: 'pointer'
            }}
            onClick={handleViewPost}
          >
            {post.content.length > 300
              ? `${post.content.substring(0, 300)}...`
              : post.content}
          </Typography>

          <Chip
            label={`#${post.categoryName}`}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 1 }}
          />
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton
              size="small"
              onClick={handleLike}
              color={isLiked ? 'error' : 'default'}
            >
              {isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {likeCount}
            </Typography>

            <IconButton
              size="small"
              onClick={handleViewPost}
              sx={{ ml: 2 }}
            >
              <ChatBubbleOutline />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {commentsCount || 0}
            </Typography>

            <IconButton size="small" sx={{ ml: 2 }}>
              <Share />
            </IconButton>

            <Box sx={{ flex: 1 }} />

            <IconButton
              size="small"
              onClick={handleBookmark}
              color={isBookmarked ? 'primary' : 'default'}
            >
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>
        </CardActions>
      </Card>

      {/* Modal de edición */}
      <EditPostModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setError(null);
        }}
        post={post}
        onSave={handleSaveEdit}
        isSaving={isUpdating}
        error={error!}
      />
    </>
  );
}