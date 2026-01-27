import api from "./api";

const financialReportService = {
  // Lấy danh sách financial reports
  getFinancialReports: async (params = {}) => {
    const response = await api.get("/FinancialReports", { params });
    return response.data;
  },

  // Lấy financial report theo ID
  getFinancialReportById: async (id) => {
    const response = await api.get(`/FinancialReports/${id}`);
    return response.data;
  },

  // Lấy danh sách reports đã approved
  getApprovedReports: async (params = {}) => {
    const response = await api.get("/FinancialReports", {
      params: {
        ...params,
        Status: "Approved",
      },
    });
    return response.data;
  },
};

export default financialReportService;
