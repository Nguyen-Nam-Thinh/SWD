import { message } from "antd";

// Middleware xử lý error responses
class ErrorHandlerMiddleware {
  // Map error codes thành messages thân thiện
  errorMessages = {
    400: "Yêu cầu không hợp lệ",
    401: "Phiên đăng nhập đã hết hạn",
    403: "Bạn không có quyền thực hiện thao tác này",
    404: "Không tìm thấy dữ liệu",
    409: "Dữ liệu đã tồn tại",
    422: "Dữ liệu không hợp lệ",
    500: "Lỗi hệ thống, vui lòng thử lại sau",
    502: "Không thể kết nối đến server",
    503: "Hệ thống đang bảo trì",
  };

  // Xử lý error response
  handleError(error) {
    // Network error (không có response từ server)
    if (!error.response) {
      if (error.code === "ERR_NETWORK") {
        message.error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        );
      } else if (error.code === "ECONNABORTED") {
        message.error("Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.");
      } else {
        message.error("Lỗi kết nối. Vui lòng thử lại.");
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Lấy error message từ response hoặc dùng default
    let errorMessage = this.errorMessages[status] || "Có lỗi xảy ra";

    // Ưu tiên message từ server nếu có
    if (data?.message) {
      errorMessage = data.message;
    } else if (data?.error) {
      errorMessage = data.error;
    } else if (data?.errors && Array.isArray(data.errors)) {
      // Validation errors từ .NET API
      errorMessage = data.errors.join(", ");
    } else if (typeof data === "string") {
      errorMessage = data;
    }

    // Hiển thị error message (trừ 401 vì đã xử lý ở interceptor)
    if (status !== 401) {
      message.error(errorMessage);
    }

    // Log chi tiết error
    this.logError(error, errorMessage);

    return Promise.reject(error);
  }

  // Log error details
  logError(error, displayMessage) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: displayMessage,
      data: error.response?.data,
      config: error.config,
    };

    if (import.meta.env.DEV) {
      console.error("❌ Error Details:", errorLog);
    }

    // Có thể gửi error log lên server hoặc external logging service
    this.sendErrorToMonitoring(errorLog);
  }

  // Gửi error lên monitoring service (optional)
  sendErrorToMonitoring(errorLog) {
    // TODO: Implement sending to monitoring service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(errorLog);
    // }
  }

  // Xử lý specific business errors
  handleBusinessError(code, defaultMessage) {
    const businessErrors = {
      REPORT_ALREADY_APPROVED: "Báo cáo đã được duyệt trước đó",
      REPORT_ALREADY_REJECTED: "Báo cáo đã bị từ chối",
      INSUFFICIENT_PERMISSION: "Bạn không có quyền thực hiện thao tác này",
      INVALID_REPORT_STATUS: "Trạng thái báo cáo không hợp lệ",
      DUPLICATE_METRIC: "Chỉ số đã tồn tại",
      COMPANY_NOT_FOUND: "Không tìm thấy công ty",
    };

    return businessErrors[code] || defaultMessage;
  }
}

export default new ErrorHandlerMiddleware();
