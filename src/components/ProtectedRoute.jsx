import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Kiểm tra authentication - có thể thay đổi logic này theo nhu cầu
  const isAuthenticated = localStorage.getItem("token"); // hoặc lấy từ Redux/Context

  if (!isAuthenticated) {
    // Redirect về trang login nếu chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
