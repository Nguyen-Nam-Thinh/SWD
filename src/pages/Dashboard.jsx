import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
          <h2 className="text-2xl font-bold mb-4">Chào mừng!</h2>
          <p className="text-gray-600">
            Đây là trang dashboard được bảo vệ bởi ProtectedRoute.
          </p>
          {user.email && (
            <p className="mt-4 text-gray-700">
              Email: <span className="font-semibold">{user.email}</span>
            </p>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Thông tin:</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Route này chỉ truy cập được khi đã đăng nhập</li>
              <li>Nếu chưa đăng nhập, sẽ redirect về /login</li>
              <li>Token được lưu trong localStorage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
