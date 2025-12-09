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
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/my-progress" element={<ProgressPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
        {/* 404 - Not Found */}
        <Route path="*" element={<div className="p-10">404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
