import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { HomePage, ProgressPage, HistoryPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="my-progress" element={<ProgressPage />} />
          <Route path="history" element={<HistoryPage />} />
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
