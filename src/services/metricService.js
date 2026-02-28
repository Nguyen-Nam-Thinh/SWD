import api from "./api";

const metricService = {
  getMetrics: async (params = {}) => {
    const response = await api.get("/metrics", { params });
    return response.data;
  },
  getMetricById: async (id) => {
    const response = await api.get(`/metrics/${id}`);
    return response.data;
  },
  createMetric: async (metricData) => {
    const response = await api.post("/metrics", metricData);
    return response.data;
  },
  updateMetric: async (id, metricData) => {
    const response = await api.put(`/metrics/${id}`, metricData);
    return response.data;
  },
  deleteMetric: async (id) => {
    const response = await api.delete(`/metrics/${id}`);
    return response.data;
  },
};

export default metricService;