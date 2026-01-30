import axios from "axios";
import loggingMiddleware from "../middleware/loggingMiddleware";
import errorHandlerMiddleware from "../middleware/errorHandlerMiddleware";
import authMiddleware from "../middleware/authMiddleware";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware";
import auditMiddleware from "../middleware/auditMiddleware";

// Tạo axios instance với base URL từ env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Biến để track việc refresh token đang diễn ra
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============= REQUEST INTERCEPTORS =============

// 1. Timing interceptor (đo thời gian request)
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Rate limiting interceptor
api.interceptors.request.use(
  (config) => {
    try {
      return rateLimitMiddleware.checkRateLimit(config);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

// 3. Auth interceptor - thêm token và user info
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach user info vào metadata
    return authMiddleware.attachUserInfo(config);
  },
  (error) => Promise.reject(error),
);

// 4. Logging interceptor - log requests
api.interceptors.request.use(
  (config) => loggingMiddleware.logRequest(config),
  (error) => Promise.reject(error),
);

// ============= RESPONSE INTERCEPTORS =============

// 1. Logging interceptor - log responses
api.interceptors.response.use(
  (response) => {
    // Log audit trail
    auditMiddleware.logAudit(response.config, response);

    // Log response
    return loggingMiddleware.logResponse(response);
  },
  (error) => {
    // Log audit trail for errors
    auditMiddleware.logAudit(error.config, null, error);

    // Log error
    loggingMiddleware.logError(error);
    return Promise.reject(error);
  },
);

// 2. Token refresh interceptor - xử lý 401 và auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Không có refresh token, redirect về login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/Auth/refresh-token`,
          { refreshToken },
        );

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        // Lưu token mới
        localStorage.setItem("token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update header cho request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queue
        processQueue(null, newToken);

        // Retry request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, logout
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// 3. Error handler interceptor - xử lý và hiển thị lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => errorHandlerMiddleware.handleError(error),
);

// Cleanup rate limit records định kỳ (mỗi 5 phút)
setInterval(
  () => {
    rateLimitMiddleware.cleanup();
  },
  5 * 60 * 1000,
);

export default api;
