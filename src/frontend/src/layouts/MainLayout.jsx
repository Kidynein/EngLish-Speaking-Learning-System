import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const MainLayout = () => {
  return (
    <div className="min-h-screen bg-emerald-100 font-sans">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">

        <Outlet />
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};
export default MainLayout;
