// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import {
  HomePage,
  SignUpPage,
  ProgressPage,
  HistoryPage,
  LoginPage,
  ForgotPasswordPage,
  DashboardPage,
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Main layout and outlet for all pages*/}
        <Route path="/" element={<MainLayout />}>
          {/* default page when entry*/}
          <Route index element={<HomePage />} />

          {/* List of path*/}
          <Route path ="signup" element={<SignUpPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-progress" element={<ProgressPage />} />
          <Route path="history" element={<HistoryPage />} />

          {/* 404 */}
          <Route
            path="*"
            element={<div className="p-10">404 - Not Found</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
