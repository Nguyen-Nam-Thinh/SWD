import api from "./api";

const metricGroupService = {
    getMetricGroups: async (params = {}) => {
        const response = await api.get("/metric-groups", { params });
        return response.data;
    },
    getAllNoPaging: async () => {
        const response = await api.get("/metric-groups/all");
        return response.data;
    },
    getMetricGroupById: async (id) => {
        const response = await api.get(`/metric-groups/${id}`);
        return response.data;
    },
    createMetricGroup: async (data) => {
        const response = await api.post("/metric-groups", data);
        return response.data;
    },
    updateMetricGroup: async (id, data) => {
        const response = await api.put(`/metric-groups/${id}`, data);
        return response.data;
    },
    deleteMetricGroup: async (id) => {
        const response = await api.delete(`/metric-groups/${id}`);
        return response.data;
    },
};

export default metricGroupService;