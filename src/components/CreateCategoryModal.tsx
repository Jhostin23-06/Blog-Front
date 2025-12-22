// En src/components/CreateCategoryModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isCreating: boolean;
  error?: string;
}

export function CreateCategoryModal({
  open,
  onClose,
  onCreate,
  isCreating,
  error,
}: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setLocalError('El nombre de la categoría es requerido');
      return;
    }
    
    if (categoryName.length < 3) {
      setLocalError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    
    setLocalError(null);
    
    try {
      await onCreate(categoryName);
      setCategoryName('');
      // El modal se cerrará desde el componente padre si es exitoso
    } catch (err: any) {
      setLocalError(err.message || 'Error al crear categoría');
    }
  };

  const handleClose = () => {
    setCategoryName('');
    setLocalError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <span>Crear nueva categoría</span>
          <IconButton onClick={handleClose} size="small" disabled={isCreating}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3, mt: 3 }}>
            Solo administradores pueden crear nuevas categorías
          </Alert>

          <TextField
            fullWidth
            label="Nombre de la categoría"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Ej: React, Node.js, TypeScript..."
            variant="outlined"
            disabled={isCreating}
            sx={{ mb: 2 }}
            required
            autoFocus
          />

          <Alert severity="warning" sx={{ mt: 2 }}>
            Asegúrate de que el nombre sea descriptivo y no duplique categorías existentes
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={isCreating}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || !categoryName.trim() || categoryName.length < 3}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            {isCreating ? 'Creando...' : 'Crear categoría'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}