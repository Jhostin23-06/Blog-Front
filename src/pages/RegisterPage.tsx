// En src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Person,
  Email,
  Lock,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { usePublicRegister } from '../modules/blog/application/usePublicAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync: registerUser, isPending, error, isError, isSuccess } = usePublicRegister();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error de validación cuando el usuario empieza a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validar username
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.username.length > 50) {
      errors.username = 'El nombre no puede exceder 50 caracteres';
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (formData.password.length > 100) {
      errors.password = 'La contraseña no puede exceder 100 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await registerUser(registerData);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: '¡Registro exitoso! Ahora puedes iniciar sesión.',
            email: formData.email
          }
        });
      }, 3000);
      
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        {/* Botón para volver */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            Volver al inicio
          </Button>
        </Box>
        
        {/* Encabezado */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
            👋 Únete a la comunidad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crea tu cuenta y empieza a compartir conocimientos
          </Typography>
        </Box>
        
        {/* Formulario */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Mensajes de éxito/error */}
          {isSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => navigate('/login')}>
                  Ir a Login
                </Button>
              }
            >
              <Typography variant="body1" fontWeight="bold">
                ¡Registro exitoso! 🎉
              </Typography>
              <Typography variant="body2">
                Tu cuenta ha sido creada. Redirigiendo al login...
              </Typography>
            </Alert>
          )}
          
          {isError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Error en el registro
              </Typography>
              <Typography variant="body2">
                {error instanceof Error ? error.message : 'Ocurrió un error al registrar'}
              </Typography>
            </Alert>
          )}
          
          {/* Campo Username */}
          <TextField
            fullWidth
            margin="normal"
            label="Nombre de usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            disabled={isPending || isSuccess}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Campo Email */}
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            disabled={isPending || isSuccess}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Campo Contraseña */}
          <FormControl fullWidth variant="outlined" margin="normal" sx={{ mb: 2 }}>
            <InputLabel htmlFor="password" error={!!validationErrors.password}>
              Contraseña
            </InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              disabled={isPending || isSuccess}
              startAdornment={
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Contraseña"
            />
            {validationErrors.password && (
              <FormHelperText error>{validationErrors.password}</FormHelperText>
            )}
            <FormHelperText>
              Mínimo 6 caracteres
            </FormHelperText>
          </FormControl>
          
          {/* Campo Confirmar Contraseña */}
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="confirmPassword" error={!!validationErrors.confirmPassword}>
              Confirmar contraseña
            </InputLabel>
            <OutlinedInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              disabled={isPending || isSuccess}
              startAdornment={
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirmar contraseña"
            />
            {validationErrors.confirmPassword && (
              <FormHelperText error>{validationErrors.confirmPassword}</FormHelperText>
            )}
          </FormControl>
          
          {/* Botón de registro */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isPending || isSuccess}
            sx={{
              mt: 4,
              mb: 3,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {isPending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : isSuccess ? (
              '✅ Registrado exitosamente'
            ) : (
              'Crear mi cuenta'
            )}
          </Button>
          
          {/* Términos y condiciones */}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            align="center" 
            display="block"
            sx={{ mb: 3 }}
          >
            Al registrarte, aceptas nuestros{' '}
            <Link href="#" color="primary" underline="hover">
              Términos de servicio
            </Link>{' '}
            y{' '}
            <Link href="#" color="primary" underline="hover">
              Política de privacidad
            </Link>
          </Typography>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes una cuenta?
            </Typography>
          </Divider>
          
          {/* Enlace a login */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
              }}
            >
              Iniciar sesión
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Información adicional */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom color="primary">
          ✨ Beneficios de registrarte
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          gap: 3,
          mt: 2
        }}>
          <Paper sx={{ p: 2, minWidth: 200, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              📝 Publica contenido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comparte tus conocimientos con la comunidad
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, minWidth: 200, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💬 Comenta y debate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Participa en discusiones interesantes
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, minWidth: 200, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ⭐ Guarda favoritos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Marca contenido para verlo después
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}