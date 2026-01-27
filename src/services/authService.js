import api from "./api";

const authService = {
  // Đăng nhập
  login: async (username, password) => {
    const response = await api.post("/Auth/login", {
      username,
      password,
    });
    return response.data;
  },

  // Lưu thông tin user và token vào localStorage
  saveUserData: (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("refreshToken", userData.refreshToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: userData.userId,
        username: userData.username,
        fullName: userData.fullName,
        role: userData.role,
      }),
    );
  },

  // Lấy thông tin user từ localStorage
  getUserData: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Refresh token khi token hết hạn
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post("/Auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

export default authService;
