import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import {
  HomePage,
  SignUpPage,
  ProgressPage,
  HistoryPage,
  LoginPage,
  ForgotPasswordPage,
  DashboardPage,
  LandingPage,
  PracticePage,
  AdminUserManagementPage,
  AdminExerciseManagementPage,
  ProfilePage,
} from "./pages";
import { AuthProvider } from "./context/auth-context";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminRoute from "./components/routes/AdminRoute";
import PublicRoute from "./components/routes/PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Only for Guests */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected Routes - Only for Authenticated Users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/my-progress" element={<ProgressPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin Routes - Only for Admin Users */}
          <Route element={<AdminRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/admin/users" element={<AdminUserManagementPage />} />
              <Route path="/admin/exercises" element={<AdminExerciseManagementPage />} />
            </Route>
          </Route>

          {/* Universal/Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<div className="p-10">404 - Not Found</div>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
