import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authMiddleware } from "../middleware";
import { message } from "antd";

/**
 * Hook để kiểm tra permission cho component
 * @param {string|string[]} requiredPermission - Permission hoặc danh sách permissions yêu cầu
 * @param {boolean} redirectOnFail - Redirect về trang home nếu không có quyền (default: true)
 * @returns {boolean} - true nếu có quyền, false nếu không
 */
export const usePermission = (requiredPermission, redirectOnFail = true) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra authentication
    if (!authMiddleware.isAuthenticated()) {
      message.error("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }

    // Kiểm tra permission
    if (requiredPermission) {
      const permissions = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission];

      const hasPermission = permissions.some((perm) =>
        authMiddleware.canPerformAction(perm),
      );

      if (!hasPermission && redirectOnFail) {
        message.error("Bạn không có quyền truy cập trang này");
        navigate("/");
      }
    }
  }, [requiredPermission, redirectOnFail, navigate]);

  if (!requiredPermission) return true;

  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  return permissions.some((perm) => authMiddleware.canPerformAction(perm));
};

/**
 * Hook để lấy thông tin user hiện tại
 * @returns {object|null} - User data hoặc null nếu chưa đăng nhập
 */
export const useCurrentUser = () => {
  return authMiddleware.getCurrentUser();
};

/**
 * Hook để kiểm tra role của user
 * @param {string|string[]} allowedRoles - Role hoặc danh sách roles được phép
 * @returns {boolean} - true nếu user có role phù hợp
 */
export const useRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return authMiddleware.hasRole(roles);
};

/**
 * HOC để protect component với permission check
 * @param {React.Component} Component - Component cần protect
 * @param {string|string[]} requiredPermission - Permission yêu cầu
 * @returns {React.Component} - Protected component
 */
export const withPermission = (Component, requiredPermission) => {
  const WrappedComponent = (props) => {
    const hasPermission = usePermission(requiredPermission);

    if (!hasPermission) {
      return null;
    }

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

/**
 * HOC để protect component với role check
 * @param {React.Component} Component - Component cần protect
 * @param {string|string[]} allowedRoles - Roles được phép
 * @returns {React.Component} - Protected component
 */
export const withRole = (Component, allowedRoles) => {
  const WrappedComponent = (props) => {
    const hasRole = useRole(allowedRoles);
    const navigate = useNavigate();

    useEffect(() => {
      if (!authMiddleware.isAuthenticated()) {
        message.error("Vui lòng đăng nhập để tiếp tục");
        navigate("/login");
      } else if (!hasRole) {
        message.error("Bạn không có quyền truy cập trang này");
        navigate("/");
      }
    }, [hasRole, navigate]);

    if (!hasRole) {
      return null;
    }

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withRole(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};
