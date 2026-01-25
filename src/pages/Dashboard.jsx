import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getUserData();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Đăng Xuất
          </button>
        </div>
      </nav>

      <div className="container mx-auto mt-8 p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">
            Chào mừng, {user?.fullName || user?.username}!
          </h2>
          <p className="text-gray-600">
            Đây là trang dashboard được bảo vệ bởi ProtectedRoute.
          </p>

          {user && (
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Username:</span> {user.username}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Họ tên:</span> {user.fullName}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Vai trò:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {user.role}
                </span>
              </p>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Thông tin:</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Route này chỉ truy cập được khi đã đăng nhập</li>
              <li>Nếu chưa đăng nhập, sẽ redirect về /login</li>
              <li>Token được lưu trong localStorage</li>
              <li>API: http://51.210.176.94:5000</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
