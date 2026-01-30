import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";
import authService from "../services/authService";

// Định nghĩa Role constant để tránh gõ sai
const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  USER: "User",
};

const Sidebar = () => {
  // 1. Lấy thông tin User hiện tại
  const user = authService.getUserData();
  const currentRole = user?.role; // Ví dụ: "Staff" hoặc "Admin"

  // 2. Cấu hình danh sách Menu
  // allowedRoles: Danh sách các vai trò ĐƯỢC PHÉP nhìn thấy menu này
  const menuConfig = [
    {
      label: "Tổng quan",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF], // Admin & Staff đều thấy
      end: true, // Để active đúng khi ở trang chủ dashboard
    },
    {
      label: "Quản lý User",
      path: "/dashboard/users",
      icon: <Users size={20} />,
      allowedRoles: [ROLES.ADMIN], // CHỈ ADMIN MỚI THẤY (Staff sẽ bị ẩn)
    },
    {
      label: "Quản lý Công ty",
      path: "/dashboard/companies",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF], // Admin & Staff đều thấy
    },
    {
      label: "Upload file",
      path: "/dashboard/upload",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF], // Admin & Staff đều thấy
    },
    {
      label: "Draft Report",
      path: "/dashboard/draft-report",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF], // Admin & Staff đều thấy
    },
    {
      label: "Quản lý Báo cáo",
      path: "/dashboard/reports",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF], // Admin & Staff đều thấy
    },
    {
      path: "/dashboard/metrics",
      label: "Metrics",
      icon: <BarChart3 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF], // Admin & Staff đều thấy
    },
    {
      label: "Validation Config",
      path: "/dashboard/validation",
      icon: <ShieldCheck size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Nhật ký hoạt động",
      path: "/dashboard/audit",
      icon: <FileText size={20} />,
      allowedRoles: [ROLES.ADMIN], // CHỈ ADMIN MỚI THẤY
    },
    {
      label: "Cài đặt",
      path: "/dashboard/settings",
      icon: <Settings size={20} />,
      allowedRoles: [ROLES.ADMIN], // Giả sử chỉ Admin mới được chỉnh cài đặt
    },
  ];

  // 3. Lọc menu: Chỉ giữ lại các item mà Role hiện tại có trong danh sách cho phép
  const visibleMenu = menuConfig.filter((item) =>
    item.allowedRoles.includes(currentRole),
  );

  return (
    <aside className="w-64 bg-[#001529] text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* --- LOGO --- */}
      <Link to="/" className="h-16 flex items-center justify-center border-b border-gray-700 hover:bg-[#1890ff]/10 transition-colors cursor-pointer">
        <span className="text-xl font-bold tracking-wider text-white">
          UNICA FINANCE
        </span>
      </Link>

      {/* --- MENU LIST --- */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {visibleMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-[#1890ff] text-white shadow-md translate-x-1"
                  : "text-gray-400 hover:bg-[#1890ff]/10 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* --- USER INFO (Footer Sidebar) --- */}
      <div className="p-4 border-t border-gray-700 bg-[#000c17]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate w-32">
              {user?.username}
            </span>
            <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded w-fit">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
