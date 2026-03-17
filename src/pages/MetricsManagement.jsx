import { Modal, message, Button, Tag } from "antd";
import { useState, useEffect, useRef } from "react";
import { Edit, Trash2 } from "lucide-react";
import metricService from "../services/metricService";
import metricGroupService from "../services/metricGroupService";
import MetricsSearchBar from "../components/metrics/MetricsSearchBar";
import MetricsTable from "../components/metrics/MetricsTable";
import MetricsModal from "../components/metrics/MetricsModal";
import ResponsiveTable from "../components/ResponsiveTable";
import AddNewButton from "../components/common/AddNewButton";

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
  const [metricGroups, setMetricGroups] = useState([]);

  // Search states
  const [searchField, setSearchField] = useState("metricCode");
  const [searchValue, setSearchValue] = useState("");
  const [groupFilter, setGroupFilter] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState(undefined);

  const sortByNewest = (list) => {
    const items = [...(list || [])];
    return items.sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();

      if (aTime !== bTime) return bTime - aTime;

      if (a.id && b.id) {
        return String(b.id).localeCompare(String(a.id));
      }

      return 0;
    });
  };

  const loadMetrics = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true);
    try {
      // Gọi service, truyền tham số tìm kiếm
      const data = await metricService.getMetrics({
        pageNumber: page,
        pageSize: pageSize,
        ...filterParams,
      });

      const serverItems = data.items || data || [];

      // Fallback lọc local trong trường hợp backend chưa hỗ trợ đầy đủ query filter
      const filteredItems = serverItems.filter((item) => {
        const targetGroupId =
          filterParams.groupId ?? filterParams.GroupId ?? undefined;
        const targetType =
          filterParams.isAutoCalculated ??
          filterParams.IsAutoCalculated ??
          undefined;

        const matchGroup =
          targetGroupId === undefined ||
          targetGroupId === null ||
          String(item.groupId ?? item.group?.id ?? "") ===
            String(targetGroupId);

        const matchType =
          targetType === undefined ||
          targetType === null ||
          Boolean(item.isAutoCalculated) === Boolean(targetType);

        return matchGroup && matchType;
      });

      setMetrics(sortByNewest(filteredItems));
      setPagination({
        current: page,
        pageSize: pageSize,
        total:
          (data.totalCount || serverItems.length || 0) &&
          (filterParams.groupId ||
            filterParams.GroupId ||
            filterParams.isAutoCalculated !== undefined ||
            filterParams.IsAutoCalculated !== undefined)
            ? filteredItems.length
            : data.totalCount || serverItems.length || 0,
      });
    } catch (error) {
      message.error("Không thể tải danh sách chỉ số");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    loadMetricGroups();
  }, []);

  const loadMetricGroups = async () => {
    try {
      const data = await metricGroupService.getAllNoPaging();
      setMetricGroups(data || []);
    } catch (error) {
      setMetricGroups([]);
    }
  };

  const handleSearch = () => {
    const newFilters = {};
    if (searchValue.trim()) {
      if (searchField === "metricCode") {
        newFilters.metricCode = searchValue.trim();
      } else if (searchField === "metricNameVi") {
        newFilters.metricNameVi = searchValue.trim();
      }
    }

    if (groupFilter) {
      newFilters.groupId = groupFilter;
      newFilters.GroupId = groupFilter;
    }

    if (typeFilter) {
      newFilters.isAutoCalculated = typeFilter === "formula";
      newFilters.IsAutoCalculated = typeFilter === "formula";
    }

    setFilters(newFilters);
    loadMetrics(1, pagination.pageSize, newFilters);
  };

  const handleTableChange = (newPagination) => {
    loadMetrics(newPagination.current, newPagination.pageSize, filters);
  };

  const handleAdd = () => {
    setEditingMetric(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (record) => {
    try {
      const metricDetail = await metricService.getMetricById(record.id);
      setEditingMetric(metricDetail);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin chỉ số");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa chỉ số ${record.metricNameVi}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await metricService.deleteMetric(record.id);
          message.success("Xóa chỉ số thành công");
          loadMetrics(pagination.current, pagination.pageSize, filters);
        } catch (error) {
          message.error("Xóa chỉ số thất bại");
        }
      },
    });
  };

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

  // Columns cho Mobile (ResponsiveTable)
  const groupNameMap = new Map(
    (metricGroups || []).map((group) => [
      String(group.id),
      group.groupNameVi || group.nameVi || group.groupName || "-",
    ]),
  );

  const formatVietnameseGroupName = (name) => {
    if (!name) return "-";
    return name
      .replace(/\s*\((?=[^)]*[A-Za-z])[^)]*\)\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const columns = [
    {
      title: "STT",
      label: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Mã chỉ số",
      label: "Mã chỉ số",
      dataIndex: "metricCode",
      key: "metricCode",
      render: (text) => (
        <span className="text-sm text-gray-700">{text || "-"}</span>
      ),
    },
    {
      title: "Tên chỉ số",
      label: "Tên chỉ số",
      key: "metricName",
      render: (_, record) => (
        <div className="font-semibold text-gray-800 leading-5">
          {record.metricNameVi || record.metricName || "-"}
        </div>
      ),
    },
    {
      title: "Nhóm",
      label: "Nhóm",
      key: "groupName",
      render: (_, record) => {
        const groupId =
          record.groupId || record.group?.id || record.metricGroupId;
        const nameFromMap = groupId ? groupNameMap.get(String(groupId)) : null;
        const rawName =
          nameFromMap ||
          record.group?.groupNameVi ||
          record.groupNameVi ||
          record.group?.groupName ||
          record.groupName ||
          record.group?.nameVi ||
          "-";

        return formatVietnameseGroupName(rawName);
      },
    },
    {
      title: "Kiểu Dữ Liệu",
      label: "Kiểu",
      key: "type",
      render: (_, record) =>
        record.isAutoCalculated ? (
          <Tag color="purple">Công thức</Tag>
        ) : (
          <Tag color="green">Nhập tay</Tag>
        ),
    },
  ];

  const handleSubmit = async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();
      setLoading(true);

      if (editingMetric) {
        await metricService.updateMetric(editingMetric.id, values);
        message.success("Cập nhật chỉ số thành công");
      } else {
        await metricService.createMetric(values);
        message.success("Thêm chỉ số thành công");
      }

      setIsModalOpen(false);
      formRef.current.resetFields();
      loadMetrics(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error(
          editingMetric ? "Cập nhật thất bại" : "Thêm chỉ số thất bại",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold mb-4">Danh sách chỉ số</h2>

      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <MetricsSearchBar
          searchField={searchField}
          setSearchField={setSearchField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          groupFilter={groupFilter}
          setGroupFilter={setGroupFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          metricGroups={metricGroups}
          onSearch={handleSearch}
        />

        <AddNewButton
          onClick={handleAdd}
          label="Thêm chỉ số"
          className="w-full md:w-auto"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <MetricsTable
          metrics={metrics}
          metricGroups={metricGroups}
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
