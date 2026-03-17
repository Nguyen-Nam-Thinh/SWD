import React from "react";
import { Table, Button, Tag, Space, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";

const MetricsTable = ({
  metrics,
  metricGroups,
  loading,
  pagination,
  onTableChange,
  onEdit,
  onDelete,
}) => {
  const groupNameMap = new Map(
    (metricGroups || []).map((group) => [
      String(group.id),
      group.groupNameVi || group.nameVi || group.groupName || "-",
    ]),
  );

  const formatVietnameseGroupName = (name) => {
    if (!name) return "-";
    // Bỏ phần trong ngoặc nếu chứa ký tự tiếng Anh, ví dụ: (Income Statement)
    return name
      .replace(/\s*\((?=[^)]*[A-Za-z])[^)]*\)\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        ((pagination?.current || 1) - 1) * (pagination?.pageSize || 10) +
        index +
        1,
    },
    {
      title: "Mã chỉ số",
      dataIndex: "metricCode",
      key: "metricCode",
      width: 120,
      render: (text) => (
        <span className="text-sm text-gray-700">{text || "-"}</span>
      ),
    },
    {
      title: "Tên chỉ số",
      key: "metricName",
      width: 360,
      render: (_, record) => {
        const name = record.metricNameVi || record.metricName || "-";

        return (
          <div
            className="font-semibold text-gray-800 leading-5"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={name}
          >
            {name}
          </div>
        );
      },
    },
    {
      title: <div className="text-center">Nhóm</div>,
      key: "groupName",
      width: 170,
      render: (_, record) => {
        const groupId =
          record.groupId || record.group?.id || record.metricGroupId;
        const nameFromMap = groupId ? groupNameMap.get(String(groupId)) : null;
        const name =
          nameFromMap ||
          record.group?.groupNameVi ||
          record.groupNameVi ||
          record.group?.groupName ||
          record.groupName ||
          record.group?.nameVi ||
          "";
        const displayName = formatVietnameseGroupName(name);
        return displayName && displayName !== "-" ? (
          <Tag>{displayName}</Tag>
        ) : (
          "-"
        );
      },
    },
    {
      // CHỈNH SỬA 2: Dùng align: 'center' để căn giữa cả tiêu đề VÀ nội dung (Tag)
      title: "Đơn Vị",
      dataIndex: "unit",
      key: "unit",
      width: 150,
      align: "center",
      render: (text) => (text ? <Tag color="green">{text}</Tag> : "-"),
    },
    {
      // CHỈNH SỬA 3: Bỏ ép căn giữa, để tiêu đề tự nhiên bên trái khớp với Tag. Set width vừa đủ.
      title: "Kiểu Dữ Liệu",
      key: "type",
      width: 160, // Rộng vừa đủ cho chữ "Nhập tay" hoặc "Công thức"
      render: (_, record) => {
        if (record.isAutoCalculated) {
          return (
            <Tooltip title={record.formula}>
              <Tag icon={<CalculatorOutlined />} color="purple">
                Công thức
              </Tag>
            </Tooltip>
          );
        }
        return <Tag color="green">Nhập tay</Tag>;
      },
    },
    {
      title: <div className="text-center">Mô Tả</div>,
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      // Dùng chuẩn align: 'center' thay vì CSS
      title: "Hành động",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600"
            onClick={() => onEdit(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={metrics}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
        showTotal: (total) => `Tổng ${total} chỉ số`,
      }}
      {...(onTableChange ? { onChange: onTableChange } : {})}
    />
  );
};

export default MetricsTable;
