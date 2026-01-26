import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages (Public)
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import CompanyManagement from "./pages/CompanyManagement";
import ValidationConfig from "./pages/ValidationConfig";
import AuditLogs from "./pages/AuditLogs";

// Layouts & Dashboard Pages
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard"; // File nội dung Dashboard cũ đã sửa lại

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
          {/* Bước 2: Route index hiển thị Dashboard khi vào đúng link /dashboard */}
          <Route index element={<Dashboard />} />

          {/* Bước 3: Các route con (sẽ hiện trong <Outlet /> của Layout) */}
          <Route path="users" element={<UserManagement />} />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="validation" element={<ValidationConfig />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="settings" element={<div>Chưa làm</div>} />
        </Route>

        {/* --- 404 Page --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
