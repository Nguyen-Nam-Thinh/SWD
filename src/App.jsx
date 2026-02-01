import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import CompanyManagement from "./pages/CompanyManagement";
import MetricsManagement from "./pages/MetricsManagement";
import ValidationConfig from "./pages/ValidationConfig";
import AuditLogs from "./pages/AuditLogs";
import Upload from "./pages/Upload";
import Reports from "./pages/ReportsManager";
import FinancialReports from "./pages/FinancialReports";
import DraftReport from "./pages/DraftReport";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Chatbox from "./components/Chat/ChatBox";
import companyService from "./services/companyService";

import "./App.css";

const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  USER: "User",
};

function App() {
  const [companies, setCompanies] = useState([]);

  // Fetch companies cho chatbox (chỉ khi đã đăng nhập)
  useEffect(() => {
    const fetchCompanies = async () => {
      // Kiểm tra đã đăng nhập chưa
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await companyService.getCompanies();
        setCompanies(response.items || response || []);
      } catch (error) {
        console.error("Failed to fetch companies for chatbox:", error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/financial-reports" element={<FinancialReports />} />

        {/* --- Protected Dashboard Area --- */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="upload" element={<Upload />} />
          <Route path="draft-report" element={<DraftReport />} />
          <Route path="reports" element={<Reports />} />
          <Route path="metrics" element={<MetricsManagement />} />
          <Route path="validation" element={<ValidationConfig />} />
          <Route
            path="audit"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* --- 404 Page --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* AI Chatbox - Global */}
      <Chatbox companies={companies} />
    </BrowserRouter>
  );
}

export default App;
