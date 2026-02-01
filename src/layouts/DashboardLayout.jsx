import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 1. Sidebar cố định bên trái */}
      <Sidebar />

      {/* 2. Phần nội dung chính (bên phải Sidebar) */}
      <div className="md:ml-64 ml-0">
        {/* Header cố định bên trên */}
        <Header />

        {/* Nội dung thay đổi (Main Content) */}
        <main className="mt-16 p-4 md:p-8">
          {/* Outlet là nơi các trang con (Overview, Settings,...) sẽ hiển thị */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
