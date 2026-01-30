import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import authService from "../services/authService";

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = authService.getUserData();
  const isLoggedIn = !!user;

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            U
          </div>
          UNICA FINANCE
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="/#features"
            className="hover:text-blue-600 transition-colors"
          >
            Tính năng
          </a>
          <a
            href="#solutions"
            className="hover:text-blue-600 transition-colors"
          >
            Giải pháp
          </a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">
            Bảng giá
          </a>
          <Link
            to="/financial-reports"
            className="hover:text-blue-600 transition-colors font-semibold text-blue-600"
          >
            Xem các công ty
          </Link>
        </nav>

        {/* Auth Buttons / User Avatar */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-full transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-blue-300 shadow-md hover:scale-110 transition-transform"
                title={user.fullName || user.username}
              >
                {(user.fullName || user.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-blue-600"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-blue-600/20"
              >
                Mở tài khoản
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-600"
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
          <a href="/#features" className="block text-slate-600 font-medium">
            Tính năng
          </a>
          <a href="/#solutions" className="block text-slate-600 font-medium">
            Giải pháp
          </a>
          <a href="/#pricing" className="block text-slate-600 font-medium">
            Bảng giá
          </a>
          <Link
            to="/financial-reports"
            className="block text-blue-600 font-semibold"
          >
            Xem các công ty
          </Link>
          {isLoggedIn ? (
            <Link to="/dashboard" className="block text-blue-600 font-bold">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="block text-blue-600 font-bold">
              Đăng nhập ngay
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
