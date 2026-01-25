import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages (Public)
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Layouts & Dashboard Pages
import DashboardLayout from "./layouts/DashboardLayout"; 
import DashboardHome from "./pages/Dashboard"; // File nội dung Dashboard cũ đã sửa lại

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* --- Protected Dashboard Area --- */}
        {/* Bước 1: ProtectedRoute bảo vệ cả cụm Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Bước 2: Route index hiển thị DashboardHome khi vào đúng link /dashboard */}
          <Route index element={<DashboardHome />} />

          {/* Bước 3: Các route con (sẽ hiện trong <Outlet /> của Layout)
          <Route path="analytics" element={<div className="p-4">Trang Phân Tích (Đang phát triển)</div>} />
          <Route path="transactions" element={<div className="p-4">Trang Giao Dịch (Đang phát triển)</div>} />
          <Route path="users" element={<div className="p-4">Quản Lý Nhân Sự (Đang phát triển)</div>} />
          <Route path="reports" element={<div className="p-4">Báo Cáo (Đang phát triển)</div>} />
          <Route path="settings" element={<div className="p-4">Cài Đặt Hệ Thống (Đang phát triển)</div>} /> */}
        </Route>

        {/* --- 404 Page --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;