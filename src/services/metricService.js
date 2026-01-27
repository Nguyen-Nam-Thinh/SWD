import api from "./api";

const metricService = {
  // Lấy tất cả metrics
  getMetrics: async (params = {}) => {
    const response = await api.get("/Metrics", { params });
    return response.data;
  },

  // Lấy metric theo ID
  getMetricById: async (id) => {
    const response = await api.get(`/Metrics/${id}`);
    return response.data;
  },

  // Tạo metric mới
  createMetric: async (metricData) => {
    const response = await api.post("/Metrics", metricData);
    return response.data;
  },

  // Cập nhật metric
  updateMetric: async (id, metricData) => {
    const response = await api.put(`/Metrics/${id}`, metricData);
    return response.data;
  },

  // Xóa metric
  deleteMetric: async (id) => {
    const response = await api.delete(`/Metrics/${id}`);
    return response.data;
  },
};

export default metricService;
