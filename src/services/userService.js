import api from "./api";

const userService = {
  // =================================================================
  // 1. QUERY (Đọc dữ liệu)
  // =================================================================

  /**
   * GET /api/Users
   * Lấy danh sách User (Paging, Filter, Search, Sort)
   */
  getUsers: async (params = {}) => {
    try {
      // Làm sạch params (xóa null/undefined/empty string)
      const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== null && v !== undefined && v !== "",
        ),
      );

      const response = await api.get("/Users", { params: cleanedParams });
      return response.data; // Trả về { items: [...], totalCount: ... }
    } catch (error) {
      console.error("UserService: Get Users Failed", error);
      throw error;
    }
  },

  /**
   * GET /api/Users/{id}
   * Lấy chi tiết 1 user theo ID
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/Users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`UserService: Get User ${id} Failed`, error);
      throw error;
    }
  },

  /**
   * GET /api/Users/me
   * Lấy thông tin user đang đăng nhập hiện tại
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/Users/me");
      return response.data;
    } catch (error) {
      console.error("UserService: Get Me Failed", error);
      throw error;
    }
  },

  // =================================================================
  // 2. COMMAND (Ghi dữ liệu)
  // =================================================================

  /**
   * POST /api/Users
   * Tạo mới User
   */
  createUser: async (userData) => {
    try {
      const response = await api.post("/Users", userData);
      return response.data;
    } catch (error) {
      console.error("UserService: Create User Failed", error);
      throw error;
    }
  },

  /**
   * PUT /api/Users/{id}
   * Cập nhật thông tin User
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/Users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`UserService: Update User ${id} Failed`, error);
      throw error;
    }
  },

  /**
   * PATCH /api/Users/{id}/status
   * Cập nhật trạng thái Active/Inactive
   * (API này dùng Method PATCH như trong hình bạn gửi)
   * @param {string} id - ID User
   * @param {boolean} isActive - Trạng thái mới (hoặc object tùy backend yêu cầu)
   */
  updateUserStatus: async (id, statusPayload) => {
    try {
      // Lưu ý: Kiểm tra lại Swagger xem Body gửi lên là { isActive: true } hay chỉ true
      // Giả định body là object JSON:
      const response = await api.patch(`/Users/${id}/status`, statusPayload);
      return response.data;
    } catch (error) {
      console.error(`UserService: Patch Status ${id} Failed`, error);
      throw error;
    }
  },
};

export default userService;
