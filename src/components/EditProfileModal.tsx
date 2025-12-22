import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useUpdateUser } from '../modules/blog/application/useUser';

interface EditProfileModalProps {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
    cover_photo?: string;
  };
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  onSuccess,
  user
}) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    bio: user.bio || '',
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Luego actualizar los datos del usuario
      updateUser(
        {
          userId: user.id,
          data: {
            ...formData
          }
        },
        {
          onSuccess: () => {
            setSnackbarMessage('Perfil actualizado correctamente');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            onSuccess();
            onClose();
          },
          onError: () => {
            setSnackbarMessage('Error al actualizar el perfil');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          }
        }
      );
    } catch (error) {
      setSnackbarMessage('Error al procesar la solicitud');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>

            {/* Campos del formulario */}
            <TextField
              name="username"
              label="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="email"
              label="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="email"
              required
            />
            <TextField
              name="bio"
              label="Biografía"
              value={formData.bio}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              placeholder="Cuéntanos algo sobre ti..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            {isUpdating ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};