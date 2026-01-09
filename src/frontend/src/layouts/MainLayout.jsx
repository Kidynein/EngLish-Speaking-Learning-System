import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePremium } from "../context/PremiumContext";
import PremiumUpgradeModal from "../components/premium/PremiumUpgradeModal";
import AIChatBot from "../components/chat/AIChatBot";


const MainLayout = () => {
  const { showPremiumModal, dismissPremiumModal, isPro } = usePremium();

  return (
    <div className="min-h-screen bg-emerald-100 font-sans">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">

        <Outlet />
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={(upgraded) => dismissPremiumModal(upgraded)}
        onSkip={() => dismissPremiumModal(false)}
      />
      
      {/* AI ChatBot - Available for Pro users */}
      <AIChatBot />
    </div>
  );
};
export default MainLayout;
