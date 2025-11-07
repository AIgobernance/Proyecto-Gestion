// resources/js/app.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";

// Páginas (todas están en resources/js)
// Públicas
//import { HomePage } from "./HomePage.jsx";
import HomePage from "./HomePage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { RegisterPage } from "./RegisterPage.jsx";
import { AdminLoginPage } from "./AdminLoginPage.jsx";
import { AdminRegisterPage } from "./AdminRegisterPage.jsx";

// Usuario autenticado
import { DashboardPage } from "./DashboardPage.jsx";
import { ViewEvaluationsPage } from "./ViewEvaluationsPage.jsx";
import { EvaluationPage } from "./EvaluationPage.jsx";
import { EvaluationCompletedPage } from "./EvaluationCompletedPage.jsx";
import { UserProfilePage } from "./UserProfilePage.jsx";

// Admin autenticado
import { AdminDashboardPage } from "./AdminDashboardPage.jsx";
import { GeneralDashboardPage } from "./GeneralDashboardPage.jsx";
import { UserManagementPage } from "./UserManagementPage.jsx";

// (Los modales como VerificationMethodModal, CodeVerificationModal, etc. no son rutas;
// se usan dentro de las páginas. No es necesario enrutarlos.)

/* =========================================================================
   Guardas sencillos (puedes reemplazar por tu lógica real de auth/roles)
   ======================================================================= */
function useAuth() {
  // Sustituye por tu estado global / contexto / JWT
  const [user, setUser] = React.useState(null);
  const loginAsUser = (username) => setUser({ username, role: "user" });
  const loginAsAdmin = (username) => setUser({ username, role: "admin" });
  const logout = () => setUser(null);
  return { user, loginAsUser, loginAsAdmin, logout };
}

const AuthContext = React.createContext(null);
const useAuthCtx = () => React.useContext(AuthContext);

function ProtectedRoute({ children, allowRoles = ["user", "admin"] }) {
  const { user } = useAuthCtx();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children ?? <Outlet />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuthCtx();
  if (user) return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
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
                  onLoginSuccess={(username) => {
                    auth.loginAsUser(username);
                    navigate("/dashboard");
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
                  onLoginSuccess={(username) => {
                    auth.loginAsAdmin(username);
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
        </Route>

        {/* ========= USUARIO AUTENTICADO ========= */}
        <Route element={<ProtectedRoute allowRoles={["user", "admin"]} />}>
          <Route element={<UserLayout />}>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  username={auth.user?.username ?? "Usuario"}
                  onLogout={() => {
                    auth.logout();
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
                  onComplete={() => navigate("/evaluation/completed")}
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
                  onBack={() => navigate("/evaluations")}
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
                  onViewEvaluations={() => navigate("/evaluations")}
                  onStartEvaluation={() => navigate("/evaluation/start")}
                  onViewProfile={() => navigate("/profile")}
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
