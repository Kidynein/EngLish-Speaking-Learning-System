import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePremium } from "../context/PremiumContext";


const MainLayout = () => {
  const { loading } = usePremium();

  // Show loading spinner while premium context is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 [.light-theme_&]:bg-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          <p className="text-slate-400 [.light-theme_&]:text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 [.light-theme_&]:bg-slate-50 font-sans transition-colors duration-300">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">

        <Outlet />
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};
export default MainLayout;
