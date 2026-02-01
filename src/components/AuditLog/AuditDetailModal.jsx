// src/components/AuditDetailModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const AuditDetailModal = ({ visible, onClose, record }) => {
  const [diffData, setDiffData] = useState([]);

  useEffect(() => {
    if (record) {
      try {
        const oldObj = record.oldValue ? JSON.parse(record.oldValue) : {};
        const newObj = record.newValue ? JSON.parse(record.newValue) : {};

        // Lấy tất cả các key xuất hiện ở cả cũ và mới
        const allKeys = Array.from(
          new Set([...Object.keys(oldObj), ...Object.keys(newObj)]),
        );

        // Tạo dữ liệu so sánh
        const processedData = allKeys.map((key) => ({
          key: key,
          field: key,
          oldVal: oldObj[key],
          newVal: newObj[key],
          isChanged: oldObj[key] !== newObj[key],
        }));

        setDiffData(processedData);
      } catch (e) {
        setDiffData([]);
      }
    }
  }, [record]);

  const columns = [
    {
      title: "Trường thông tin",
      dataIndex: "field",
      key: "field",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Giá trị cũ",
      dataIndex: "oldVal",
      key: "oldVal",
      render: (text) => (
        <div className="break-words whitespace-normal">
          {text === null || text === undefined ? (
            <Text type="secondary" italic>
              (Trống)
            </Text>
          ) : (
            String(text)
          )}
        </div>
      ),
      width: "35%",
    },
    {
      title: "Giá trị mới",
      dataIndex: "newVal",
      key: "newVal",
      render: (text, row) => (
        <div className="break-words whitespace-normal">
          <Text
            type={row.isChanged ? "success" : "default"}
            strong={row.isChanged}
          >
            {text === null || text === undefined ? (
              <Text type="secondary" italic>
                (Đã xóa)
              </Text>
            ) : (
              String(text)
            )}
          </Text>
        </div>
      ),
      width: "35%",
    },
  ];

  return (
    <Modal
      title={`Chi tiết thay đổi - ${record?.actionType || "N/A"}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      <div className="mb-4">
        <p>
          <strong>Người thực hiện:</strong> {record?.username}
        </p>
        <p>
          <strong>Thời gian:</strong>{" "}
          {record?.timestamp
            ? dayjs(record.timestamp).format("DD/MM/YYYY HH:mm:ss")
            : ""}
        </p>
        <p>
          <strong>Đối tượng:</strong> {record?.description}
        </p>
      </div>

      <Table
        dataSource={diffData}
        columns={columns}
        pagination={false}
        bordered
        size="small"
        rowClassName={(record) => (record.isChanged ? "bg-green-50" : "")}
      />
    </Modal>
  );
};

export default AuditDetailModal;
