// src/pages/ValidationConfig.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Switch, message, Popconfirm, Space, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getFormulas,
  createFormula,
  updateFormula,
  deleteFormula
} from "../services/formulaService";
import FormulaModal from "../components/Formulas/FormulaModal";

const ValidationConfig = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State quản lý Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // null = mode Create, object = mode Edit
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getFormulas();
      setData(result);
    } catch (error) {
      message.error("Lỗi khi tải danh sách công thức!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Xử lý mở Modal (Thêm hoặc Sửa)
  const handleOpenModal = (record = null) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  // 3. Xử lý Submit Form (Create hoặc Update)
  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingRecord) {
        // --- LOGIC UPDATE ---
        const updateData = {
          formulaName: values.formulaName,
          expression: values.expression,
          tolerance: values.tolerance,
          isActive: values.isActive
        };
        await updateFormula(editingRecord.id, updateData);
        message.success("Cập nhật thành công!");
      } else {
        // --- LOGIC CREATE ---
        await createFormula(values);
        message.success("Tạo mới thành công!");
      }
      setModalVisible(false);
      fetchData(); // Reload lại bảng
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = async (id) => {
    try {
      await deleteFormula(id);
      message.success("Đã xóa công thức!");
      fetchData();
    } catch (error) {
      message.error("Không thể xóa bản ghi này!");
    }
  };

  // 5. Xử lý Toggle Switch nhanh trên bảng
  const handleToggleActive = async (record, checked) => {
    try {
      // Vì API Update yêu cầu gửi cả cục object UpdateFormulaRequest
      // Nên ta phải lấy thông tin hiện tại map vào, chỉ thay đổi isActive
      const updateData = {
        formulaName: record.formulaName,
        expression: record.expression,
        tolerance: record.tolerance,
        isActive: checked // Giá trị mới
      };

      // Gọi API Update (chúng ta update UI lạc quan hoặc chờ API xong mới reload)
      await updateFormula(record.id, updateData);
      message.success(`Đã ${checked ? "bật" : "tắt"} công thức!`);
      fetchData(); // Reload để đồng bộ
    } catch (error) {
      message.error("Lỗi cập nhật trạng thái!");
    }
  };

  // Cấu hình cột
  const columns = [
    {
      title: "Tên quy tắc",
      dataIndex: "formulaName",
      key: "formulaName",
      width: "20%",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-400">{record.targetMetricCode}</div>
        </div>
      )
    },
    {
      title: "Biểu thức kiểm tra",
      dataIndex: "expression",
      key: "expression",
      render: (text) => (
        <code className="bg-slate-100 px-2 py-1 rounded text-red-500 font-mono border border-slate-200 block w-fit">
          {text}
        </code>
      ),
    },
    {
      title: "Sai số",
      dataIndex: "tolerance",
      key: "tolerance",
      width: 100,
      align: 'center'
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleActive(record, checked)}
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-500" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" icon={<DeleteOutlined className="text-red-500" />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Cấu hình Validation</h2>
          <p className="text-gray-500 text-sm">
            Thiết lập các công thức toán học để kiểm tra tính đúng đắn của báo cáo.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal(null)} // null -> Mode Create
        >
          Thêm công thức
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Component Modal tách rời */}
      <FormulaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingRecord} // Truyền dữ liệu cũ vào form nếu là Edit
        loading={submitting}
      />
    </div>
  );
};

export default ValidationConfig;