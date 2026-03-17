import { Tag } from "antd";

const REPORT_STATUS_MAP = {
  PendingApproval: { color: "orange", label: "Chờ duyệt" },
  Approved: { color: "green", label: "Đã duyệt" },
  Rejected: { color: "red", label: "Từ chối" },
  Draft: { color: "blue", label: "Nháp" },
  PENDINGAPPROVAL: { color: "orange", label: "Chờ duyệt" },
  PENDING_APPROVAL: { color: "orange", label: "Chờ duyệt" },
  APPROVED: { color: "green", label: "Đã duyệt" },
  REJECTED: { color: "red", label: "Từ chối" },
  DRAFT: { color: "blue", label: "Nháp" },
};

const USER_STATUS_MAP = {
  Active: { color: "green", label: "Đang hoạt động" },
  Inactive: { color: "red", label: "Đã khóa" },
  ACTIVE: { color: "green", label: "Đang hoạt động" },
  INACTIVE: { color: "red", label: "Đã khóa" },
};

const ReportStatusTag = ({ status, type = "report" }) => {
  const map = type === "user" ? USER_STATUS_MAP : REPORT_STATUS_MAP;
  const config = map[status] || { color: "default", label: status || "-" };
  return <Tag color={config.color}>{config.label}</Tag>;
};

export default ReportStatusTag;
