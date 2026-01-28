// src/services/reportService.js
import api from "./api";

const uploadReportService = {
  // Upload báo cáo (Multipart/form-data)
  uploadReport: async (formData) => {
    const response = await api.post("/FinancialReports/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Lấy danh sách báo cáo (Giả định dựa trên hình GET /api/FinancialReports)
  getReports: async (params = {}) => {
    const response = await api.get("/FinancialReports", { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/FinancialReports/${id}`);
    return response.data;
  },

  saveDraftDetails: async (id, items) => {
    // Map dữ liệu thành mảng
    const payload = items.map((item) => ({
      metricCode: item.metricCode, // Chuỗi
      newValue: Number(item.finalValue) || 0, // Ép sang Số (tránh gửi string "500")
    }));

    // Gửi Array trực tiếp: [ {...}, {...} ]
    const response = await api.put(`/FinancialReports/${id}/details`, payload);
    return response.data;
  },

  submitForApproval: async (id) => {
    // API: POST /api/FinancialReports/{id}/submit
    const response = await api.post(`/FinancialReports/${id}/submit`);
    return response.data;
  },

  // Xóa báo cáo
  deleteReport: async (id) => {
    const response = await api.delete(`/FinancialReports/${id}`);
    return response.data;
  },
  getReportFile: async (id) => {
    const response = await api.get(`/FinancialReports/${id}/file`, {
      responseType: "blob", // QUAN TRỌNG: Báo cho axios biết đây là file binary
    });
    return response.data; // Trả về Blob object
  },
  approveReport: async (id) => {
    const response = await api.post(`/FinancialReports/${id}/approve`);
    return response.data;
  },

  // 2. Từ chối báo cáo (POST /reject - Có lý do)
  rejectReport: async (id, reason) => {
    // Body: { "reason": "string" }
    const response = await api.post(`/FinancialReports/${id}/reject`, {
      reason,
    });
    return response.data;
  },
};

export default uploadReportService;
