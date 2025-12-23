"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Button,
  Avatar,
  Divider,
  TextField,
  Badge,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  Fade,
  useTheme,
  alpha,
  ListItemButton,
  ClickAwayListener,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Bookmark as BookmarkIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  ImageRounded,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { ImageModal } from "./ImageModal"
import { CommentsModal } from "./CommentsModal"
import { useAuth } from "../modules/blog/application/useAuth"
import { useUserManagement } from "../modules/blog/application/useUserManagement"
import { usePermissions } from "../modules/blog/application/usePermissions"

const drawerWidth = 280

// Tipo para notificaciones (ajusta según tu API)
interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  // Agrega más campos según tu API
}

export default function Layout() {
  const theme = useTheme()
  const navigate = useNavigate()

  // Usar nuevo hook de autenticación
  const {
    user,
    token,
    logout,
    isAdmin,
    isSuperadmin,
    isLoading: authLoading
  } = useAuth()

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    imageId: string,
    imageUrl: string,
    ownerId?: string,
    createdAt?: string
  } | null>(null)

  // Estados para notificaciones (temporal - ajusta según tu API)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isOverUsername, setIsOverUsername] = useState(false)
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null)
  const { canViewUsers, canCreateUsers, roleName } = usePermissions();

  // // Si necesitas datos específicos del usuario, usa useUser hook
  // const { data: userProfile, isLoading: userLoading } = useUser(user?.id || 0)

  // // Hook para gestión de usuarios (admin)
  const {
    users: allUsers,
    isLoading: usersLoading,
    canManageUsers
  } = useUserManagement();

  // Construir URL de imagen
  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://tech-blog-kz8g.onrender.com"

  const buildImageUrl = (urlPath?: string) => {
    if (!urlPath) return ""
    if (urlPath.startsWith("http")) return urlPath
    return `${API_BASE_URL}${urlPath}`
  }

  // Cargar notificaciones (ejemplo - ajusta según tu API)
  useEffect(() => {
    if (token) {
      loadNotifications()
    }
  }, [token])

  const loadNotifications = async () => {
    setIsNotificationsLoading(true)
    try {
      // Aquí llamarías a tu API de notificaciones
      // Ejemplo:
      // const response = await fetch(`${API_BASE_URL}/notifications`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setNotifications(data);
      // setUnreadCount(data.filter((n: Notification) => !n.read).length);

      // Datos de ejemplo temporal
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsNotificationsLoading(false)
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    if (user?.id) {
      navigate(`/profile/${user.id}`)
    }
  }

  const handleMenuClosePrincipal = () => {
    setAnchorEl(null)
  }

  const handleViewAllNotifications = () => {
    setNotificationAnchorEl(null)
    navigate("/notifications")
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(query.trim().length > 0);
  };

  const closeResults = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    if (!notification.read) {
      markAsRead([notification.id])
    }
    // Manejar diferentes tipos de notificaciones
    // Ajustar según tu API
  }

  const markAsRead = async (notificationIds: number[]) => {
    try {
      // Llamar a API para marcar como leído
      // await fetch(`${API_BASE_URL}/notifications/read`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ notificationIds })
      // });

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Llamar a API para marcar todas como leídas
      // await fetch(`${API_BASE_URL}/notifications/read-all`, {
      //   method: 'POST',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      // Actualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleMouseMove = (e: React.MouseEvent, notificationId: string) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  // Filtrar usuarios basado en la búsqueda (temporal)
  const searchResults = searchQuery.trim()
    ? allUsers?.filter(u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5) || []
    : []

  const menuItems = [
    { text: "Inicio", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Guardados", icon: <BookmarkIcon />, path: "/saved" },
    { text: "Tendencias", icon: <TrendingUpIcon />, path: "/trending" },
  ]

  // Solo mostrar "Usuarios" si tiene permiso para ver usuarios
  if (canViewUsers) {
    menuItems.push(
      { text: "Usuarios", icon: <PeopleIcon />, path: "/users" }
    );
  }


  // Agregar menú de administración si es admin
  // if (user?.isAdmin || user?.isSuperadmin) {
  //   menuItems.push(
  //     { text: "Usuarios", icon: <PeopleIcon />, path: "/users" }
  //   )
  // }

  if (canManageUsers) {
    menuItems.push(
      { text: "Usuarios", icon: <PeopleIcon />, path: "/users" }
    )
  }


  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          p: 1.45,
          color: "white",
          display: 'flex',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              border: "3px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              bgcolor: theme.palette.primary.dark,
            }}
            src={user?.profilePicture ? buildImageUrl(user.profilePicture) : undefined}
          >
            {!user?.profilePicture && (user?.username?.[0]?.toUpperCase() || "U")}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user?.username || "Usuario"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {isSuperadmin ? "Super Administrador" :
                isAdmin ? "Administrador" : "Blogger activo"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          <Fade in timeout={300 + index * 100} key={item.text}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.text === "Notificaciones" ? (
                  <Badge badgeContent={unreadCount} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </Fade>
        ))}

        <Fade in timeout={600}>
          <ListItemButton
            onClick={() => navigate("/notifications")}
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notificaciones" primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        </Fade>

        {canCreateUsers && (
          <Fade in timeout={700}>
            <ListItemButton
              onClick={() => navigate("/users/create")}
              sx={{
                borderRadius: 2,
                mb: 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.success.main }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText
                primary="Crear Usuario"
                primaryTypographyProps={{ fontWeight: 500, color: theme.palette.success.dark }}
              />
            </ListItemButton>
          </Fade>
        )}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary", fontWeight: 600 }}>
          Estadísticas
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">Rol:</Typography>
            <Chip
              label={isSuperadmin ? "Superadmin" : isAdmin ? "Admin" : "Usuario"}
              size="small"
              color={isSuperadmin ? "error" : isAdmin ? "warning" : "default"}
            />
          </Box>
          {user?.createdAt && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Miembro desde:</Typography>
              <Typography variant="body2" fontWeight={500}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            borderColor: alpha(theme.palette.error.main, 0.3),
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.05),
              borderColor: theme.palette.error.main,
            },
          }}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  )

  if (authLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: "blur(10px)",
          height: 80,
        }}
      >
        <Toolbar sx={{ height: 80 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <ClickAwayListener onClickAway={closeResults}>
            <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 500 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: usersLoading ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <SearchIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    "&.Mui-focused": {
                      backgroundColor: "background.paper",
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  },
                }}
              />

              {/* Resultados de búsqueda */}
              {isSearchOpen && searchResults.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 2,
                    mt: 1,
                    zIndex: 9999,
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  {searchResults.map((result) => (
                    <ListItemButton
                      key={result.id}
                      onClick={() => {
                        navigate(`/profile/${result.id}`)
                        closeResults()
                      }}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, mr: 2 }}
                        src={result.profilePicture ? buildImageUrl(result.profilePicture) : undefined}
                      >
                        {result.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {result.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.email}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </Box>
              )}
            </Box>
          </ClickAwayListener>

          <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 1 }}>
            {(user?.isAdmin || user?.isSuperadmin) && (
              <IconButton
                color="inherit"
                onClick={() => navigate("/users")}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                    transform: "scale(1.05)",
                  },
                }}
                title="Gestionar usuarios"
              >
                <PeopleIcon />
              </IconButton>
            )}

            <IconButton
              color="inherit"
              onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
              sx={{
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: "scale(1.05)",
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={() => setNotificationAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                elevation: 8,
                sx: {
                  maxHeight: "500px",
                  width: "420px",
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Notificaciones
                </Typography>
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  sx={{ textTransform: "none" }}
                >
                  Marcar todas como leídas
                </Button>
              </Box>
              <Divider />

              {isNotificationsLoading ? (
                <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay notificaciones nuevas
                  </Typography>
                </Box>
              ) : (
                <List dense sx={{ maxHeight: 350, overflow: "auto" }}>
                  {notifications.slice(0, 5).map((notification, index) => (
                    <Fade in timeout={200 + index * 100} key={notification.id}>
                      <ListItemButton
                        onClick={() => handleNotificationClick(notification)}
                        onMouseEnter={() => {
                          setHoveredNotification(notification.id.toString());
                          setIsOverUsername(false);
                        }}
                        onMouseLeave={() => {
                          setHoveredNotification(null);
                          setIsOverUsername(false);
                        }}
                        onMouseMove={(e) => handleMouseMove(e, notification.id.toString())}
                        sx={{
                          bgcolor: notification.read ? "background.default" : alpha(theme.palette.primary.main, 0.05),
                          borderLeft: notification.read ? "none" : `4px solid ${theme.palette.primary.main}`,
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                          position: "relative",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              fontWeight: notification.read ? "normal" : "bold",
                              color: notification.read ? "text.secondary" : "text.primary",
                            }}
                          >
                            {notification.message}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </ListItemButton>
                    </Fade>
                  ))}
                </List>
              )}
              <Divider />
              <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  size="small"
                  onClick={handleViewAllNotifications}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Ver todas las notificaciones
                </Button>
              </Box>
            </Menu>

            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                ml: 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
                src={user?.profilePicture ? buildImageUrl(user.profilePicture) : undefined}
              >
                {!user?.profilePicture && (user?.username?.[0]?.toUpperCase() || "U")}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClosePrincipal}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                elevation: 8,
                sx: {
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  minWidth: 200,
                },
              }}
            >
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography variant="body2" fontWeight={500}>
                  Mi perfil
                </Typography>
              </MenuItem>

              {(isAdmin || isSuperadmin) && (
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null)
                    navigate("/users")
                  }}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.success.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <Typography variant="body2" fontWeight={500} color="success.dark">
                    Administración
                  </Typography>
                </MenuItem>
              )}

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="body2" fontWeight={500} color="error">
                  Cerrar sesión
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="navigation menu">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: "background.paper",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Toolbar sx={{ height: 80 }} />
        <Fade in timeout={300}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>

      {selectedImage && (
        <ImageModal
          imageId={selectedImage.imageId}
          imageUrl={buildImageUrl(selectedImage.imageUrl)}
          ownerId={selectedImage.ownerId}
          createdAt={selectedImage.createdAt}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* <CommentsModal
        open={false}
        onClose={() => {}}
        post={null}
      /> */}
    </Box>
  )
}