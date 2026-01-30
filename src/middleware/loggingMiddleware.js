// Middleware để log tất cả requests và responses
class LoggingMiddleware {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Giữ tối đa 100 logs
  }

  // Log request
  logRequest(config) {
    const log = {
      type: "REQUEST",
      timestamp: new Date().toISOString(),
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: this.sanitizeHeaders(config.headers),
      data: config.data,
    };

    this.addLog(log);

    // Log ra console ở development mode
    if (import.meta.env.DEV) {
      console.log(`🔵 [REQUEST] ${log.method} ${log.url}`, {
        data: config.data,
        headers: log.headers,
      });
    }

    return config;
  }

  // Log response
  logResponse(response) {
    const log = {
      type: "RESPONSE",
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      data: response.data,
      duration: this.calculateDuration(response),
    };

    this.addLog(log);

    if (import.meta.env.DEV) {
      console.log(`🟢 [RESPONSE] ${log.status} ${log.method} ${log.url}`, {
        data: response.data,
        duration: `${log.duration}ms`,
      });
    }

    return response;
  }

  // Log error
  logError(error) {
    const log = {
      type: "ERROR",
      timestamp: new Date().toISOString(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    };

    this.addLog(log);

    if (import.meta.env.DEV) {
      console.error(
        `🔴 [ERROR] ${log.status || "NETWORK"} ${log.method} ${log.url}`,
        {
          message: error.message,
          data: error.response?.data,
        },
      );
    }

    return Promise.reject(error);
  }

  // Sanitize headers (ẩn sensitive data)
  sanitizeHeaders(headers) {
    if (!headers) return {};

    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = "Bearer ***";
    }
    return sanitized;
  }

  // Tính thời gian request
  calculateDuration(response) {
    if (response.config?.metadata?.startTime) {
      return Date.now() - response.config.metadata.startTime;
    }
    return 0;
  }

  // Thêm log vào mảng
  addLog(log) {
    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Xóa log cũ nhất
    }
  }

  // Lấy tất cả logs
  getLogs() {
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export default new LoggingMiddleware();
