"use client"

import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  CircularProgress,
  Box,
  Alert,
  Button,
  Card,
  CardContent,
  Typography,
  Fade,
  IconButton,
  Skeleton,
  Avatar,
} from "@mui/material"
import { ArrowBack, Home, Share } from "@mui/icons-material"
import { PostCard } from "./PostCard"
import { usePostById } from "../modules/blog/application/usePost"

export function SinglePostPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { data: post, isLoading, error } = usePostById(postId || "")

  const API_BASE_URL = import.meta.env.VITE_API_NOTIFI || "http://localhost:8000"

  const buildImageUrl = (urlPath?: string) => {
    if (!urlPath) return ""
    if (urlPath.startsWith("http")) return urlPath
    return `${API_BASE_URL}${urlPath}`
  }

  // 

  useEffect(() => {
    // Scroll to top when post loads
    if (post) {
      window.scrollTo(0, 0)
    }
  }, [post])

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          //background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="20%" height={16} />
                </Box>
              </Box>
              <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress size={32} sx={{ color: "#667eea" }} />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={600}>
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textAlign: "center",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#ee5a24", fontWeight: 600 }}>
                  ¡Oops! Algo salió mal
                </Typography>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  Error al cargar el post. Puede que no exista o haya sido eliminado.
                </Alert>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    variant="contained"
                    sx={{
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        background: "linear-gradient(45deg, #5a67d8, #6b46c1)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Volver atrás
                  </Button>
                  <Button
                    startIcon={<Home />}
                    onClick={() => navigate("/")}
                    variant="outlined"
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#5a67d8",
                        color: "#5a67d8",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Ir al inicio
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    )
  }

  if (!post) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={600}>
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textAlign: "center",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#e17055", fontWeight: 600 }}>
                  Post no encontrado
                </Typography>
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  El post que buscas no existe o ha sido eliminado.
                </Alert>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    variant="contained"
                    sx={{
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        background: "linear-gradient(45deg, #5a67d8, #6b46c1)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Volver atrás
                  </Button>
                  <Button
                    startIcon={<Home />}
                    onClick={() => navigate("/")}
                    variant="outlined"
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#5a67d8",
                        color: "#5a67d8",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Ir al inicio
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        //background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={600}>
          <Box>
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    variant="outlined"
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: "#5a67d8",
                        color: "#5a67d8",
                        background: "rgba(102, 126, 234, 0.1)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Volver atrás
                  </Button>
                  <IconButton
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.content.substring(0, 50) + "...",
                          url: window.location.href,
                        })
                      }
                    }}
                    sx={{
                      color: "#667eea",
                      "&:hover": {
                        background: "rgba(102, 126, 234, 0.1)",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
              <Box sx={{ width: 300, display: { xs: "none", lg: "block" } }}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#667eea", fontWeight: 600 }}>
                      Sobre el autor
                    </Typography>
                    <Avatar
                      src={buildImageUrl(post.author_profile_picture)}

                      alt={post.author_username}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "#667eea",
                        fontSize: "2rem",
                      }}
                    >
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {post.author_username}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/profile/${post.author_id}`)}
                      sx={{
                        borderColor: "#667eea",
                        color: "#667eea",
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: "#5a67d8",
                          color: "#5a67d8",
                          background: "rgba(102, 126, 234, 0.1)",
                        },
                      }}
                    >
                      Ver perfil
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#667eea", fontWeight: 600 }}>
                      Estadísticas
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Likes:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {post.likes_count}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Comentarios:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {post.comments_count || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Publicado:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    "& .MuiCard-root": {
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  <PostCard post={post} />
                </Box>
              </Box>
            </Box>

          </Box>
        </Fade>
      </Container>
    </Box>
  )
}
