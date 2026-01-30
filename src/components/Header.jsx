import { LogOut, Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getUserData();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      {/* Search Bar (Trang trí) */}
      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm giao dịch, nhân sự..." 
          className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-blue-600 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-slate-800">{user?.fullName || "User"}</div>
            <div className="text-xs text-slate-500 capitalize">{user?.role || "Member"}</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-blue-300 shadow-md">
            {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
          </div>
          
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;