// resources/js/app.jsx
import React from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";

// Páginas (todas están en resources/js)
// Públicas
import HomePage from "./HomePage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { RegisterPage } from "./RegisterPage.jsx";
import { AdminLoginPage } from "./AdminLoginPage.jsx";
import { AdminRegisterPage } from "./AdminRegisterPage.jsx";
import EmailVerificationPage from "./EmailVerificationPage.jsx";

// Usuario autenticado
import DashboardPage from "./DashboardPage.jsx";
import { ViewEvaluationsPage } from "./ViewEvaluationsPage.jsx";
import { EvaluationPage } from "./EvaluationPage.jsx";
import { EvaluationCompletedPage } from "./EvaluationCompletedPage.jsx";
import { UserProfilePage } from "./UserProfilePage.jsx";

// Admin autenticado
import AdminDashboardPage from "./AdminDashboardPage.jsx";
import GeneralDashboardPage from "./GeneralDashboardPage.jsx";
import { UserManagementPage } from "./UserManagementPage.jsx";

/* =========================================================================
   Sistema de autenticación con verificación de sesión del servidor
   ======================================================================= */
function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false); // Cambiar a false inicialmente

  const checkAuth = React.useCallback(async () => {
    try {
      const axiosClient = window.axios || axios;
      const response = await axiosClient.get('/auth/check');
      if (response.data.authenticated && response.data.user) {
        setUser({
          username: response.data.user.nombre,
          id: response.data.user.id,
          correo: response.data.user.correo,
          role: response.data.user.rol || 'usuario',
          empresa: response.data.user.empresa
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      // No autenticado o error
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar sesión al cargar
  React.useEffect(() => {
    // Solo mostrar loading si estamos en una ruta protegida
    const currentPath = window.location.pathname;
    const isPublicRoute = ['/login', '/register', '/admin/login', '/admin/register', '/'].includes(currentPath);
    
    if (!isPublicRoute) {
      setLoading(true);
      // En rutas protegidas, verificar inmediatamente
      checkAuth();
    } else {
      // En rutas públicas, NO verificar automáticamente para evitar redirecciones
      // El usuario puede hacer login manualmente
      setLoading(false);
    }
  }, [checkAuth]);


  const loginAsUser = (username, userData) => {
    console.log('loginAsUser llamado con:', { username, userData });
    const userObj = {
      username: userData?.nombre || username,
      id: userData?.id,
      correo: userData?.correo,
      role: userData?.rol || 'usuario',
      empresa: userData?.empresa
    };
    console.log('Estableciendo usuario:', userObj);
    setUser(userObj);
    setLoading(false); // Asegurar que loading sea false después del login
  };

  const loginAsAdmin = (username, userData) => {
    const userObj = {
      username: userData?.nombre || username,
      id: userData?.id,
      correo: userData?.correo,
      role: 'admin',
      empresa: userData?.empresa
    };
    setUser(userObj);
    setLoading(false); // Asegurar que loading sea false después del login
  };

  const logout = async () => {
    try {
      const axiosClient = window.axios || axios;
      await axiosClient.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
    }
  };

  return { user, loginAsUser, loginAsAdmin, logout, loading, checkAuth };
}

const AuthContext = React.createContext(null);
const useAuthCtx = () => React.useContext(AuthContext);

/* === ARREGLO PRINCIPAL ===
   Detectamos si la ruta es /admin* para enviar al login correcto.
*/
function ProtectedRoute({ children, allowRoles = ["user", "admin"] }) {
  const { user, loading, checkAuth } = useAuthCtx();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [hasChecked, setHasChecked] = React.useState(false);

  // Debug
  React.useEffect(() => {
    console.log('ProtectedRoute - Estado:', { user, loading, hasChecked, pathname: location.pathname });
  }, [user, loading, hasChecked, location.pathname]);

  // Verificar sesión cuando se monta el componente o cambia la ruta
  React.useEffect(() => {
    const verifySession = async () => {
      // Si ya hay un usuario, marcar como verificado y permitir acceso
      if (user) {
        setHasChecked(true);
        return;
      }
      
      // Si no hay usuario y no se ha verificado, verificar la sesión
      if (!user && !hasChecked) {
        setHasChecked(true);
        await checkAuth();
      }
    };
    verifySession();
  }, [checkAuth, location.pathname, hasChecked, user]);

  // PRIORIDAD 1: Si hay usuario, permitir acceso inmediatamente (sin esperar verificación)
  if (user) {
    console.log('ProtectedRoute - Usuario encontrado, verificando rol:', user.role, 'allowRoles:', allowRoles);
    
    // Normalizar el rol: "usuario" -> "user", "admin" -> "admin"
    const normalizedRole = user.role === 'usuario' ? 'user' : user.role;
    
    // Verificar si el rol normalizado está permitido
    if (!allowRoles.includes(normalizedRole)) {
      console.log('ProtectedRoute - Rol no permitido, redirigiendo');
    // Usuario logueado pero con rol inválido para la vista
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
        replace
      />
    );
  }
    console.log('ProtectedRoute - Permitiendo acceso, renderizando children/Outlet');
    // Permitir acceso inmediatamente
    return children ?? <Outlet />;
  }

  // PRIORIDAD 2: Mostrar loading solo si no hay usuario Y aún no se ha verificado
  if (!hasChecked || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#fff', background: 'linear-gradient(180deg, #213e90 0%, #1a2e74 100%)' }}>
        Cargando...
      </div>
    );
  }

  // PRIORIDAD 3: Si no hay usuario después de verificar, redirigir al login
  if (!user) {
    return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} replace />;
  }

  return children ?? <Outlet />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuthCtx();
  const location = useLocation();
  
  // No bloquear mientras carga en rutas públicas
  if (loading) {
    return children ?? <Outlet />;
  }
  
  // Permitir acceso a login/register incluso si hay sesión activa
  // Esto permite que el usuario pueda cambiar de cuenta o hacer logout
  const isLoginOrRegister = ['/login', '/register', '/admin/login', '/admin/register'].includes(location.pathname);
  
  // Solo redirigir si hay usuario Y NO estamos en login/register
  if (user && !isLoginOrRegister) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  
  return children ?? <Outlet />;
}

/* =========================================================================
   Layouts mínimos por grupo (opcional)
   ======================================================================= */
function PublicLayout() {
  return <Outlet />;
}
function UserLayout() {
  return <Outlet />;
}
function AdminLayout() {
  return <Outlet />;
}

/* =========================================================================
   App con todas las rutas
   ======================================================================= */
export default function App() {
  const auth = useAuth();
  const navigate = useNavigateSafe(); // pequeña ayuda para navegar desde callbacks

  // Debug: verificar que App se está renderizando
  React.useEffect(() => {
    console.log('App se está renderizando', { user: auth.user, loading: auth.loading });
  }, [auth.user, auth.loading]);

  return (
    <AuthContext.Provider value={auth}>
      <Routes>
        {/* ========= PÚBLICAS ========= */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <HomePage
                onRegister={() => navigate("/register")}
                onLogin={() => navigate("/login")}
                onLoginAsUser={() => navigate("/login")}
                onLoginAsAdmin={() => navigate("/admin/login")}
                onRegisterAsUser={() => navigate("/register")}
                onRegisterAsAdmin={() => navigate("/admin/register")}
              />
            }
          />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage
                  onBack={() => navigate("/")}
                  onRegister={() => navigate("/register")}
                  onLoginSuccess={async (username, userData) => {
                    console.log('onLoginSuccess llamado con:', { username, userData });
                    // Determinar si es admin o usuario normal
                    const role = userData?.rol || 'usuario';
                    console.log('Rol detectado:', role);
                    if (role === 'admin') {
                      auth.loginAsAdmin(username, userData);
                      navigate("/admin/dashboard");
                    } else {
                      auth.loginAsUser(username, userData);
                      console.log('Navegando a /dashboard');
                    navigate("/dashboard");
                    }
                  }}
                />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage
                  onBack={() => navigate("/")}
                  onLoginRedirect={() => navigate("/login")}
                />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/admin/login"
            element={
              <PublicOnlyRoute>
                <AdminLoginPage
                  onBack={() => navigate("/")}
                  onRegister={() => navigate("/admin/register")}
                  onLoginSuccess={(username, userData) => {
                    auth.loginAsAdmin(username, userData);
                    navigate("/admin/dashboard");
                  }}
                />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/admin/register"
            element={
              <PublicOnlyRoute>
                <AdminRegisterPage
                  onBack={() => navigate("/")}
                  onLoginRedirect={() => navigate("/admin/login")}
                />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/verify-email"
            element={
              <PublicOnlyRoute>
                <EmailVerificationPage />
              </PublicOnlyRoute>
            }
          />
        </Route>

        {/* ========= USUARIO AUTENTICADO ========= */}
        <Route element={<ProtectedRoute allowRoles={["user", "admin"]} />}>
          <Route element={<UserLayout />}>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  username={auth.user?.username ?? "Usuario"}
                  onLogout={async () => {
                    await auth.logout();
                    navigate("/");
                  }}
                  onViewEvaluations={() => navigate("/evaluations")}
                  onStartEvaluation={() => navigate("/evaluation/start")}
                  onViewProfile={() => navigate("/profile")}
                />
              }
            />

            <Route
              path="/evaluations"
              element={
                <ViewEvaluationsPage
                  onExit={() => {
                    auth.logout();
                    navigate("/");
                  }}
                  onViewResults={(evaluationId) => navigate(`/evaluation/${evaluationId}/completed`)}
                />
              }
            />

            <Route
              path="/evaluation/start"
              element={
                <EvaluationPage
                  onBack={() => navigate("/dashboard")}
                  onPause={() => navigate("/dashboard")}
                  onComplete={(answers, evaluationId) => {
                    // Navegar a la página de completado con el ID de evaluación si está disponible
                    if (evaluationId) {
                      navigate(`/evaluation/${evaluationId}/completed`);
                    } else {
                      navigate("/evaluation/completed");
                    }
                  }}
                />
              }
            />

            <Route
              path="/evaluation/completed"
              element={
                <EvaluationCompletedPage
                  onBack={() => navigate("/dashboard")}
                  onViewResults={() => navigate("/evaluations")}
                />
              }
            />

            <Route
              path="/evaluation/:id/completed"
              element={
                <EvaluationCompletedPage
                  onBack={() => navigate("/dashboard")}
                  onViewResults={() => navigate("/evaluations")}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <UserProfilePage
                  username={auth.user?.username ?? "Usuario"}
                  onBack={() => navigate("/dashboard")}
                />
              }
            />
          </Route>
        </Route>

        {/* ========= ADMIN AUTENTICADO ========= */}
        <Route element={<ProtectedRoute allowRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={
                <AdminDashboardPage
                  username={auth.user?.username ?? "Admin"}
                  onLogout={() => {
                    auth.logout();
                    navigate("/");
                  }}
                  onGoUsers={() => navigate("/admin/users")}
                  onGoAnalytics={() => navigate("/admin/analytics")}
                  onGoHome={() => navigate("/admin/dashboard")}
                />
              }
            />

            <Route
              path="/admin/analytics"
              element={<GeneralDashboardPage onBack={() => navigate("/admin/dashboard")} />}
            />

            <Route
              path="/admin/users"
              element={<UserManagementPage onBack={() => navigate("/admin/dashboard")} />}
            />
          </Route>
        </Route>

        {/* ========= 404 ========= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

/* =========================================================================
   Pequeño helper para poder usar navigate fuera de un componente Route
   ======================================================================= */
function useNavigateSafe() {
  const navigate = useNavigate();
  return React.useCallback((to, opts) => navigate(to, opts), [navigate]);
}
