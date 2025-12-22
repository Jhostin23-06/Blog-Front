// En src/components/PublicRegisterForm.tsx
"use client"

import type React from "react"
import { useState } from "react"
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  Link,
} from "@mui/material"
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { usePublicRegister } from "../modules/blog/application/usePublicAuth"

function PublicRegisterForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const registerMutation = usePublicRegister()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Limpiar error de validación cuando el usuario empieza a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validar username
    if (!form.username.trim()) {
      errors.username = 'El nombre de usuario es requerido'
    } else if (form.username.length < 3) {
      errors.username = 'El nombre debe tener al menos 3 caracteres'
    } else if (form.username.length > 30) {
      errors.username = 'El nombre no puede exceder 30 caracteres'
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!emailRegex.test(form.email)) {
      errors.email = 'Ingresa un email válido'
    }
    
    // Validar contraseña
    if (!form.password) {
      errors.password = 'La contraseña es requerida'
    } else if (form.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    } else if (form.password.length > 50) {
      errors.password = 'La contraseña no puede exceder 50 caracteres'
    }
    
    // Validar confirmación de contraseña
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const { confirmPassword, ...registerData } = form
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        // Mostrar mensaje de éxito y redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "¡Registro exitoso! Ahora puedes iniciar sesión.",
              email: form.email
            }
          })
        }, 3000)
      },
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Fade in timeout={800}>
        <Card
          sx={{
            maxWidth: 450,
            width: "100%",
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Botón para volver */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/")}
                sx={{ 
                  textTransform: "none",
                  color: "primary.main",
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.08)'
                  }
                }}
              >
                Volver al inicio
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                }}
              >
                <PersonAddIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Crear Cuenta
              </Typography>
              <Typography variant="button" color="text.secondary">
                Únete a nuestra comunidad
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Campo Usuario */}
              <TextField
                label="Nombre de usuario"
                name="username"
                value={form.username}
                onChange={handleChange}
                error={!!validationErrors.username}
                helperText={validationErrors.username}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                    },
                  },
                }}
              />

              {/* Campo Email */}
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                    },
                  },
                }}
              />

              {/* Campo Contraseña */}
              <TextField
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password || "Mínimo 6 caracteres"}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                    },
                  },
                }}
              />

              {/* Campo Confirmar Contraseña */}
              <TextField
                label="Confirmar Contraseña"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={registerMutation.isPending || registerMutation.isSuccess}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    boxShadow: "0 12px 24px rgba(102, 126, 234, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "rgba(0, 0, 0, 0.12)",
                  },
                  transition: "all 0.3s ease",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {registerMutation.isPending ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : registerMutation.isSuccess ? (
                  <>
                    <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                    ¡Registrado!
                  </>
                ) : (
                  "Crear mi cuenta"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Iniciar sesión
                  </Link>
                </Typography>
              </Box>

              {registerMutation.isError && (
                <Fade in>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        color: "#f44336",
                      },
                    }}
                  >
                    Error al registrar: {(registerMutation.error as Error)?.message}
                  </Alert>
                </Fade>
              )}

              {registerMutation.isSuccess && (
                <Fade in>
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        color: "#4caf50",
                      },
                    }}
                  >
                    ¡Cuenta creada exitosamente! Redirigiendo al login...
                  </Alert>
                </Fade>
              )}
            </Box>

            {/* Información adicional más compacta */}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider'}}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Beneficios de registrarte:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ color: 'primary.main', mr: 1, fontSize: '0.8rem' }}>✓</Box>
                  Publica contenido y comparte conocimientos
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ color: 'primary.main', mr: 1, fontSize: '0.8rem' }}>✓</Box>
                  Comenta y participa en discusiones
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ color: 'primary.main', mr: 1, fontSize: '0.8rem' }}>✓</Box>
                  Guarda tus publicaciones favoritas
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}

export default PublicRegisterForm