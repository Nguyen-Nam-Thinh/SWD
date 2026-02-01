// src/pages/ValidationConfig.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Switch,
  message,
  Popconfirm,
  Space,
  Tooltip,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Edit, Trash2 } from "lucide-react";
import {
  getFormulas,
  createFormula,
  updateFormula,
  deleteFormula,
} from "../services/formulaService";
import FormulaModal from "../components/Formulas/FormulaModal";
import ResponsiveTable from "../components/ResponsiveTable";

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
          isActive: values.isActive,
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
        isActive: checked, // Giá trị mới
      };

      // Gọi API Update (chúng ta update UI lạc quan hoặc chờ API xong mới reload)
      await updateFormula(record.id, updateData);
      message.success(`Đã ${checked ? "bật" : "tắt"} công thức!`);
      fetchData(); // Reload để đồng bộ
    } catch (error) {
      message.error("Lỗi cập nhật trạng thái!");
    }
  };

  // Render mobile actions
  const renderMobileActions = (record) => (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-600">
          Trạng thái:
        </span>
        <Switch
          size="small"
          checked={record.isActive}
          onChange={(checked) => {
            handleToggleActive(record, checked);
          }}
          onClick={(checked, e) => e.stopPropagation()}
        />
      </div>
      <Button
        size="small"
        icon={<Edit size={14} />}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal(record);
        }}
        className="flex items-center gap-1 text-blue-600"
      >
        Sửa
      </Button>
      <div onClick={(e) => e.stopPropagation()}>
        <Popconfirm
          title="Bạn có chắc muốn xóa?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            size="small"
            danger
            icon={<Trash2 size={14} />}
            className="flex items-center gap-1"
          >
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  // Cấu hình cột
  const columns = [
    {
      title: "Tên quy tắc",
      label: "Tên quy tắc",
      dataIndex: "formulaName",
      key: "formulaName",
      width: "20%",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-400">{record.targetMetricCode}</div>
        </div>
      ),
    },
    {
      title: "Biểu thức kiểm tra",
      label: "Biểu thức",
      dataIndex: "expression",
      key: "expression",
      render: (text) => (
        <code className="bg-slate-100 px-1 md:px-2 py-1 rounded text-red-500 font-mono text-xs border border-slate-200 block w-fit break-all">
          {text}
        </code>
      ),
    },
    {
      title: "Sai số",
      label: "Sai số",
      dataIndex: "tolerance",
      key: "tolerance",
      width: 100,
      align: "center",
    },
    {
      title: "Trạng thái",
      label: "Trạng thái",
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
      label: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
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
              <Button
                type="text"
                icon={<DeleteOutlined className="text-red-500" />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div className="flex-1">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            Cấu hình Validation
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Thiết lập các công thức toán học để kiểm tra tính đúng đắn của báo
            cáo.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal(null)}
          size="small"
          className="w-full sm:w-auto md:!h-8"
        >
          <span className="hidden sm:inline">Thêm công thức</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Mobile Responsive Table */}
      <div className="md:hidden">
        <ResponsiveTable
          data={data}
          columns={columns.filter(
            (col) => col.key !== "actions" && col.key !== "isActive",
          )}
          loading={loading}
          renderActions={renderMobileActions}
          searchable={false}
        />
      </div>

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
