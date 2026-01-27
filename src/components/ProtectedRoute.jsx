import { Navigate } from "react-router-dom";
import { Result, Button } from "antd";
import authService from "../services/authService";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getUserData();
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="403"
          title="403 Forbidden"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
          extra={
            <Button
              type="primary"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Quay về Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
