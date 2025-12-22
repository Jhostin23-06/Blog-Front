// En src/pages/CreateUserPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { 
  ArrowBack, 
  Visibility, 
  VisibilityOff,
  PersonAdd,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/blog/application/useAuth';
import { useUserManagement } from '../modules/blog/application/useUserManagement';

export function CreateUserPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { createUser, isCreating } = useUserManagement();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'SUPERADMIN',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Verificar permisos
  const canCreateUsers = currentUser?.isAdmin || currentUser?.isSuperadmin;
  const canAssignSuperadmin = currentUser?.isSuperadmin;

  if (!canCreateUsers) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Acceso denegado
          </Typography>
          <Typography variant="body2">
            No tienes permisos para crear usuarios.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const steps = ['Información básica', 'Contraseña', 'Confirmación'];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.username.trim()) {
        newErrors.username = 'El nombre de usuario es requerido';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Mínimo 3 caracteres';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    if (step === 1) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(1)) {
      return;
    }

    try {
      await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccess('Usuario creado exitosamente');
      
      // Limpiar formulario
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
      });
      
      // Regresar al paso 0 después de 2 segundos
      setTimeout(() => {
        setActiveStep(0);
        setSuccess(null);
      }, 2000);

    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al crear usuario' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid >
              <TextField
                fullWidth
                label="Nombre de usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                disabled={isCreating}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonAdd color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                disabled={isCreating}
              />
            </Grid>
            
            <Grid>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleSelectChange}
                  label="Rol"
                  disabled={isCreating}
                >
                  <MenuItem value="USER">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonAdd fontSize="small" />
                      <span>Usuario</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADMIN">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" color="warning" />
                      <span>Administrador</span>
                    </Box>
                  </MenuItem>
                  {canAssignSuperadmin && (
                    <MenuItem value="SUPERADMIN">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" color="error" />
                        <span>Super Administrador</span>
                      </Box>
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {formData.role === 'SUPERADMIN' 
                    ? 'El Super Administrador tendrá acceso total al sistema'
                    : formData.role === 'ADMIN'
                    ? 'El Administrador podrá gestionar usuarios y contenido'
                    : 'El Usuario tendrá acceso básico al sistema'}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid >
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                disabled={isCreating}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid>
              <TextField
                fullWidth
                label="Confirmar contraseña"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                disabled={isCreating}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid >
              <Card sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Requisitos de contraseña:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>
                      <Typography variant="body2" color="text.secondary">
                        Mínimo 6 caracteres
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" color="text.secondary">
                        Debe coincidir con la confirmación
                      </Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Box>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Resumen del nuevo usuario
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid >
                    <Typography variant="body2" color="text.secondary">
                      Nombre de usuario:
                    </Typography>
                  </Grid>
                  <Grid >
                    <Typography variant="body1" fontWeight={500}>
                      {formData.username}
                    </Typography>
                  </Grid>
                  
                  <Grid >
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                  </Grid>
                  <Grid >
                    <Typography variant="body1" fontWeight={500}>
                      {formData.email}
                    </Typography>
                  </Grid>
                  
                  <Grid >
                    <Typography variant="body2" color="text.secondary">
                      Rol:
                    </Typography>
                  </Grid>
                  <Grid >
                    <Typography variant="body1" fontWeight={500}>
                      {formData.role === 'SUPERADMIN' ? 'Super Administrador' :
                       formData.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Alert severity="info">
              Verifica que la información sea correcta antes de crear el usuario.
            </Alert>
          </Box>
        );
      
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Botón de volver */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/users')}
        sx={{ mb: 4 }}
      >
        Volver a usuarios
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            Crear Nuevo Usuario
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Completa los pasos para agregar un nuevo usuario al sistema
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}

          {/* Mensajes de error/success */}
          {errors.submit && (
            <Alert 
              severity="error" 
              sx={{ mt: 3 }}
              icon={<ErrorIcon />}
            >
              {errors.submit}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ mt: 3 }}
              icon={<CheckCircle />}
            >
              {success}
            </Alert>
          )}

          {/* Botones de navegación */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => navigate('/users') : handleBack}
              disabled={isCreating}
            >
              {activeStep === 0 ? 'Cancelar' : 'Atrás'}
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isCreating}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCreating}
                  sx={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  }}
                >
                  {isCreating ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Crear Usuario'
                  )}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}