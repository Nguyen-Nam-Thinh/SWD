import api from "./api";

const industryService = {
    getIndustries: async (params = {}) => {
        const response = await api.get("/industries", { params });
        return response.data;
    },
    getAllNoPaging: async () => {
        const response = await api.get("/industries/all");
        return response.data;
    },
    getIndustryById: async (id) => {
        const response = await api.get(`/industries/${id}`);
        return response.data;
    },
    createIndustry: async (data) => {
        const response = await api.post("/industries", data);
        return response.data;
    },
    updateIndustry: async (id, data) => {
        const response = await api.put(`/industries/${id}`, data);
        return response.data;
    },
    deleteIndustry: async (id) => {
        const response = await api.delete(`/industries/${id}`);
        return response.data;
    },
};

export default industryService;