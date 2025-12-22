// En src/pages/PostDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
} from '@mui/material';
import { ArrowBack, Home, ChatBubbleOutline } from '@mui/icons-material';
import { PostCard } from '../components/PostCard';
import { EditPostModal } from '../components/EditPostModal';
import { CommentsSection } from '../components/CommentsSection';
import { useAuth } from '../modules/blog/application/useAuth';
import { useDeletePost, usePost } from '../modules/blog/application/usePost';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const postId = parseInt(id || '0');
  
  const { data: post, isLoading, error, refetch } = usePost(postId);
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Publicación no encontrada'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Volver al dashboard
        </Button>
      </Container>
    );
  }

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      await deletePost(postId);
      navigate('/dashboard');
    } catch (err: any) {
      setDeleteError(err.message || 'Error al eliminar la publicación');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/dashboard')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary">Publicación</Typography>
      </Breadcrumbs>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      {/* Post completo */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <PostCard 
          post={post} 
          onPostUpdated={refetch}
          onPostDeleted={() => navigate('/dashboard')}
        />
      </Paper>

      {/* Sección de comentarios */}
      <CommentsSection 
        postId={postId} 
        postAuthorId={post.userId}
      />

      {/* Modal de edición */}
      <EditPostModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        post={post}
        onSave={async (postId, data) => {
          // Aquí se manejaría la actualización
          setEditModalOpen(false);
          refetch();
        }}
        isSaving={false}
      />
    </Container>
  );
}