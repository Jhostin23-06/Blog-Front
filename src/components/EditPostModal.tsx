// En src/components/EditPostModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import type { Post, PostUpdateRequest } from '../modules/blog/domain/Post';
import { useCategories } from '../modules/blog/application/usePost';

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (postId: number, data: PostUpdateRequest) => Promise<void>;
  isSaving: boolean;
  error?: string;
}

export function EditPostModal({
  open,
  onClose,
  post,
  onSave,
  isSaving,
  error,
}: EditPostModalProps) {
  const { data: categories = [] } = useCategories();
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    categoryId: number;
    isFeatured: boolean;
  }>({
    title: '',
    content: '',
    categoryId: 1,
    isFeatured: false,
  });

  // Inicializar form cuando se abre con un post
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        categoryId: post.categoryId || 1,
        isFeatured: post.isFeatured || false,
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    
    await onSave(post.id, {
      title: formData.title,
      content: formData.content,
      categoryId: formData.categoryId,
      isFeatured: formData.isFeatured,
    });
  };

  if (!post) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <span>Editar publicación</span>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 3, mt: 3 }}
            required
            disabled={isSaving}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Contenido"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            multiline
            rows={8}
            sx={{ mb: 3 }}
            required
            disabled={isSaving}
            variant="outlined"
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={formData.categoryId}
              label="Categoría"
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value as number }))}
              disabled={isSaving}
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                disabled={isSaving}
              />
            }
            label="Destacar publicación"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || !formData.content.trim()}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}