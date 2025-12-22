// En src/hooks/usePublicAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerPublicUser, loginUser } from "../infrastructure/UserApi";
import type { 
  PublicUserRegisterRequest, 
  PublicUserRegisterResponse,
  UserLogin,
  LoginResponse
} from "../domain/User";
import { useAuth } from "./useAuth";

export function usePublicRegister() {
  const queryClient = useQueryClient();
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: async (data: PublicUserRegisterRequest) => {
      // 1. Registrar el usuario
      const userData = await registerPublicUser(data);
      
      // 2. Hacer login automático con las mismas credenciales
      const loginData: UserLogin = {
        username: data.username,
        password: data.password
      };
      
      try {
        const loginResponse = await loginUser(loginData);
        return { 
          user: userData, 
          loginResponse,
          autoLogin: true 
        };
      } catch (loginError) {
        // Si el login automático falla, al menos devolver los datos del usuario
        console.warn('Auto-login failed, user registered but needs to login manually:', loginError);
        return { 
          user: userData, 
          autoLogin: false,
          loginError 
        };
      }
    },
    onSuccess: (data) => {
      console.log('User registration result:', data);
      
      if (data.autoLogin && data.loginResponse) {
        // Guardar el token manualmente en localStorage
        localStorage.setItem('token', data.loginResponse.accessToken);
        localStorage.setItem('tokenType', data.loginResponse.tokenType);
        
        // Invalidar la query del usuario actual para que se refresque
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        
        console.log('Auto-login successful, user authenticated');
      }
    },
    onError: (error: Error) => {
      console.error('Registration error:', error.message);
    }
  });
}