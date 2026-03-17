import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getUserData();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 md:left-64 left-0 z-10">
      {/* Left spacer */}
      <div className="flex items-center" />

      {/* Right Actions */}
      <div className="flex items-center">
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 md:gap-3 rounded-lg px-1 py-1 hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">
                {user?.fullName || "Người dùng"}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {user?.role || "Thành viên"}
              </div>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg border-2 border-blue-300 shadow-md">
              {(user?.fullName || user?.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
