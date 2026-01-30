import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin, message } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dashboardService from "../services/dashboardService";
import DashboardChart from "../components/Dashboard/DashboardChart";
import DashboardStats from "../components/Dashboard/DashboardStats";
import RecentLogs from "../components/Dashboard/RecentLogs";
import authService from "../services/authService";

const Dashboard = () => {
  const user = authService.getUserData();
  const isStaff = user?.role === "Staff";

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalReports: 0,
    recentLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        message.error("Lỗi tải dữ liệu Dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStats data={stats} loading={loading} />
      <DashboardChart loading={loading} />

      {!isStaff && <RecentLogs data={stats.recentLogs} loading={loading} />}
    </div>
  );
};

export default Dashboard;
