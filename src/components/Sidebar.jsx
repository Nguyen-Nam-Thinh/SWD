import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BarChart3,
  Menu,
  X,
  Factory, // Icon cho Industry
  FolderTree // Icon cho Metric Groups
} from "lucide-react";
import authService from "../services/authService";

const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  USER: "User",
};

const Sidebar = () => {
  const user = authService.getUserData();
  const currentRole = user?.role;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuConfig = [
    {
      label: "Tổng quan",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      end: true,
    },
    {
      label: "Quản lý User",
      path: "/dashboard/users",
      icon: <Users size={20} />,
      allowedRoles: [ROLES.ADMIN],
    },
    {
      label: "Quản lý Ngành",
      path: "/dashboard/industries",
      icon: <Factory size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Quản lý Công ty",
      path: "/dashboard/companies",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Upload file",
      path: "/dashboard/upload",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Draft Report",
      path: "/dashboard/draft-report",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Quản lý Báo cáo",
      path: "/dashboard/reports",
      icon: <Building2 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Nhóm Chỉ số",
      path: "/dashboard/metric-groups",
      icon: <FolderTree size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      path: "/dashboard/metrics",
      label: "Metrics",
      icon: <BarChart3 size={20} />,
      allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    },
    {
      label: "Nhật ký hoạt động",
      path: "/dashboard/audit",
      icon: <FileText size={20} />,
      allowedRoles: [ROLES.ADMIN],
    },
  ];

  const visibleMenu = menuConfig.filter((item) =>
    item.allowedRoles.includes(currentRole),
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-[60] text-slate-700 p-2 rounded-lg shadow-lg hover:bg-[#1890ff] hover:text-white transition-colors"
        aria-label="Toggle Menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`w-64 bg-[#001529] text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <Link
          to="/"
          className="h-16 flex items-center justify-center border-b border-gray-700 hover:bg-[#1890ff]/10 transition-colors cursor-pointer"
        >
          <span className="text-xl font-bold tracking-wider text-white">
            FinReports
          </span>
        </Link>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {visibleMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${isActive
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
    </>
  );
};

export default Sidebar;