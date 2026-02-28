// src/services/analysisService.js
import api from "./api";

const analysisService = {
  // Phân tích báo cáo với AI
  analyzeReports: async (data) => {
    // POST /api/analysis-reports
    // Body: { companyId, reportIds[], metricCodes[], userPrompt }
    // Timeout: 3 minutes (AI analysis takes time)
    const response = await api.post(
      "/analysis-reports",
      {
        companyId: data.companyId,
        reportIds: data.reportIds,
        metricCodes: data.metricCodes,
        userPrompt: data.userPrompt,
      },
      {
        timeout: 180000, // 3 minutes for AI analysis
      },
    );
    return response.data;
  },

  // Lấy lịch sử phân tích (nếu có)
  getAnalysisHistory: async (params = {}) => {
    const response = await api.get("/analysis-reports", { params });
    return response.data;
  },

  // Lấy chi tiết phân tích theo ID
  getAnalysisById: async (id) => {
    const response = await api.get(`/analysis-reports/${id}`);
    return response.data;
  },
};

export default analysisService;
