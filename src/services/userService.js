import api from "./api";

const userService = {
  getUsers: async (params = {}) => {
    try {
      const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== null && v !== undefined && v !== "",
        ),
      );

      const response = await api.get("/Users", { params: cleanedParams });
      return response.data;
    } catch (error) {
      console.error("UserService: Get Users Failed", error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/Users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`UserService: Get User ${id} Failed`, error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/Users/me");
      return response.data;
    } catch (error) {
      console.error("UserService: Get Me Failed", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post("/Users", userData);
      return response.data;
    } catch (error) {
      console.error("UserService: Create User Failed", error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/Users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`UserService: Update User ${id} Failed`, error);
      throw error;
    }
  },

  updateUserStatus: async (id, statusPayload) => {
    try {
      const response = await api.patch(`/Users/${id}/status`, statusPayload);
      return response.data;
    } catch (error) {
      console.error(`UserService: Patch Status ${id} Failed`, error);
      throw error;
    }
  },
};

export default userService;
