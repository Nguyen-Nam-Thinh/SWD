import api from "./api";

const dashboardService = {
  getDashboardStats: async () => {
    try {
      const [usersRes, companiesRes, reportsRes, logsRes] = await Promise.all([
        api.get("/Users", { params: { PageSize: 1 } }),

        api.get("/Companies", { params: { PageSize: 1 } }),

        api.get("/FinancialReports", { params: { PageSize: 1 } }),

        api.get("/AuditLogs", {
          params: {
            PageSize: 5,
            SortBy: "timestamp",
            IsDescending: true,
          },
        }),
      ]);

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
