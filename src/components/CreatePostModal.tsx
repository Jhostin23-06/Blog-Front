"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Fade,
  Slide,
  Avatar,
  Chip,
  Paper,
  Divider,
} from "@mui/material"
import { Close, Create, Image as ImageIcon, Preview, Send, Person } from "@mui/icons-material"
import type { TransitionProps } from "@mui/material/transitions"

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  onCreate: (title: string, content: string, image_url?: string) => void
}

export function CreatePostModal({ open, onClose, onCreate }: CreatePostModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState({ title: "", content: "" })
  const [_, setIsUploading] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_NOTIFI_IMAGES || "http://localhost:8000/api"
  const API_BASE_URL_IMAGES = import.meta.env.VITE_API_NOTIFI_IMAGES_API || "http://localhost:8000"


  // const buildImageUrl = (urlPath?: string) => {
  //   if (!urlPath) return '';
  //   if (urlPath.startsWith('http')) return urlPath;
  //   return `${API_BASE_URL}${urlPath}`;
  // };

  const buildImageUrlPosts = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    return `${API_BASE_URL_IMAGES}${urlPath}`;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/images/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Imagen subida con éxito:', buildImageUrlPosts(data.image_url))



          setSelectedImage(buildImageUrlPosts(data.image_url))

        } else {
          console.error('Error subiendo imagen')
          // Fallback a base64 para preview
          const reader = new FileReader()
          reader.onload = (e) => {
            setSelectedImage(e.target?.result as string)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('Error:', error)
        // Fallback a base64
        const reader = new FileReader()
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = () => {
    const newErrors = { title: "", content: "" }

    if (!title.trim()) {
      newErrors.title = "El título es requerido"
    }

    if (!content.trim()) {
      newErrors.content = "El contenido es requerido"
    }

    if (content.trim().length < 10) {
      newErrors.content = "El contenido debe tener al menos 10 caracteres"
    }

    setErrors(newErrors)

    if (!newErrors.title && !newErrors.content) {
      const imageUrl = selectedImage || undefined
      onCreate(title.trim(), content.trim(), selectedImage || imageUrl)
      handleClose()
    }
  }

  const handleClose = () => {
    setTitle("")
    setContent("")
    setSelectedImage(null)
    setShowPreview(false)
    setErrors({ title: "", content: "" })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 600,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ mr: 2, bgcolor: "rgba(255,255,255,0.2)" }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Crear Nueva Publicación
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Comparte tus ideas con la comunidad
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        <Fade in={open}>
          <Box>
            <Box sx={{ display: "flex", gap: 1, mb: 3, mt: 2 }}>
              <Chip
                icon={<Create />}
                label="Editar"
                onClick={() => setShowPreview(false)}
                color={!showPreview ? "primary" : "default"}
                variant={!showPreview ? "filled" : "outlined"}
              />
              <Chip
                icon={<Preview />}
                label="Vista Previa"
                onClick={() => setShowPreview(true)}
                color={showPreview ? "primary" : "default"}
                variant={showPreview ? "filled" : "outlined"}
                disabled={!title && !content}
              />
            </Box>

            {!showPreview ? (
              <Box>
                <TextField
                  fullWidth
                  label="Título de la publicación"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                  variant="outlined"
                  placeholder="Escribe un título atractivo..."
                />

                <TextField
                  fullWidth
                  label="Contenido"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  error={!!errors.content}
                  helperText={errors.content || `${content.length} caracteres`}
                  multiline
                  rows={8}
                  variant="outlined"
                  placeholder="Comparte tus ideas, conocimientos o experiencias..."
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      alignItems: "flex-start",
                      borderRadius: 2,
                    },
                  }}
                />

                <Box sx={{ mb: 3 }}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      sx={{
                        borderRadius: 2,
                        borderStyle: "dashed",
                        py: 1.5,
                        mb: 2,
                      }}
                    >
                      Agregar Imagen
                    </Button>
                  </label>

                  {selectedImage && (
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Imagen seleccionada
                        </Typography>
                        <IconButton size="small" onClick={() => setSelectedImage(null)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box
                        component="img"
                        src={selectedImage}
                        sx={{
                          width: "100%",
                          maxHeight: "100%",
                          margin: "0 auto",
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
                    </Paper>
                  )}
                </Box>
              </Box>
            ) : (
              /* Added preview mode */
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid #e2e8f0",
                  minHeight: 300,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#1a202c" }}>
                  {title || "Título de la publicación"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {selectedImage && (
                  <Box
                    component="img"
                    src={selectedImage}
                    sx={{
                      width: "100%",
                      maxHeight: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                      mb: 2,
                    }}
                  />
                )}
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {content || "El contenido de tu publicación aparecerá aquí..."}
                </Typography>
              </Paper>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
              💡 Tip: Usa un lenguaje claro y estructura tu contenido con párrafos para mejor legibilidad.
            </Typography>
          </Box>
        </Fade>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            mr: 1,
            borderRadius: 2,
            borderColor: "#cbd5e0",
            color: "#4a5568",
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || !content.trim()}
          startIcon={<Send />}
          sx={{
            minWidth: 120,
            fontWeight: 600,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
            },
          }}
        >
          Publicar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
