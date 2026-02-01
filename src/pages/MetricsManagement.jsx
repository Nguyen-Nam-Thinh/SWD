import { Form, Modal, message, Button, Tag, Space } from "antd";
import { useState, useEffect, useRef } from "react";
import { Edit, Trash2 } from "lucide-react";
import metricService from "../services/metricService";
import MetricsSearchBar from "../components/metrics/MetricsSearchBar";
import MetricsTable from "../components/metrics/MetricsTable";
import MetricsModal from "../components/metrics/MetricsModal";
import ResponsiveTable from "../components/ResponsiveTable";

const MetricsManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [metrics, setMetrics] = useState([]);
  const [editingMetric, setEditingMetric] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});

  // Search states
  const [searchField, setSearchField] = useState("metricCode");
  const [searchValue, setSearchValue] = useState("");

  // Load danh sách metrics
  const loadMetrics = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const data = await metricService.getMetrics({
        pageNumber: page,
        pageSize: pageSize,
        ...filterParams,
      });

      // Xử lý dữ liệu trả về
      setMetrics(data.items || data);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalCount || data.length || 0,
      });
    } catch (error) {
      message.error("Không thể tải danh sách metrics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const newFilters = {};
    if (searchValue.trim()) {
      if (searchField === "metricCode") {
        newFilters.metricCode = searchValue.trim();
      } else if (searchField === "metricName") {
        newFilters.metricName = searchValue.trim();
      } else if (searchField === "unit") {
        newFilters.unit = searchValue.trim();
      }
    }
    setFilters(newFilters);
    loadMetrics(1, pagination.pageSize, newFilters);
  };

  // Reset tìm kiếm
  const handleResetSearch = () => {
    setSearchValue("");
    setSearchField("metricCode");
    setFilters({});
    loadMetrics(1, pagination.pageSize, {});
  };

  // Xử lý thay đổi pagination
  const handleTableChange = (newPagination) => {
    loadMetrics(newPagination.current, newPagination.pageSize, filters);
  };

  // Mở modal thêm mới
  const handleAdd = () => {
    setEditingMetric(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleEdit = async (record) => {
    try {
      const metricDetail = await metricService.getMetricById(record.id);
      setEditingMetric(metricDetail);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin metric");
    }
  };

  // Xóa metric
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa metric ${record.metricName}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await metricService.deleteMetric(record.id);
          message.success("Xóa metric thành công");
          loadMetrics(pagination.current, pagination.pageSize, filters);
        } catch (error) {
          message.error("Xóa metric thất bại");
        }
      },
    });
  };

  // Render mobile actions
  const renderMobileActions = (record) => (
    <div className="flex gap-2 flex-wrap">
      <Button
        size="small"
        icon={<Edit size={14} />}
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(record);
        }}
        className="flex items-center gap-1 text-blue-600"
      >
        Sửa
      </Button>
      <div onClick={(e) => e.stopPropagation()}>
        <Button
          size="small"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => handleDelete(record)}
          className="flex items-center gap-1"
        >
          Xóa
        </Button>
      </div>
    </div>
  );

  // Columns config with labels for ResponsiveTable
  const columns = [
    {
      title: "Mã Metric",
      label: "Mã Metric",
      dataIndex: "metricCode",
      key: "metricCode",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên Metric",
      label: "Tên Metric",
      dataIndex: "metricName",
      key: "metricName",
    },
    {
      title: "Đơn Vị",
      label: "Đơn Vị",
      dataIndex: "unit",
      key: "unit",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Mô Tả",
      label: "Mô Tả",
      dataIndex: "description",
      key: "description",
      render: (text) => <div className="truncate max-w-xs">{text || "-"}</div>,
    },
  ];

  // Submit form
  const handleSubmit = async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();
      setLoading(true);

      if (editingMetric) {
        // Cập nhật
        await metricService.updateMetric(editingMetric.id, values);
        message.success("Cập nhật metric thành công");
      } else {
        // Tạo mới
        await metricService.createMetric(values);
        message.success("Thêm metric thành công");
      }

      setIsModalOpen(false);
      formRef.current.resetFields();
      loadMetrics(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error(
          editingMetric ? "Cập nhật thất bại" : "Thêm metric thất bại",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
        <h2 className="text-base md:text-lg font-bold">Danh sách Metrics</h2>

        <MetricsSearchBar
          searchField={searchField}
          setSearchField={setSearchField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onSearch={handleSearch}
          onReset={handleResetSearch}
          onAdd={handleAdd}
          hasActiveFilters={searchValue || Object.keys(filters).length > 0}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <MetricsTable
          metrics={metrics}
          loading={loading}
          pagination={pagination}
          onTableChange={handleTableChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile Responsive Table */}
      <div className="md:hidden">
        <ResponsiveTable
          data={metrics}
          columns={columns}
          loading={loading}
          renderActions={renderMobileActions}
          pagination={pagination}
          onPaginationChange={(page, pageSize) => {
            handleTableChange({ current: page, pageSize });
          }}
        />
      </div>

      <MetricsModal
        open={isModalOpen}
        editingMetric={editingMetric}
        formRef={formRef}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          if (formRef.current) {
            formRef.current.resetFields();
          }
          setEditingMetric(null);
        }}
      />
    </div>
  );
};

export default MetricsManagement;
