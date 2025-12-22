"use client"

import type React from "react"
import {
  Paper,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Fade,
  alpha,
  useTheme,
  Chip,
} from "@mui/material"
import { Person as PersonIcon, Search as SearchIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import type { User } from "../modules/blog/domain/User"

interface UserSearchResultsProps {
  results: User[]
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  searchQuery: string
}

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  results,
  isLoading,
  isOpen,
  onClose,
  searchQuery,
}) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`)
    onClose()
  }

  const buildImageUrl = (urlPath?: string) => {
    if (!urlPath) return ""
    if (urlPath.startsWith("http")) return urlPath
    const API_BASE_URL = import.meta.env.VITE_API_NOTIFI || "http://localhost:8000"
    return `${API_BASE_URL}${urlPath}`
  }

  if (!isOpen) return null

  return (
    <Fade in={isOpen} timeout={200}>
      <Paper
        elevation={8}
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          mt: 1,
          maxHeight: 400,
          overflow: "hidden",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 70%, ${alpha(theme.palette.primary.main, 1)} 100%)`,
          zIndex: 1300,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            {isLoading ? "Buscando usuarios..." : `Resultados para "${searchQuery}"`}
          </Typography>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Buscando usuarios...
            </Typography>
          </Box>
        )}

        {/* Results */}
        {!isLoading && (
          <List sx={{ maxHeight: 320, overflow: "auto", p: 0 }}>
            {results.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <SearchIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No se encontraron usuarios
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Intenta con otro término de búsqueda
                </Typography>
              </Box>
            ) : (
              results.map((user, index) => (
                <Fade in timeout={200 + index * 50} key={user.id}>
                  <ListItemButton
                    onClick={() => handleUserClick(user.id)}
                    sx={{
                      py: 2,
                      px: 3,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={buildImageUrl(user.profile_picture_url) || "/default-avatar.png"}
                        sx={{
                          width: 48,
                          height: 48,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.05)",
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            @{user.username}
                          </Typography>
                          <Chip
                            label="Usuario"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.4,
                          }}
                        >
                          {user.bio || "Sin biografía disponible"}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </Fade>
              ))
            )}
          </List>
        )}
      </Paper>
    </Fade>
  )
}
