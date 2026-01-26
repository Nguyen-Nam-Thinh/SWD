import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  Settings,
  Users,
  FileText,
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    {
      path: "/dashboard",
      label: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
      end: true,
    },
    { path: "/dashboard/users", label: "Users", icon: <Users size={20} /> },
    {
      path: "/dashboard/companies",
      label: "Companies",
      icon: <FileText size={20} />,
    },
    {
      path: "/dashboard/validation",
      label: "Validation Config",
      icon: <PieChart size={20} />,
    },
    {
      path: "/dashboard/audit",
      label: "Audit Logs",
      icon: <Wallet size={20} />,
    },

    {
      path: "/dashboard/settings",
      label: "Cài đặt",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 h-full">
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
          U
        </div>
        <span className="text-lg font-bold tracking-wide">UNICA FINANCE</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end} // end=true để chỉ active khi đúng chính xác đường dẫn (dùng cho trang chủ)
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-sm ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Sidebar (Optional) */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.0 - Unica Corp
      </div>
    </aside>
  );
};

export default Sidebar;
