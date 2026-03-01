import { useEffect, useState } from "react";
import { Spin, message } from "antd";
import dashboardService from "../services/dashboardService";
import DashboardChart from "../components/Dashboard/DashboardChart";
import DashboardStats from "../components/Dashboard/DashboardStats";
import RecentLogs from "../components/Dashboard/RecentLogs";
import authService from "../services/authService";

const Dashboard = () => {
  const user = authService.getUserData();
  const isStaff = user?.role === "Staff";

  // State 1: Dữ liệu Tổng quan
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalReports: 0,
    recentLogs: [],
  });

  // SỬA Ở ĐÂY: Nếu là Staff, không cần bật trạng thái loading của stats
  const [statsLoading, setStatsLoading] = useState(!isStaff);

  // State 2: Dữ liệu Biểu đồ
  const [chartData, setChartData] = useState({ week: [], month: [], year: [] });
  const [chartLoading, setChartLoading] = useState(true);

  // EFFECT 1: Tải số liệu tổng quan
  useEffect(() => {
    const fetchStats = async () => {
      // SỬA Ở ĐÂY: Chặn gọi API lấy số liệu tổng quan & audit logs đối với Staff
      // Điều này ngăn chặn triệt để lỗi 403 Forbidden do gọi nhầm API không có quyền
      if (isStaff) {
        setStatsLoading(false);
        return;
      }

      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        message.error("Lỗi tải số liệu tổng quan");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [isStaff]);

  // EFFECT 2: Tải dữ liệu biểu đồ (Chạy cho cả Admin và Staff)
  useEffect(() => {
    const fetchChart = async () => {
      try {
        const data = await dashboardService.getChartStats();
        setChartData(data);
      } catch (error) {
        console.error("Lỗi tải biểu đồ");
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, []);

  if (statsLoading) {
    return (
      <div className="flex h-64 justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-0">
      {/* SỬA Ở ĐÂY: Đảm bảo Staff không load DashboardStats để UI sạch sẽ */}
      {!isStaff && <DashboardStats data={stats} loading={statsLoading} />}

      {/* Biểu đồ dùng state chartData và loading riêng */}
      <DashboardChart chartData={chartData} loading={chartLoading} />

      {/* Ẩn Audit Logs đối với Staff */}
      {!isStaff && (
        <RecentLogs data={stats.recentLogs} loading={statsLoading} />
      )}
    </div>
  );
};

export default Dashboard;