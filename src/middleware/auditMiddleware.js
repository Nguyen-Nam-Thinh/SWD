import authService from "../services/authService";

// Middleware để log các hành động quan trọng (audit trail)
class AuditMiddleware {
  constructor() {
    this.auditLogs = [];
    this.maxLogs = 500;

    // Các actions cần audit
    this.auditableActions = [
      "/financial-reports/.*/status",
      "/financial-reports",
      "/financial-reports/.*/delete",
      "/Users/.*/delete",
      "/Auth/login",
      "/Companies/.*/(delete)",
      "/Metrics/.*/(delete)",
    ];
  }

  // Kiểm tra xem có cần audit action này không
  shouldAudit(config) {
    // Kiểm tra config tồn tại
    if (!config) {
      return false;
    }

    const url = config.url || "";
    return this.auditableActions.some((pattern) => {
      const regex = new RegExp(pattern);
      return regex.test(url);
    });
  }

  // Log audit trail
  logAudit(config, response = null, error = null) {
    // Kiểm tra config tồn tại trước khi audit
    if (!config || !this.shouldAudit(config)) {
      return;
    }

    const user = authService.getUserData();
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      user: user
        ? {
            userId: user.userId,
            username: user.username,
            role: user.role,
          }
        : null,
      action: this.extractAction(config),
      method: config.method?.toUpperCase(),
      url: config.url,
      requestData: this.sanitizeData(config.data),
      responseStatus: response?.status,
      responseData: this.sanitizeData(response?.data),
      error: error
        ? {
            status: error.response?.status,
            message: error.message,
          }
        : null,
      success: !!response && !error,
      ipAddress: this.getClientIp(), // Optional
      userAgent: navigator.userAgent,
    };

    this.addAuditLog(auditLog);

    // Log ra console trong development
    if (import.meta.env.DEV) {
      console.log("📝 [AUDIT]", auditLog);
    }

    // Có thể gửi lên server để lưu vào database
    this.sendAuditToServer(auditLog);
  }

  // Extract action name từ config
  extractAction(config) {
    const url = config.url || "";
    const method = config.method?.toUpperCase() || "";

    if (url.includes("/approve")) return "APPROVE_REPORT";
    if (url.includes("/reject")) return "REJECT_REPORT";
    if (url.includes("/submit")) return "SUBMIT_REPORT";
    if (url.includes("/upload")) return "UPLOAD_REPORT";
    if (url.includes("/login")) return "LOGIN";
    if (method === "DELETE" && url.includes("/FinancialReports"))
      return "DELETE_REPORT";
    if (method === "DELETE" && url.includes("/Users")) return "DELETE_USER";
    if (method === "DELETE" && url.includes("/Companies"))
      return "DELETE_COMPANY";
    if (method === "DELETE" && url.includes("/Metrics")) return "DELETE_METRIC";

    return `${method}_${url}`;
  }

  // Sanitize sensitive data
  sanitizeData(data) {
    if (!data) return null;

    // Clone để không modify original
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields
    const sensitiveFields = [
      "password",
      "token",
      "refreshToken",
      "authorization",
    ];
    const removeSensitive = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;

      for (const key in obj) {
        if (
          sensitiveFields.some((field) => key.toLowerCase().includes(field))
        ) {
          obj[key] = "***";
        } else if (typeof obj[key] === "object") {
          removeSensitive(obj[key]);
        }
      }
      return obj;
    };

    return removeSensitive(sanitized);
  }

  // Generate unique audit ID
  generateAuditId() {
    return `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get client IP (có thể cần API hỗ trợ)
  getClientIp() {
    // Browser không thể trực tiếp lấy IP, cần API
    return "N/A";
  }

  // Thêm audit log
  addAuditLog(log) {
    this.auditLogs.push(log);
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs.shift();
    }

    // Lưu vào localStorage để persist
    this.saveToLocalStorage();
  }

  // Gửi audit log lên server
  async sendAuditToServer(auditLog) {
    // TODO: Implement sending audit log to backend
    // Tạm thời disable để tránh lỗi tuần hoàn khi gọi API từ middleware
    // Chỉ gửi trong production và cho critical actions
    return; // Disable for now to prevent circular errors

    // if (import.meta.env.PROD && this.isCriticalAction(auditLog.action)) {
    //   try {
    //     // await api.post('/AuditLogs', auditLog);
    //   } catch (error) {
    //     console.error("Failed to send audit log:", error);
    //   }
    // }
  }

  // Check if action is critical
  isCriticalAction(action) {
    const criticalActions = [
      "APPROVE_REPORT",
      "REJECT_REPORT",
      "DELETE_REPORT",
      "DELETE_USER",
      "DELETE_COMPANY",
    ];
    return criticalActions.includes(action);
  }

  // Save to localStorage
  saveToLocalStorage() {
    try {
      const recentLogs = this.auditLogs.slice(-50); // Chỉ lưu 50 logs gần nhất
      localStorage.setItem("auditLogs", JSON.stringify(recentLogs));
    } catch (error) {
      console.warn("Failed to save audit logs to localStorage:", error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const logs = localStorage.getItem("auditLogs");
      if (logs) {
        this.auditLogs = JSON.parse(logs);
      }
    } catch (error) {
      console.warn("Failed to load audit logs from localStorage:", error);
    }
  }

  // Get all audit logs
  getAuditLogs() {
    return this.auditLogs;
  }

  // Clear audit logs
  clearAuditLogs() {
    this.auditLogs = [];
    localStorage.removeItem("auditLogs");
  }

  // Export audit logs
  exportAuditLogs() {
    return JSON.stringify(this.auditLogs, null, 2);
  }
}

export default new AuditMiddleware();
