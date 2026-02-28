import React, { useState } from "react";
import { Table, Button, Tag, Space, Tooltip, Switch } from "antd";
import { EditOutlined, DeleteOutlined, CalculatorOutlined } from "@ant-design/icons";

const MetricsTable = ({ metrics, loading, pagination, onTableChange, onEdit, onDelete }) => {
  // State để quản lý ngôn ngữ hiển thị: false = Tiếng Việt, true = Tiếng Anh
  const [isEnglish, setIsEnglish] = useState(false);

  const columns = [
    {
      // CHỈNH SỬA 1: Bỏ ép căn giữa, để tiêu đề tự nhiên bên trái khớp với Tag. Set width vừa đủ.
      title: "Mã Metric",
      dataIndex: "metricCode",
      key: "metricCode",
      width: 130, // Rộng vừa đủ
      render: (text) => <Tag color="blue" className="font-mono font-bold">{text}</Tag>,
    },
    {
      // Giữ nguyên
      title: (
        <div className="flex items-center justify-center gap-2">
          <span>Tên Metric</span>
          <Switch
            checkedChildren="EN"
            unCheckedChildren="VN"
            checked={isEnglish}
            onChange={(checked) => setIsEnglish(checked)}
            size="small"
            className="bg-gray-300"
          />
        </div>
      ),
      key: "metricName",
      render: (_, record) => {
        const nameVi = record.metricNameVi || record.metricName || "(Chưa có tên VN)";
        const nameEn = record.metricNameEn || "(Chưa có tên EN)";

        return (
          <div>
            <div className="font-semibold text-gray-800">
              {isEnglish ? nameEn : nameVi}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {isEnglish ? nameVi : nameEn}
            </div>
          </div>
        );
      },
    },
    {
      // Giữ nguyên: Chỉ căn giữa tiêu đề, nội dung căn trái, đẩy các cột sau ra xa
      title: <div className="text-center">Nhóm</div>,
      key: "groupName",
      width: 300,
      render: (_, record) => {
        const name = record.group?.groupName || record.groupName || record.group || "";
        return name ? <Tag>{name}</Tag> : "-";
      }
    },
    {
      // CHỈNH SỬA 2: Dùng align: 'center' để căn giữa cả tiêu đề VÀ nội dung (Tag)
      title: "Đơn Vị",
      dataIndex: "unit",
      key: "unit",
      width: 150,
      align: 'center',
      render: (text) => text ? <Tag color="green">{text}</Tag> : "-",
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
              <Tag icon={<CalculatorOutlined />} color="purple">Công thức</Tag>
            </Tooltip>
          );
        }
        return <Tag color="green">Nhập tay</Tag>;
      }
    },
    {
      // Giữ nguyên: Chỉ căn giữa tiêu đề
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
      align: 'center',
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
      pagination={pagination}
      onChange={onTableChange}
    />
  );
};

export default MetricsTable;