import api from "./api";
import dayjs from "dayjs";

const dashboardService = {
  // HÀM 1: Lấy số liệu tổng quan (Siêu nhanh - Dùng cho các thẻ Card ở trên)
  getDashboardStats: async () => {
    try {
      const [usersRes, companiesRes, reportsRes, logsRes] = await Promise.all([
        api.get("/users", { params: { PageSize: 1 } }),
        api.get("/companies", { params: { PageSize: 1 } }),
        api.get("/financial-reports", { params: { PageSize: 1 } }),
        api.get("/audit-logs", {
          params: { PageSize: 5, SortBy: "timestamp", IsDescending: true },
        }),
      ]);

      return {
        totalUsers: usersRes.data.totalCount || 0,
        totalCompanies: companiesRes.data.totalCount || 0,
        totalReports: reportsRes.data.totalCount || 0,
        recentLogs: logsRes.data.items || [],
      };
    } catch (error) {
      console.error("Lỗi lấy thống kê tổng quan:", error);
      throw error;
    }
  },

  // HÀM 2: Lấy dữ liệu biểu đồ (Nặng - Dùng riêng cho Chart)
  getChartStats: async () => {
    try {
      const [usersRes, reportsRes] = await Promise.all([
        api.get("/users", { params: { PageSize: 1000 } }),
        api.get("/financial-reports", { params: { PageSize: 1000 } }),
      ]);

      const users = usersRes.data.items || [];
      const reports = reportsRes.data.items || [];

      // Logic tính toán 7 ngày gần nhất (Tuần)
      const calculateLast7Days = () => {
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = dayjs().subtract(i, "day");
          const dateStr = date.format("YYYY-MM-DD");
          const displayStr = date.format("DD/MM");

          const userCount = users.filter(
            (u) => dayjs(u.createdDate).format("YYYY-MM-DD") === dateStr,
          ).length;

          const reportCount = reports.filter(
            (r) => dayjs(r.uploadedAt).format("YYYY-MM-DD") === dateStr,
          ).length;

          chartData.push({
            name: displayStr,
            users: userCount,
            reports: reportCount,
          });
        }
        return chartData;
      };

      // Logic tính toán 30 ngày gần nhất gom theo tuần (Tháng)
      const calculateMonthData = () => {
        const chartData = [];
        // 4 tuần gần nhất
        for (let i = 3; i >= 0; i--) {
          const weekEnd = dayjs().subtract(i * 7, "day");
          const weekStart = weekEnd.subtract(6, "day");
          const displayStr = `${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`;

          const userCount = users.filter((u) => {
            const created = dayjs(u.createdDate);
            return (
              created.isAfter(weekStart.subtract(1, "day")) &&
              created.isBefore(weekEnd.add(1, "day"))
            );
          }).length;

          const reportCount = reports.filter((r) => {
            const uploaded = dayjs(r.uploadedAt);
            return (
              uploaded.isAfter(weekStart.subtract(1, "day")) &&
              uploaded.isBefore(weekEnd.add(1, "day"))
            );
          }).length;

          chartData.push({
            name: displayStr,
            users: userCount,
            reports: reportCount,
          });
        }
        return chartData;
      };

      // Logic tính toán 12 tháng gần nhất (Năm)
      const calculateYearData = () => {
        const chartData = [];
        for (let i = 11; i >= 0; i--) {
          const month = dayjs().subtract(i, "month");
          const monthStr = month.format("YYYY-MM");
          const displayStr = `T${month.format("MM/YYYY")}`;

          const userCount = users.filter(
            (u) => dayjs(u.createdDate).format("YYYY-MM") === monthStr,
          ).length;

          const reportCount = reports.filter(
            (r) => dayjs(r.uploadedAt).format("YYYY-MM") === monthStr,
          ).length;

          chartData.push({
            name: displayStr,
            users: userCount,
            reports: reportCount,
          });
        }
        return chartData;
      };

      return {
        week: calculateLast7Days(),
        month: calculateMonthData(),
        year: calculateYearData(),
      };
    } catch (error) {
      console.error("Lỗi tính toán biểu đồ:", error);
      return { week: [], month: [], year: [] };
    }
  },
};

export default dashboardService;
