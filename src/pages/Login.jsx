import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    
    setLoading(true);

    try {
      // Gọi API đăng nhập
      const userData = await authService.login(username, password);
      
      // Lưu token và thông tin user vào localStorage
      authService.saveUserData(userData);

      // Redirect về dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || 
        "Đăng nhập thất bại. Vui lòng kiểm tra lại username và password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#12c2e9] via-[#c471ed] to-[#f64f59] p-4">
      {/* Logo Unica */}
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold text-white tracking-tighter">
          unica
        </h1>
      </div>

      <div className="bg-white p-10 rounded-[20px] shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-700 uppercase tracking-wide">
          Đăng Nhập
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="Nhập số điện thoại hoặc email"
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="Nhập mật khẩu"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#34aadc] hover:bg-[#2986ad] text-white py-3 rounded-md font-bold text-lg shadow-lg transition-colors uppercase disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm space-y-2">
          <p className="text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <a href="#" className="text-gray-800 font-bold hover:underline">
              Đăng ký mới
            </a>
          </p>
          <p>
            <a href="#" className="text-red-500 hover:underline">
              Quên mật khẩu?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
