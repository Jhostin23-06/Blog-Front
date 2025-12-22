import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './css/style.css';
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar datos obsoletos
      gcTime: 1000 * 60 * 10, // 10 minutos en caché
      refetchOnWindowFocus: false, // No recargar al enfocar la ventana
      retry: 1, // Reducir intentos de reintento
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
