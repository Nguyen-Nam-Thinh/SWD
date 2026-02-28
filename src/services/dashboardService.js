import api from "./api";
import dayjs from "dayjs";

const dashboardService = {
  // HÀM 1: Lấy số liệu tổng quan (Siêu nhanh - Dùng cho các thẻ Card ở trên)
  getDashboardStats: async () => {
    try {
      const [usersRes, companiesRes, reportsRes, logsRes] = await Promise.all([
        // Chỉ lấy 1 bản ghi để xem TotalCount
        api.get("/users", { params: { PageSize: 1 } }),
        api.get("/companies", { params: { PageSize: 1 } }),
        api.get("/financial-reports", { params: { PageSize: 1 } }),
        // Lấy log gần đây
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
      // Lấy dữ liệu số lượng lớn để tính toán client-side
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
          const dateStr = date.format("YYYY-MM-DD"); // Để so sánh
          const displayStr = date.format("DD/MM"); // Để hiển thị

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

      // Bạn có thể mở rộng thêm logic tính tháng/năm ở đây nếu muốn
      return {
        week: calculateLast7Days(),
        month: [], // Để trống hoặc viết logic tương tự
        year: [], // Để trống hoặc viết logic tương tự
      };
    } catch (error) {
      console.error("Lỗi tính toán biểu đồ:", error);
      // Trả về dữ liệu rỗng để không làm crash trang web
      return { week: [], month: [], year: [] };
    }
  },
};

export default dashboardService;
