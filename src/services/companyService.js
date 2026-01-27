import api from "./api";

const companyService = {
  // Lấy danh sách công ty với pagination và filter
  getCompanies: async (params = {}) => {
    const {
      ticker,
      companyName,
      industryCode,
      stockExchange,
      website,
      pageNumber = 1,
      pageSize = 10,
      searchTerm,
      sortBy,
      isDescending = false,
    } = params;

    const response = await api.get("/Companies", {
      params: {
        Ticker: ticker,
        IndustryCode: industryCode,
        StockExchange: stockExchange,
        Website: website,
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: searchTerm,
        SortBy: sortBy,
        IsDescending: isDescending,
      },
    });
    return response.data;
  },

  // Lấy chi tiết 1 công ty
  getCompanyById: async (id) => {
    const response = await api.get(`/Companies/${id}`);
    return response.data;
  },

  // Tạo công ty mới
  createCompany: async (companyData) => {
    const response = await api.post("/Companies", {
      ticker: companyData.ticker,
      companyName: companyData.companyName,
      industryCode: companyData.industryCode,
      stockExchange: companyData.stockExchange,
      website: companyData.website,
      description: companyData.description,
    });
    return response.data;
  },

  // Cập nhật công ty
  updateCompany: async (id, companyData) => {
    const response = await api.put(`/Companies/${id}`, {
      ticker: companyData.ticker,
      companyName: companyData.companyName,
      industryCode: companyData.industryCode,
      stockExchange: companyData.stockExchange,
      website: companyData.website,
      description: companyData.description,
    });
    return response.data;
  },

  // Xóa công ty
  deleteCompany: async (id) => {
    const response = await api.delete(`/Companies/${id}`);
    return response.data;
  },
};

export default companyService;
