import api from "./api";

const companyService = {
  getCompanies: async (params = {}) => {
    const response = await api.get("/companies", { params });
    return response.data;
  },
  getCompanyById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
  createCompany: async (companyData) => {
    const response = await api.post("/companies", {
      ticker: companyData.ticker,
      companyName: companyData.companyName,
      industryId: companyData.industryId, // SỬA Ở ĐÂY
      stockExchange: companyData.stockExchange,
      website: companyData.website,
      description: companyData.description,
    });
    return response.data;
  },
  updateCompany: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, {
      ticker: companyData.ticker,
      companyName: companyData.companyName,
      industryId: companyData.industryId, // SỬA Ở ĐÂY
      stockExchange: companyData.stockExchange,
      website: companyData.website,
      description: companyData.description,
    });
    return response.data;
  },
  deleteCompany: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

export default companyService;