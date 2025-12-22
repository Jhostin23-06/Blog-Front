"use client"

import React, { useRef, useState } from "react"
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    Button,
    Badge,
    CircularProgress,
    IconButton,
    Card,
    CardContent,
    Container,
    Fade,
    Paper,
    Tooltip,
    Zoom,
} from "@mui/material"
import {
    Notifications as NotificationsIcon,
    Schedule,
    Check,
    DoneAll,
    FavoriteRounded,
    ChatBubbleRounded,
    PersonAddRounded,
    GroupRounded,
    NotificationsNoneRounded,
    ImageRounded,
} from "@mui/icons-material"
import { useNotifications } from "../modules/blog/application/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Link } from "react-router-dom"
import { ImageModal } from "../components/ImageModal"
import { CommentsModal } from "../components/CommentsModal"
import type { Post } from "../modules/blog/domain/Post"

const NotificationsPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()

    const API_BASE_URL = import.meta.env.VITE_API_NOTIFI || 'http://localhost:8000';

    const buildImageUrl = (urlPath?: string) => {
        if (!urlPath) return '';
        if (urlPath.startsWith('http')) return urlPath;
        return `${API_BASE_URL}${urlPath}`;
    };

    const [selectedImage, setSelectedImage] = useState<{ imageId: string, imageUrl: string, ownerId?: string, createdAt?: string } | null>(null)
    const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [isOverUsername, setIsOverUsername] = useState(false)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null) // Estado para el post seleccionado
    const notificationRefs = useRef<{ [key: string]: HTMLElement | null }>({})

    const unreadNotifications = notifications.filter((n) => !n.read)
    const readNotifications = notifications.filter((n) => n.read)

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: es,
        })
    }

    const getNotificationIcon = (
        type: "like" | "comment" | "new_follower" | "friend_request" | "friend_accepted" | "ping" | "image_comment",
    ) => {
        const iconProps = { fontSize: "small" as const }
        switch (type) {
            case "like":
                return <FavoriteRounded {...iconProps} sx={{ color: "#e91e63" }} />
            case "comment":
                return <ChatBubbleRounded {...iconProps} sx={{ color: "#2196f3" }} />
            case "new_follower":
                return <PersonAddRounded {...iconProps} sx={{ color: "#4caf50" }} />
            case "friend_request":
                return <GroupRounded {...iconProps} sx={{ color: "#ff9800" }} />
            case "friend_accepted":
                return <GroupRounded {...iconProps} sx={{ color: "#4caf50" }} />
            case "image_comment":
                return <ChatBubbleRounded {...iconProps} sx={{ color: "#6D66C8" }} />

            default:
                return <NotificationsNoneRounded {...iconProps} sx={{ color: "#757575" }} />
        }
    }

    const getAvatarColor = (type: string) => {
        const colorMap = {
            like: "#fce4ec",
            comment: "#e3f2fd",
            new_follower: "#e8f5e8",
            friend_request: "#fff3e0",
            friend_accepted: "#e8f5e8",
            default: "#f5f5f5",
        }
        return colorMap[type as keyof typeof colorMap] || colorMap.default
    }

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <CircularProgress size={48} />
                </Box>
            </Container>
        )
    }

    const handleNotificationClick = (notification: any) => {
        // Marcar como leída
        if (!notification.read) {
            markAsRead([notification._id])
        }

        console.log("ENTRO")

        // Si es una notificación de comentario o like en un post, abrir el modal de comentarios
        if ((notification.type === "comment" || notification.type === "like") && notification.post_id) {
            console.log("Notificación de comentario o like:", notification);

            // Crear un objeto Post a partir de los datos de la notificación
            const post: Post = {
                /*
                    id: number;
                    _id: string;
                    title: string;
                    content: string;
                    image_url?: string; // Nuevo campo
                    author_id: string;
                    author_username: string;
                    author_profile_picture: string;
                    created_at: string; // ISO string
                    likes_count?: number;
                    liked_by?: string[];
                    comments_count?: number;
                    has_liked?: boolean;
                */
                _id: notification.post_id,
                id: notification.post_id,
                title: notification.post_title || "Post",
                content: notification.post_content || "",
                image_url: notification.post_image_url || "",
                author_id: notification.post_author_id || "",
                author_username: notification.post_author_username || "Usuario",
                author_profile_picture: notification.post_author_profile_picture || "",
                created_at: notification.post_created_at || new Date().toISOString(),
                likes_count: notification.post_likes_count || 0,
                liked_by: notification.post_liked_by || [],
                comments_count: notification.post_comments_count || 0,
                has_liked: notification.post_has_liked || false,
                //updated_at: notification.post_updated_at || new Date().toISOString(),
            };

            console.log("Post creado:", post);

            setSelectedPost(post);
        }

        // Si es una notificación de comentario en imagen, abrir el modal
        if (notification.type === "image_comment" && notification.image_id) {
            console.log("Notificación de comentario en imagen:", notification);

            setSelectedImage({
                imageId: notification.image_id,
                imageUrl: notification.image_url,
                ownerId: notification.image_owner_id,
                createdAt: notification.image_created_at
            })
        }
    }

    const handleCloseCommentsModal = () => {
        setSelectedPost(null);
    }

    const handleMouseMove = (e: React.MouseEvent, _: string) => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 2 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Badge badgeContent={unreadCount} color="error" max={99}>
                            <NotificationsIcon sx={{ fontSize: 32 }} />
                        </Badge>
                        <Box>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                Notificaciones
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {unreadCount > 0 ? `${unreadCount} nuevas notificaciones` : "Todas al día"}
                            </Typography>
                        </Box>
                    </Box>

                    {unreadCount > 0 && (
                        <Button
                            startIcon={<DoneAll />}
                            onClick={markAllAsRead}
                            variant="contained"
                            size="small"
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                backdropFilter: "blur(10px)",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Marcar todas como leídas
                        </Button>
                    )}
                </Box>
            </Paper>

            {unreadNotifications.length > 0 && (
                <Fade in timeout={300}>
                    <Card sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box sx={{ width: 8, height: 8, bgcolor: "warning.main", borderRadius: "50%" }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Nuevas ({unreadNotifications.length})
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 0 }}>
                            <List sx={{ py: 0 }}>
                                {unreadNotifications.map((notification, index) => (
                                    <React.Fragment key={notification._id}>
                                        <ListItem
                                            ref={(el: any) => notificationRefs.current[notification._id] = el}
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                bgcolor: "rgba(25, 118, 210, 0.04)",
                                                borderLeft: "4px solid",
                                                borderColor: "primary.main",
                                                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.08)" },
                                                transition: "background-color 0.2s ease",
                                                cursor: (notification.type === "image_comment" ||
                                                    notification.type === "comment" ||
                                                    notification.type === "like") ? "pointer" : "default",

                                            }}
                                            onClick={(e) => {
                                                // Solo manejar clic si no es en un enlace
                                                if (!(e.target as HTMLElement).closest('a')) {
                                                    if (notification.type === "image_comment" ||
                                                        notification.type === "comment" ||
                                                        notification.type === "like") {
                                                        handleNotificationClick(notification)
                                                    }
                                                }
                                            }}
                                            onMouseEnter={() => {
                                                setHoveredNotification(notification._id);
                                                setIsOverUsername(false);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredNotification(null);
                                                setIsOverUsername(false);
                                            }}
                                            onMouseMove={(e) => handleMouseMove(e, notification._id)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: getAvatarColor(notification.type),
                                                        width: 48,
                                                        height: 48,
                                                    }}
                                                >
                                                    {getNotificationIcon(notification.type)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                                        <Tooltip
                                                            title="Ver perfil"
                                                            placement="top"
                                                            TransitionComponent={Zoom}
                                                            arrow
                                                            open={isOverUsername && hoveredNotification === notification._id}
                                                        >
                                                            <Link
                                                                to={`/profile/${notification.emitter_id}`}
                                                                style={{
                                                                    textDecoration: "none",
                                                                    color: "#1976d2",
                                                                    fontWeight: 600,
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.color = "#1565c0";
                                                                    e.currentTarget.style.borderBottom = "1px solid #1565c0";
                                                                    setIsOverUsername(true);
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.color = "#1976d2";
                                                                    e.currentTarget.style.borderBottom = "1px dotted #1976d2";
                                                                    setIsOverUsername(false)
                                                                }}
                                                            >
                                                                {notification.emitter_username}
                                                            </Link>
                                                        </Tooltip>

                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
                                                            {notification.message}
                                                        </Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <Schedule fontSize="small" sx={{ color: "text.secondary" }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDate(notification.created_at)}
                                                            </Typography>
                                                        </Box>
                                                    </>
                                                }
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead([notification._id])
                                                }}
                                                sx={{
                                                    bgcolor: "primary.main",
                                                    color: "white",
                                                    "&:hover": { bgcolor: "primary.dark" },
                                                    ml: 1,
                                                }}
                                            >
                                                <Check fontSize="small" />
                                            </IconButton>

                                        </ListItem>
                                        {index < unreadNotifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Fade>
            )}

            {readNotifications.length > 0 && (
                <Fade in timeout={500}>
                    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: "grey.100",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Anteriores ({readNotifications.length})
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 0 }}>
                            <List sx={{ py: 0 }}>
                                {readNotifications.map((notification, index) => (
                                    <React.Fragment key={notification._id}>
                                        <ListItem
                                            ref={(el: any) => notificationRefs.current[notification._id] = el}
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                "&:hover": { bgcolor: "grey.50" },
                                                transition: "background-color 0.2s ease",
                                                cursor: (notification.type === "image_comment" ||
                                                    notification.type === "comment" ||
                                                    notification.type === "like") ? "pointer" : "default",
                                            }}
                                            onClick={(e) => {
                                                // Solo manejar clic si no es en un enlace
                                                if (!(e.target as HTMLElement).closest('a')) {
                                                    if (notification.type === "image_comment" ||
                                                        notification.type === "comment" ||
                                                        notification.type === "like") {
                                                        handleNotificationClick(notification)
                                                    }
                                                }
                                            }}
                                            onMouseEnter={() => {
                                                setHoveredNotification(notification._id);
                                                setIsOverUsername(false);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredNotification(null);
                                                setIsOverUsername(false);
                                            }}
                                            onMouseMove={(e) => handleMouseMove(e, notification._id)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: "grey.200",
                                                        width: 44,
                                                        height: 44,
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    {getNotificationIcon(notification.type)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Tooltip
                                                        title="Ver perfil"
                                                        placement="top"
                                                        TransitionComponent={Zoom}
                                                        arrow
                                                    >
                                                        <Link
                                                            to={`/profile/${notification.emitter_id}`}
                                                            style={{
                                                                textDecoration: "none",
                                                                color: "#757575",
                                                                fontWeight: 500,
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.color = "#424242";
                                                                e.currentTarget.style.borderBottom = "1px solid #424242";
                                                                setIsOverUsername(true);
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.color = "#757575";
                                                                e.currentTarget.style.borderBottom = "1px dotted #757575";
                                                                setIsOverUsername(false);
                                                            }}
                                                        >
                                                            {notification.emitter_username}
                                                        </Link>
                                                    </Tooltip>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {notification.message}
                                                        </Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <Schedule fontSize="small" sx={{ color: "text.disabled" }} />
                                                            <Typography variant="caption" color="text.disabled">
                                                                {formatDate(notification.created_at)}
                                                            </Typography>
                                                        </Box>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        {index < readNotifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Fade>
            )}

            {/* Tooltip flotante que sigue al cursor para notificaciones de imagen */}
            {notifications
                .filter(notification => notification.type === "image_comment")
                .map(notification => (
                    <Fade
                        in={hoveredNotification === notification._id && !isOverUsername}
                        timeout={200}
                        key={`tooltip-${notification._id}`}
                    >
                        <Box
                            sx={{
                                position: "fixed",
                                top: cursorPosition.y + 15,
                                left: cursorPosition.x + 15,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                backgroundColor: notification.read ? "rgba(0, 0, 0, 0.7)" : "primary.main",
                                color: "white",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                zIndex: 9999,
                                pointerEvents: "none",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                transition: "opacity 0.2s ease, transform 0.2s ease",
                                opacity: hoveredNotification === notification._id ? 1 : 0,
                                transform: hoveredNotification === notification._id ?
                                    "translateY(0) scale(1)" : "translateY(5px) scale(0.95)",
                            }}
                        >
                            <ImageRounded sx={{ fontSize: 14 }} />
                            <span>Ver</span>
                        </Box>
                    </Fade>
                ))}

            {notifications.length === 0 && (
                <Fade in timeout={300}>
                    <Card sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
                        <CardContent>
                            <NotificationsNoneRounded sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "text.secondary" }}>
                                No tienes notificaciones
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                                Cuando tengas nuevas notificaciones, aparecerán aquí para mantenerte al día con toda la actividad.
                            </Typography>
                        </CardContent>
                    </Card>
                </Fade>
            )}

            {selectedImage && (
                <ImageModal
                    imageId={selectedImage.imageId}
                    imageUrl={buildImageUrl(selectedImage.imageUrl)}
                    ownerId={selectedImage.ownerId}
                    createdAt={selectedImage.createdAt}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            {selectedPost && (
                <CommentsModal
                    open={true}
                    onClose={handleCloseCommentsModal}
                    post={selectedPost}
                />
            )}

        </Container>
    )
}

export default NotificationsPage
