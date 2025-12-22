// En src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PostAdd,
  Close,
  Bookmark,
  TrendingUp,
  Whatshot,
  Schedule,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PostCard } from '../components/PostCard'; // Componente existente de post individual
import { useAuth } from '../modules/blog/application/useAuth';
import { usePermissions } from '../modules/blog/application/usePermissions';
import { useCategories, useCreateCategory, useCreatePost, useRecentPosts } from '../modules/blog/application/usePost';
import { CreateCategoryModal } from '../components/CreateCategoryModal';

// Si no tienes PostsList y PostCard, te los muestro después

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={300}>
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roleName, canViewUsers } = usePermissions();

  // Usar hooks reales
  const { data: postsData, isLoading: isLoadingPosts, refetch: refetchPosts } = useRecentPosts(20);
  const { mutateAsync: createPost, isPending: isCreatingPost } = useCreatePost();
  const { data: categories = [], refetch: refetchCategories } = useCategories();
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useCreateCategory();

  const posts = postsData?.content || [];

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    categoryId: categories.length > 0 ? categories[0].id : 1, // Categoría por defecto
    isFeatured: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !newPost.categoryId) {
      setNewPost(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);


  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
    setSubmitError(null);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewPost({
      title: '',
      content: '',
      categoryId: categories.length > 0 ? categories[0].id : 1,
      isFeatured: false,
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      setSubmitError('El contenido es requerido');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createPost({
        title: newPost.title || 'Sin título',
        content: newPost.content,
        categoryId: newPost.categoryId,
        isFeatured: newPost.isFeatured,
      });

      handleCloseCreateModal();
      refetchPosts();
    } catch (error: any) {
      setSubmitError(error.message || 'Error al crear la publicación');
    }
  };

  const handleCreateCategory = async (name: string) => {
    setCategoryError(null);

    try {
      await createCategory(name);
      setOpenCreateCategoryModal(false);
      refetchCategories(); // Refrescar la lista de categorías
    } catch (error: any) {
      setCategoryError(error.message || 'Error al crear la categoría');
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  const canCreateCategory = user?.isAdmin || user?.isSuperadmin;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header con saludo personalizado */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid >
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              ¡Hola, {user?.username}! 👋
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={roleName}
                color={user?.isSuperadmin ? 'error' : user?.isAdmin ? 'warning' : 'primary'}
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="body1" color="text.secondary">
                Bienvenido de vuelta a la comunidad
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              {user?.isSuperadmin
                ? "Como Super Administrador, tienes acceso completo a todas las funcionalidades del sistema."
                : user?.isAdmin
                  ? "Como Administrador, puedes gestionar usuarios y contenido de la plataforma."
                  : "Comparte tus ideas, descubre contenido interesante y conecta con otros desarrolladores."
              }
            </Typography>
          </Grid>

        </Grid>
      </Box>

      {/* Tabs para navegar entre contenido */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              icon={<Whatshot />}
              label="Recientes"
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<TrendingUp />}
              label="Populares"
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<Bookmark />}
              label="Guardados"
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<Schedule />}
              label="Seguidos"
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Botón flotante para crear publicación */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
          onClick={handleOpenCreateModal}
        >
          <PostAdd />
        </Fab>

        {/* Contenido de los tabs */}
        <TabPanel value={tabValue} index={0}>
          {isLoadingPosts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : posts.length > 0 ? (
            <Grid container spacing={3}>
              {posts.map((post) => (
                <Grid key={post.id}>
                  <PostCard
                    post={post}
                    onPostUpdated={refetchPosts}
                    onPostDeleted={refetchPosts}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No hay publicaciones recientes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sé el primero en compartir algo con la comunidad
              </Typography>
              <Button
                variant="contained"
                startIcon={<PostAdd />}
                onClick={handleOpenCreateModal}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Crear primera publicación
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Publicaciones populares
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (Implementa la lógica para mostrar posts populares)
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Publicaciones guardadas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (Implementa la lógica para mostrar posts guardados)
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Publicaciones de usuarios seguidos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (Implementa la lógica para mostrar posts de seguidos)
            </Typography>
          </Box>
        </TabPanel>
      </Box>

      {/* Sidebar con trending topics */}
      <Grid container spacing={4}>

        {/* Panel de categorías */}
        <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{marginRight: 2}}>
                📁 Categorías
              </Typography>
              {canCreateCategory && (
                <Tooltip title="Crear nueva categoría">
                  <IconButton
                    size="small"
                    onClick={() => setOpenCreateCategoryModal(true)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <List dense>
              {categories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No hay categorías disponibles
                </Typography>
              ) : (
                categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <ListItem
                      sx={{
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                      onClick={() => {
                        // Aquí podrías filtrar posts por categoría
                        console.log('Filtrar por categoría:', category.name);
                      }}
                    >
                      <ListItemText
                        primary={category.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>

        <Grid>

          {/* Acciones rápidas para admins */}
          {canViewUsers && (
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  ⚡ Acciones rápidas
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PostAdd />}
                  onClick={() => navigate('/users')}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  Gestionar usuarios
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PostAdd />}
                  onClick={() => navigate('/users/create')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Crear nuevo usuario
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Modal para crear publicación */}
      <Dialog
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Crear nueva publicación
            </Typography>
            <IconButton onClick={handleCloseCreateModal} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Título"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 4, mt: 3 }}
            disabled={isSubmitting}
          />

          <TextField
            fullWidth
            label="¿Qué quieres compartir?"
            multiline
            rows={6}
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
            disabled={isSubmitting}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={newPost.categoryId}
              label="Categoría"
              onChange={(e) => setNewPost(prev => ({ ...prev, categoryId: e.target.value as number }))}
              disabled={isCreatingPost}
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(user?.isAdmin || user?.isSuperadmin) && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={newPost.isFeatured}
                  onChange={(e) => setNewPost(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  disabled={isCreatingPost}
                />
              }
              label="Destacar publicación"
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseCreateModal} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={isSubmitting || !newPost.content.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Publicar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para crear categoría */}
      <CreateCategoryModal
        open={openCreateCategoryModal}
        onClose={() => setOpenCreateCategoryModal(false)}
        onCreate={handleCreateCategory}
        isCreating={isCreatingCategory}
        error={categoryError!}
      />
    </Container>
  );
}