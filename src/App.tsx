// En src/App.tsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LoginForm from "./components/LoginForm"
import DashboardPage from "./pages/DashboardPage"
import Layout from "./components/Layout"
import ProfilePage from "./pages/ProfilePage"
import { PrivateRoute } from "./components/ProtectedRoute"
import { UsersPage } from "./pages/UsersPage"
import { CreateUserPage } from "./pages/CreateUserPage"
import PostPage from "./pages/PostPage"
import PostDetailPage from "./pages/PostDetailPage"
import PublicRegisterForm from "./components/PublicRegisterForm"

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Redirigir raíz - verifica autenticación */}
          <Route path="/" element={
            <PrivateRoute>
              <Navigate to="/dashboard" replace />
            </PrivateRoute>
          } />
          
          {/* Si no está autenticado, PrivateRoute redirigirá a /login */}
          
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/public-register" element={<PublicRegisterForm />} />
          
          {/* Rutas protegidas con Layout */}
          <Route element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            
            {/* Rutas de administración */}
            <Route path="/users" element={
              <PrivateRoute requireAdmin>
                <UsersPage />
              </PrivateRoute>
            } />
            <Route path="/users/create" element={
              <PrivateRoute requireAdmin>
                <CreateUserPage />
              </PrivateRoute>
            } />
            
            {/* Redirigir cualquier otra ruta */}
            <Route path="*" element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App