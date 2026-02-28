// src/services/reportService.js
import api from "./api";

const uploadReportService = {
  // Upload báo cáo (Multipart/form-data)
  uploadReport: async (formData) => {
    const response = await api.post("/financial-reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Lấy danh sách báo cáo (Giả định dựa trên hình GET /api/financial-reports)
  getReports: async (params = {}) => {
    const response = await api.get("/financial-reports", { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/financial-reports/${id}`);
    return response.data;
  },

  // API mới: Cập nhật trạng thái báo cáo
  updateReportStatus: async (id, targetStatus, reason = null) => {
    // PATCH /api/financial-reports/{id}/status
    // targetStatus: "PENDINGAPPROVAL", "APPROVED", "REJECTED"
    const payload = { targetStatus };
    if (reason) {
      payload.reason = reason; // Chỉ thêm reason khi REJECTED
    }
    const response = await api.patch(
      `/financial-reports/${id}/status`,
      payload,
    );
    return response.data;
  },

  // Cập nhật chi tiết báo cáo (gửi lại tất cả dữ liệu)
  updateReportDetails: async (id, details) => {
    // PUT /api/financial-reports/{id}
    // Body: [{ "metricCode": "string", "newvalue": 0 }]
    const payload = details.map((item) => ({
      metricCode: item.metricCode,
      newvalue: Number(item.finalValue || item.value || 0),
    }));
    const response = await api.put(`/financial-reports/${id}`, payload);
    return response.data;
  },

  // Xóa báo cáo
  deleteReport: async (id) => {
    const response = await api.delete(`/financial-reports/${id}`);
    return response.data;
  },

  getReportFile: async (id) => {
    const response = await api.get(`/financial-reports/${id}/file`, {
      responseType: "blob", // QUAN TRỌNG: Báo cho axios biết đây là file binary
    });
    return response.data; // Trả về Blob object
  },
};

export default uploadReportService;
