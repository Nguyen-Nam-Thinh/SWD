import api from "./api";

const financialReportService = {
  // Lấy danh sách financial reports
  getFinancialReports: async (params = {}) => {
    const response = await api.get("/financial-reports", { params });
    return response.data;
  },

  // Lấy financial report theo ID
  getFinancialReportById: async (id) => {
    const response = await api.get(`/financial-reports/${id}`);
    return response.data;
  },

  // Lấy danh sách reports đã approved
  getApprovedReports: async (params = {}) => {
    const response = await api.get("/financial-reports", {
      params: {
        ...params,
        Status: "Approved",
      },
    });
    return response.data;
  },
};

export default financialReportService;
