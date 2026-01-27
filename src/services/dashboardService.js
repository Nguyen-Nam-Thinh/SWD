import api from "./api";

const dashboardService = {
  /**
   * Lấy số liệu thống kê cho Dashboard
   * Chiến thuật: Gọi PageSize=1 để lấy trường 'totalCount' từ Backend trả về
   */
  getDashboardStats: async () => {
    try {
      const [usersRes, companiesRes, reportsRes, logsRes] = await Promise.all([
        // 1. Lấy Tổng User (Chỉ cần lấy 1 dòng để server trả về totalCount)
        api.get("/Users", { params: { PageSize: 1 } }),

        // 2. Lấy Tổng Công ty
        api.get("/Companies", { params: { PageSize: 1 } }),

        // 3. Lấy Tổng Báo cáo tài chính
        // (Nếu cần đếm báo cáo "Đã duyệt", thêm param Status: 'Approved' nếu API hỗ trợ)
        api.get("/FinancialReports", { params: { PageSize: 1 } }),

        // 4. Lấy 5 Nhật ký hoạt động mới nhất để hiển thị bảng
        api.get("/AuditLogs", {
          params: {
            PageSize: 5, // Chỉ lấy 5 dòng
            SortBy: "timestamp", // Sắp xếp theo trường 'timestamp' trong JSON
            IsDescending: true, // Mới nhất lên đầu
          },
        }),
      ]);

      // Trả về dữ liệu đã được map gọn gàng
      return {
        totalUsers: usersRes.data.totalCount || 0,
        totalCompanies: companiesRes.data.totalCount || 0,
        totalReports: reportsRes.data.totalCount || 0,
        recentLogs: logsRes.data.items || [],
      };
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
  },
};

export default dashboardService;
