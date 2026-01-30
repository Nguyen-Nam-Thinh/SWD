import authService from "../services/authService";

// Middleware kiểm tra quyền truy cập
class AuthMiddleware {
  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = authService.getUserData();
    return !!(token && user);
  }

  // Kiểm tra role của user
  hasRole(allowedRoles = []) {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return true; // Không yêu cầu role cụ thể
    }

    const user = authService.getUserData();
    if (!user || !user.role) {
      return false;
    }

    return allowedRoles.includes(user.role);
  }

  // Kiểm tra permission cho specific action
  canPerformAction(action) {
    const user = authService.getUserData();
    if (!user) return false;

    const permissions = {
      // Manager và Admin có thể approve/reject
      approve_report: ["Admin"],
      reject_report: ["Admin"],

      // Chỉ Admin có thể quản lý user
      manage_users: ["Admin"],
      create_user: ["Admin"],
      delete_user: ["Admin"],

      // Manager và Admin quản lý companies
      manage_companies: ["Admin"],

      // Staff có thể upload và draft
      upload_report: ["Staff", "Admin"],
      draft_report: ["Staff", "Admin"],

      // Manager và Admin quản lý metrics
      manage_metrics: ["Admin"],

      // Tất cả có thể xem
      view_reports: ["Staff", "Admin"],
      view_dashboard: ["Staff", "Admin"],
      view_audit_logs: ["Admin"],
    };

    const allowedRoles = permissions[action];
    if (!allowedRoles) {
      console.warn(`Unknown action: ${action}`);
      return false;
    }

    return allowedRoles.includes(user.role);
  }

  // Get current user
  getCurrentUser() {
    return authService.getUserData();
  }

  // Get user role
  getUserRole() {
    const user = authService.getUserData();
    return user?.role || null;
  }

  // Check if user is admin
  isAdmin() {
    return this.getUserRole() === "Admin";
  }

  // Check if user is staff
  isStaff() {
    return this.getUserRole() === "Staff";
  }

  // Middleware để attach user info vào request config
  attachUserInfo(config) {
    const user = this.getCurrentUser();
    if (user) {
      config.metadata = {
        ...config.metadata,
        userId: user.userId,
        username: user.username,
        role: user.role,
      };
    }
    return config;
  }

  // Validate permission cho API call
  validatePermission(config, requiredPermission) {
    if (!requiredPermission) return config;

    if (!this.canPerformAction(requiredPermission)) {
      throw new Error(
        `Bạn không có quyền thực hiện thao tác này (${requiredPermission})`,
      );
    }

    return config;
  }
}

export default new AuthMiddleware();
