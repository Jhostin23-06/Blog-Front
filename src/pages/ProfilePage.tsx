"use client"

import React, { useState, useEffect } from "react"
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Alert,
    Avatar,
    IconButton,
    Card,
    CardContent,
    Fade,
    Container,
    Chip,
    Stack,
    Grid,
} from "@mui/material"
import {
    Edit,
    PersonAdd,
    CheckCircle,
    Close,
    Image as ImageIcon,
} from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
import { useUserManagement } from "../hooks/useUserManagement" // Para lista de usuarios (si necesitas)
import { EditProfileModal } from "../components/EditProfileModal"
import { useAuth } from "../modules/blog/application/useAuth"
import { useUser } from "../modules/blog/application/useUser"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://tech-blog-kz8g.onrender.com"

const buildImageUrl = (urlPath?: string) => {
    if (!urlPath) return ""
    if (urlPath.startsWith("http")) return urlPath
    return `${API_BASE_URL}${urlPath}`
}

function TabPanel(props: { 
    children: React.ReactNode; 
    value: number; 
    index: number 
}) {
    const { children, value, index } = props
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Fade in={value === index} timeout={300}>
                    <Box sx={{ py: 3 }}>{children}</Box>
                </Fade>
            )}
        </div>
    )
}

export default function ProfilePage() {
    const { userId: paramUserId } = useParams()
    const navigate = useNavigate()
    const { 
        user: currentUser, 
        token, 
        updateUser, 
        isAdmin, 
        isSuperadmin,
        isLoading: authLoading 
    } = useAuth()
    
    const [value, setValue] = useState(0)
    const [editModalOpen, setEditModalOpen] = useState(false)
    
    // Si hay paramUserId, es perfil de otro usuario, sino es el perfil propio
    const profileUserId = paramUserId ? parseInt(paramUserId) : currentUser?.id
    
    const { 
        data: user, 
        isLoading: isLoadingUser, 
        isError: isErrorUser, 
        refetch: refetchUser 
    } = useUser(profileUserId || 0)

    // Verificar si es el perfil propio
    const isOwnProfile = !paramUserId || paramUserId === currentUser?.id?.toString()

    // Estados para imágenes
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [selectedImage, setSelectedImage] = useState<{ 
        url: string; 
        ownerId?: number; 
        id?: string 
    } | null>(null)

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    // Función para subir imagen de perfil
    const handleProfileImageUpload = async (file: File) => {
        if (!currentUser?.id || !token) return
        
        try {
            const formData = new FormData()
            formData.append('image', file)
            
            // Aquí llamarías a tu API para subir imagen de perfil
            // Ejemplo: await uploadProfileImage(formData, token)
            console.log('Subiendo imagen de perfil:', file.name)
            
            // Actualizar usuario con nueva imagen
            await updateUser(currentUser.id.toString(), { 
                profilePicture: URL.createObjectURL(file) // URL temporal
            })
            
            refetchUser()
        } catch (error) {
            console.error('Error subiendo imagen de perfil:', error)
        }
    }

    // Función para subir imagen de portada
    const handleCoverImageUpload = async (file: File) => {
        if (!currentUser?.id || !token) return
        
        try {
            const formData = new FormData()
            formData.append('image', file)
            
            // Aquí llamarías a tu API para subir imagen de portada
            console.log('Subiendo imagen de portada:', file.name)
            
            // Actualizar usuario con nueva portada
            await updateUser(currentUser.id.toString(), { 
                coverPhoto: URL.createObjectURL(file) // URL temporal
            })
            
            refetchUser()
        } catch (error) {
            console.error('Error subiendo imagen de portada:', error)
        }
    }

    // Función para editar perfil
    const handleEditProfile = async (data: UserUpdate) => {
        if (!currentUser?.id) return
        
        try {
            await updateUser(currentUser.id.toString(), data)
            setEditModalOpen(false)
            refetchUser()
        } catch (error) {
            console.error('Error actualizando perfil:', error)
        }
    }

    // Función para enviar solicitud de amistad (si implementas esta funcionalidad)
    const handleAddFriend = () => {
        if (!user?.id || !token) return
        
        // Aquí implementarías la lógica para enviar solicitud de amistad
        console.log('Enviar solicitud a usuario:', user.id)
    }

    if (authLoading || isLoadingUser) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    minHeight: "60vh" 
                }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        )
    }

    if (isErrorUser || !user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Error al cargar los datos del usuario
                </Alert>
            </Container>
        )
    }

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            {/* Sección de portada */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3))",
                        zIndex: 1,
                    },
                }}
            >
                {/* Portada */}
                <Box
                    sx={{
                        height: { xs: 250, sm: 350, md: 400 },
                        position: "relative",
                        overflow: "hidden",
                        zIndex: 2,
                    }}
                >
                    {user.coverPhoto ? (
                        <img
                            src={buildImageUrl(user.coverPhoto)}
                            alt="Portada"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center",
                                filter: "brightness(0.9)",
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                bgcolor: "grey.800",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography variant="h6" color="white">
                                {user.username}
                            </Typography>
                        </Box>
                    )}

                    {isOwnProfile && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 20,
                                right: 20,
                                zIndex: 3,
                            }}
                        >
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="cover-photo-upload"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        handleCoverImageUpload(file)
                                    }
                                }}
                            />
                            <label htmlFor="cover-photo-upload">
                                <Button
                                    component="span"
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.7)',
                                        '&:hover': {
                                            bgcolor: 'rgba(0,0,0,0.9)',
                                        }
                                    }}
                                >
                                    Cambiar portada
                                </Button>
                            </label>
                        </Box>
                    )}
                </Box>

                {/* Avatar */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: { xs: -60, sm: -80, md: -90 },
                        left: { xs: 20, sm: 40, md: 50 },
                        zIndex: 3,
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: 120, sm: 160, md: 180 },
                            height: { xs: 120, sm: 160, md: 180 },
                            border: "6px solid",
                            borderColor: "background.paper",
                            borderRadius: "50%",
                            backgroundColor: "background.paper",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            position: "relative",
                            cursor: "pointer",
                            "&:hover": {
                                transform: "scale(1.02)",
                                transition: "transform 0.2s ease-in-out",
                            },
                        }}
                        onClick={() => {
                            if (user.profilePicture) {
                                setSelectedImage({
                                    url: buildImageUrl(user.profilePicture),
                                    ownerId: user.id,
                                })
                            }
                        }}
                    >
                        <Avatar
                            src={user.profilePicture ? buildImageUrl(user.profilePicture) : undefined}
                            sx={{
                                width: "100%",
                                height: "100%",
                                fontSize: "3rem",
                            }}
                        >
                            {!user.profilePicture && (user.username?.[0]?.toUpperCase() || "U")}
                        </Avatar>

                        {isOwnProfile && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 15,
                                    right: 15,
                                    zIndex: 4,
                                }}
                            >
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="profile-picture-upload"
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            handleProfileImageUpload(file)
                                        }
                                    }}
                                />
                                <label htmlFor="profile-picture-upload">
                                    <IconButton
                                        component="span"
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            width: 40,
                                            height: 40,
                                            "&:hover": {
                                                bgcolor: 'primary.dark',
                                            },
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                </label>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Contenido principal */}
            <Container maxWidth="xl" sx={{ mt: { xs: 10, sm: 12, md: 14 } }}>
                {/* Información del usuario */}
                <Card
                    sx={{
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)",
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid >
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                    sx={{
                                        fontSize: { xs: "2rem", sm: "2.5rem", md: "2.8rem" },
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        mb: 1,
                                    }}
                                >
                                    {user.username}
                                </Typography>

                                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                    <Chip
                                        label={user.isSuperadmin ? "Super Administrador" : 
                                               user.isAdmin ? "Administrador" : "Usuario"}
                                        color={user.isSuperadmin ? "error" : 
                                               user.isAdmin ? "warning" : "default"}
                                        variant="outlined"
                                        sx={{ borderRadius: 2 }}
                                    />
                                    {user.createdAt && (
                                        <Chip
                                            label={`Miembro desde ${new Date(user.createdAt).toLocaleDateString()}`}
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    )}
                                </Stack>

                                {user.email && (
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                        📧 {user.email}
                                    </Typography>
                                )}

                                {user.bio && (
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: 600,
                                            lineHeight: 1.6,
                                            fontSize: "1.1rem",
                                            mt: 2,
                                        }}
                                    >
                                        {user.bio}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid >
                                <Box sx={{ 
                                    display: "flex", 
                                    gap: 2, 
                                    flexWrap: "wrap", 
                                    justifyContent: { xs: "center", md: "flex-end" } 
                                }}>
                                    {isOwnProfile ? (
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit />}
                                            size="large"
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 3,
                                                px: 4,
                                                py: 1.5,
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                                                "&:hover": {
                                                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                                                    transform: "translateY(-2px)",
                                                },
                                            }}
                                            onClick={() => setEditModalOpen(true)}
                                        >
                                            Editar perfil
                                        </Button>
                                    ) : (
                                        <Box sx={{ display: "flex", gap: 2 }}>
                                            {/* Aquí puedes agregar funcionalidad de amistad si la implementas */}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<PersonAdd />}
                                                size="large"
                                                sx={{
                                                    borderRadius: 3,
                                                    px: 4,
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                }}
                                                onClick={handleAddFriend}
                                            >
                                                Agregar amigo
                                            </Button>
                                            
                                            {(isAdmin || isSuperadmin) && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Close />}
                                                    size="large"
                                                    sx={{ borderRadius: 3, px: 3 }}
                                                    onClick={() => {
                                                        // Aquí implementarías la eliminación de usuario (admin)
                                                    }}
                                                >
                                                    Eliminar usuario
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Pestañas */}
                <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="fullWidth"
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    py: 2,
                                },
                                "& .Mui-selected": {
                                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                                },
                            }}
                        >
                            <Tab label="Información" />
                            <Tab label="Actividad" />
                            {(isAdmin || isSuperadmin) && <Tab label="Administración" />}
                        </Tabs>
                    </Box>

                    {/* Contenido de las pestañas */}
                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* Pestaña 1: Información */}
                        <TabPanel value={value} index={0}>
                            <Grid container spacing={3}>
                                <Grid >
                                    <Card sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            📝 Información personal
                                        </Typography>
                                        
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Nombre de usuario
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {user.username}
                                                </Typography>
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Email
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {user.email || "No especificado"}
                                                </Typography>
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Rol
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {user.isSuperadmin ? "Super Administrador" : 
                                                     user.isAdmin ? "Administrador" : "Usuario"}
                                                </Typography>
                                            </Box>
                                            
                                            {user.createdAt && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fecha de registro
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            
                                            {user.updatedAt && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Última actualización
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {new Date(user.updatedAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Card>
                                </Grid>
                                
                                <Grid >
                                    <Card sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            ℹ️ Biografía
                                        </Typography>
                                        
                                        {user.bio ? (
                                            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                                {user.bio}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                {isOwnProfile 
                                                    ? "Añade una biografía para que otros usuarios te conozcan mejor." 
                                                    : "Este usuario no ha añadido una biografía."}
                                            </Typography>
                                        )}
                                        
                                        {isOwnProfile && !user.bio && (
                                            <Button
                                                startIcon={<Edit />}
                                                sx={{ mt: 2 }}
                                                onClick={() => setEditModalOpen(true)}
                                            >
                                                Añadir biografía
                                            </Button>
                                        )}
                                    </Card>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* Pestaña 2: Actividad (puedes personalizar según tu API) */}
                        <TabPanel value={value} index={1}>
                            <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    📊 Actividad del usuario
                                </Typography>
                                <Typography variant="body2">
                                    Aquí puedes mostrar publicaciones, comentarios, likes, etc.
                                </Typography>
                                <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
                                    (Implementa esta sección según los endpoints de tu API)
                                </Typography>
                            </Box>
                        </TabPanel>

                        {/* Pestaña 3: Administración (solo para admins) */}
                        {(isAdmin || isSuperadmin) && (
                            <TabPanel value={value} index={2}>
                                <Card sx={{ p: 3, borderRadius: 2, bgcolor: "warning.light" }}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                        ⚙️ Herramientas de administración
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        {!isOwnProfile && (
                                            <>
                                                <Grid>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        fullWidth
                                                        startIcon={<Close />}
                                                        onClick={() => {
                                                            // Implementar eliminación de usuario
                                                        }}
                                                    >
                                                        Eliminar usuario
                                                    </Button>
                                                </Grid>
                                                
                                                <Grid >
                                                    <Button
                                                        variant="outlined"
                                                        color="warning"
                                                        fullWidth
                                                        startIcon={<Edit />}
                                                        onClick={() => {
                                                            // Implementar cambio de rol
                                                        }}
                                                    >
                                                        Cambiar rol
                                                    </Button>
                                                </Grid>
                                            </>
                                        )}
                                        
                                        <Grid>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<CheckCircle />}
                                                onClick={() => {
                                                    // Implementar verificación
                                                }}
                                            >
                                                Verificar usuario
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
                                        Solo visible para administradores
                                    </Typography>
                                </Card>
                            </TabPanel>
                        )}
                    </Box>
                </Card>
            </Container>

            {/* Modales */}
            {selectedImage && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0,0,0,0.9)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage.url}
                        alt="Imagen ampliada"
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            objectFit: "contain",
                        }}
                    />
                </Box>
            )}

            {/* {isOwnProfile && currentUser && (
                <EditProfileModal
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    user={currentUser}
                    onSave={handleEditProfile}
                />
            )} */}
        </Box>
    )
}