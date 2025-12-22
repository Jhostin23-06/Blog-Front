// En src/pages/UsersPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit,
  Delete,
  PersonAdd,
  Refresh,
  Visibility,
  AdminPanelSettings,
  SupervisedUserCircle,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/blog/application/useAuth';
import type { User } from '../modules/blog/domain/User';
import { useUserManagement } from '../modules/blog/application/useUserManagement';
import { usePermissions } from '../modules/blog/application/usePermissions';

export function UsersPage() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const { 
    users = [], 
    isLoading, 
    isError, 
    error,
    refetchUsers,
    updateRole,
    deleteUser,
    isUpdatingRole,
    isDeleting,
  } = useUserManagement();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'SUPERADMIN'>('USER');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { canViewUsers, canChangeRoles, canDeleteUsers } = usePermissions();

  // Verificar permisos
  if (!canViewUsers) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
            🔒 Acceso Restringido
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            No tienes permisos para ver la lista de usuarios.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.isSuperadmin ? 'SUPERADMIN' : user.isAdmin ? 'ADMIN' : 'USER');
    setOpenDialog(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      await updateRole({ userId: selectedUser.id, role: newRole });
      setOpenDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error actualizando rol:', error);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleViewProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  // Estadísticas
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.isAdmin && !u.isSuperadmin).length;
  const superadminCount = users.filter(u => u.isSuperadmin).length;
  const regularUsers = users.filter(u => u.isUser && !u.isAdmin && !u.isSuperadmin).length;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Cargando usuarios...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Error al cargar usuarios
          </Typography>
          <Typography variant="body2">
            {error?.message || 'No se pudieron cargar los usuarios. Intenta nuevamente.'}
          </Typography>
          <Button 
            startIcon={<Refresh />} 
            onClick={() => refetchUsers()} 
            sx={{ mt: 2 }}
          >
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra los usuarios del sistema
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<Refresh />}
              onClick={() => refetchUsers()}
              variant="outlined"
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleCreateUser}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              Crear Usuario
            </Button>
          </Box>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid >
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                  {totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios totales
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid >
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                  {regularUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios regulares
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                  {adminCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                  {superadminCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Super Administradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de usuarios */}
      <Paper sx={{ 
        borderRadius: 3, 
        boxShadow: 3,
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><strong>Usuario</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Rol</strong></TableCell>
                <TableCell><strong>Fecha de registro</strong></TableCell>
                <TableCell><strong>Última actualización</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewProfile(user.id)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{ 
                          bgcolor: user.isSuperadmin ? 'error.main' : 
                                  user.isAdmin ? 'warning.main' : 'primary.main' 
                        }}
                      >
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {user.username}
                          {currentUser?.id === user.id && (
                            <Chip 
                              label="Tú" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={user.isSuperadmin ? <SupervisedUserCircle /> : 
                             user.isAdmin ? <AdminPanelSettings /> : <Person />}
                      label={user.isSuperadmin ? 'Superadmin' : 
                             user.isAdmin ? 'Administrador' : 'Usuario'}
                      color={user.isSuperadmin ? 'error' : 
                             user.isAdmin ? 'warning' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(user.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {user.updatedAt ? (
                      <>
                        <Typography variant="body2">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(user.updatedAt).toLocaleTimeString()}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No actualizado
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Ver perfil">
                        <IconButton
                          size="small"
                          onClick={() => handleViewProfile(user.id)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {canChangeRoles && currentUser?.id !== user.id && (
                        <Tooltip title="Cambiar rol">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRole(user)}
                            color="warning"
                            disabled={isUpdatingRole}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {currentUser?.isSuperadmin && currentUser.id !== user.id && (
                        <Tooltip title="Eliminar usuario">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            disabled={isDeleting}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {users.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No hay usuarios registrados
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleCreateUser}
            >
              Crear primer usuario
            </Button>
          </Box>
        )}
      </Paper>

      {/* Diálogo para cambiar rol */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Cambiar rol de usuario
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">
              Usuario: <strong>{selectedUser?.username}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {selectedUser?.email}
            </Typography>
          </Box>
          
          <TextField
            select
            fullWidth
            label="Nuevo rol"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as any)}
            size="small"
          >
            <MenuItem value="USER">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                <span>Usuario</span>
              </Box>
            </MenuItem>
            <MenuItem value="ADMIN">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings fontSize="small" />
                <span>Administrador</span>
              </Box>
            </MenuItem>
            {currentUser?.isSuperadmin && (
              <MenuItem value="SUPERADMIN">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupervisedUserCircle fontSize="small" />
                  <span>Super Administrador</span>
                </Box>
              </MenuItem>
            )}
          </TextField>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Solo los Super Administradores pueden asignar roles de Super Administrador.
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            variant="contained"
            disabled={
              isUpdatingRole || 
              newRole === (selectedUser?.isSuperadmin ? 'SUPERADMIN' : 
                          selectedUser?.isAdmin ? 'ADMIN' : 'USER')
            }
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {isUpdatingRole ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Actualizar rol'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="error">
            Confirmar eliminación
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
          
          <Typography variant="body1">
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <strong>{userToDelete?.username}</strong>?
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Se eliminarán todos los datos asociados a este usuario.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Eliminar usuario'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}