import authService from "../services/authService";

const DashboardHome = () => {
  const user = authService.getUserData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Xin chào, {user?.fullName}! 👋
        </h1>
        <p className="text-slate-500">
          Đây là bảng tổng quan tình hình tài chính của bạn hôm nay.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Ví dụ về các thẻ thống kê */}
           <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-blue-600 font-semibold mb-1">Số dư khả dụng</h3>
              <p className="text-3xl font-bold text-slate-900">12,500,000 ₫</p>
           </div>
           <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-green-600 font-semibold mb-1">Doanh thu tháng</h3>
              <p className="text-3xl font-bold text-slate-900">45,200,000 ₫</p>
           </div>
           <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-purple-600 font-semibold mb-1">Khách hàng mới</h3>
              <p className="text-3xl font-bold text-slate-900">128</p>
           </div>
        </div>
      </div>
      
      {/* Thông tin kỹ thuật (từ code cũ của bạn) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Thông tin phiên làm việc</h3>
        <ul className="list-disc list-inside text-slate-600 space-y-2">
           <li>Username: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{user?.username}</span></li>
           <li>Role: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{user?.role}</span></li>
           <li>API Endpoint: http://51.210.176.94:5000</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;