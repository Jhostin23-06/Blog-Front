"use client"

import type React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Fade,
  Card,
  CardContent,
} from "@mui/material"
import { Close, Person } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

interface Friend {
  id: string
  username: string
  bio?: string
  profile_picture?: string
  profile_picture_url?: string
}

interface AmigosModalProps {
  open: boolean
  onClose: () => void
  getFriend: Friend[]
  isLoading: boolean
  isError: boolean
  onRefresh: () => void
}

const AmigosModal: React.FC<AmigosModalProps> = ({ open, onClose, getFriend, isLoading, isError }) => {
  const router = useNavigate()

  const handleFriendClick = (friendId: string) => {
    onClose()
    router(`/profile/${friendId}`)
  }

  const buildImageUrl = (friend: Friend) => {
    const imageUrl = friend.profile_picture || friend.profile_picture_url
    if (!imageUrl) return ""
    if (imageUrl.startsWith("http")) return imageUrl
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${imageUrl}`
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "16px 16px 0 0",
          py: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person />
          <Typography variant="h6" fontWeight="bold">
            Amigos ({getFriend.length})
          </Typography>
        </Box>
        <Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={40} />
          </Box>
        ) : isError ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              "& .MuiAlert-icon": { fontSize: 24 },
            }}
          >
            Error al cargar la lista de amigos
          </Alert>
        ) : getFriend.length === 0 ? (
          <Card sx={{ textAlign: "center", py: 6, borderRadius: 3, bgcolor: "grey.50" }}>
            <CardContent>
              <Person sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes amigos aún
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Conecta con otros usuarios para ver tu lista de amigos aquí
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <List sx={{ p: 2, mt: 2 }}>
            {getFriend.map((friend, index) => (
              <Fade in={true} timeout={300 + index * 100} key={friend.id}>
                <ListItem
                  onClick={() => handleFriendClick(friend.id)}
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "primary.50",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                    border: "1px solid",
                    borderColor: "grey.100",
                    background: "white",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={buildImageUrl(friend)}
                      sx={{
                        width: 48,
                        height: 48,
                        border: "2px solid",
                        borderColor: "primary.100",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {friend.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {friend.username}
                      </Typography>
                    }
                  />
                </ListItem>
              </Fade>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AmigosModal
