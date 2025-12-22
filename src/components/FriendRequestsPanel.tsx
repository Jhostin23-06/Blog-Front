import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import { useFriendRequests } from '../modules/blog/application/useFriendship';
import { useAcceptFriendRequest, useRejectFriendRequest } from '../modules/blog/application/useFriendship';
import type { FriendRequest } from '../modules/blog/domain/User';

export function FriendRequestsPanel() {
  const { data: requests = [], isLoading, isError, refetch } = useFriendRequests();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();

  const handleAccept = (userId: string) => {
    acceptRequest.mutate(userId, {
      onSuccess: () => {
        console.log('MENSAJE DE EXITOOOOOO, ENTROOOOO')
        refetch(); // Esto actualizará la lista de solicitudes
      },
      onError: (error) => {
        console.error("Error al aceptar solicitud:", error);
        // Podrías mostrar un snackbar/alert aquí
      }
    });
  };

  const handleReject = (userId: string) => {
    rejectRequest.mutate(userId, {
      onSuccess: () => {
        refetch(); // Esto actualizará la lista de solicitudes
      },
      onError: (error) => {
        console.error("Error al rechazar solicitud:", error);
        // Podrías mostrar un snackbar/alert aquí
      }
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando solicitudes...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error al cargar las solicitudes</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3, minWidth: '600px' }}>
      <Typography variant="h6" gutterBottom>
        Solicitudes de amistad
      </Typography>

      {requests.length === 0 ? (
        <Typography variant="body2" sx={{ p: 2 }}>
          No tienes solicitudes pendientes
        </Typography>
      ) : (
        <List>
          {requests.map((request: FriendRequest) => (
            <React.Fragment key={request.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={request.profile_picture} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.username}
                  secondary="Te envió una solicitud de amistad"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAccept(request.id)}
                    disabled={acceptRequest.isPending || rejectRequest.isPending}
                  >
                    {acceptRequest.isPending ? 'Procesando...' : 'Aceptar'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleReject(request.id)}
                    disabled={acceptRequest.isPending || rejectRequest.isPending}
                  >
                    {rejectRequest.isPending ? 'Procesando...' : 'Rechazar'}
                  </Button>
                </Box>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
}