import {
  Modal,
  message,
  Button,
  Tag,
  Input,
  Select,
  Popover,
  Badge,
  Divider,
  Table,
  Space,
} from "antd";
import { useState, useEffect, useRef, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import metricService from "../services/metricService";
import metricGroupService from "../services/metricGroupService";
import authService from "../services/authService";
import MetricsTable from "../components/metrics/MetricsTable";
import MetricsModal from "../components/metrics/MetricsModal";
import MetricGroupModal from "../components/metricGroup/MetricGroupModal";
import ResponsiveTable from "../components/ResponsiveTable";
import AddNewButton from "../components/common/AddNewButton";

const MetricsManagement = () => {
  const user = authService.getUserData();
  const isAdmin = user?.role === "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [allMetrics, setAllMetrics] = useState([]); // All fetched data
  const [editingMetric, setEditingMetric] = useState(null);
  const [metricGroups, setMetricGroups] = useState([]);

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Filter states (applied)
  const [groupFilter, setGroupFilter] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState(undefined);

  // Temp filter states (in popup)
  const [tempGroupFilter, setTempGroupFilter] = useState(undefined);
  const [tempTypeFilter, setTempTypeFilter] = useState(undefined);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // --- Metric Group management states ---
  const [groupLoading, setGroupLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupManageOpen, setIsGroupManageOpen] = useState(false);
  const [groupPagination, setGroupPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (groupFilter) count++;
    if (typeFilter) count++;
    return count;
  }, [groupFilter, typeFilter]);

  const formatVietnameseGroupName = (name) => {
    if (!name) return "-";
    return name
      .replace(/\s*\((?=[^)]*[A-Za-z])[^)]*\)\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const sortByNewest = (list) => {
    const items = [...(list || [])];
    return items.sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      if (aTime !== bTime) return bTime - aTime;
      if (a.id && b.id) return String(b.id).localeCompare(String(a.id));
      return 0;
    });
  };

  // Group name map for display
  const groupNameMap = new Map(
    (metricGroups || []).map((group) => [
      String(group.id),
      group.groupNameVi || group.nameVi || group.groupName || "-",
    ]),
  );

  // ========== CLIENT-SIDE FILTERING ==========
  const filteredMetrics = useMemo(() => {
    let result = allMetrics;

    // Search filter (code or name)
    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.metricCode || "").toLowerCase().includes(keyword) ||
          (item.metricNameVi || "").toLowerCase().includes(keyword) ||
          (item.metricName || "").toLowerCase().includes(keyword),
      );
    }

    // Group filter
    if (groupFilter) {
      result = result.filter((item) => {
        const itemGroupId = String(
          item.groupId ?? item.group?.id ?? item.metricGroupId ?? "",
        );
        return itemGroupId === String(groupFilter);
      });
    }

    // Type filter
    if (typeFilter) {
      const isFormula = typeFilter === "formula";
      result = result.filter(
        (item) => Boolean(item.isAutoCalculated) === isFormula,
      );
    }

    return result;
  }, [allMetrics, searchValue, groupFilter, typeFilter]);

  // ========== METRICS LOGIC ==========
  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await metricService.getMetrics({
        pageNumber: 1,
        pageSize: 9999,
      });
      const serverItems = data.items || data || [];
      setAllMetrics(sortByNewest(serverItems));
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
    // Client-side search via useMemo, nothing needed here
  };

  // Filter popup handlers
  const handleOpenFilterPopover = () => {
    setTempGroupFilter(groupFilter);
    setTempTypeFilter(typeFilter);
    setFilterPopoverOpen(true);
  };

  const handleApplyPopoverFilters = () => {
    setGroupFilter(tempGroupFilter);
    setTypeFilter(tempTypeFilter);
    setFilterPopoverOpen(false);
  };

  const handleResetPopoverFilters = () => {
    setTempGroupFilter(undefined);
    setTempTypeFilter(undefined);
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
          loadMetrics();
        } catch (error) {
          message.error("Xóa chỉ số thất bại");
        }
      },
    });
  };

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
      loadMetrics();
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

  // ========== METRIC GROUPS LOGIC ==========
  const loadGroups = async (page = 1, pageSize = 5) => {
    setGroupLoading(true);
    try {
      const data = await metricGroupService.getMetricGroups({
        pageNumber: page,
        pageSize: pageSize,
      });
      setGroups(data.items || []);
      setGroupPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalCount,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhóm");
    } finally {
      setGroupLoading(false);
    }
  };

  const handleGroupDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Xóa nhóm: ${record.groupName}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await metricGroupService.deleteMetricGroup(record.id);
          message.success("Đã xóa");
          loadGroups(groupPagination.current, groupPagination.pageSize);
          loadMetricGroups();
        } catch (error) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const handleGroupSubmit = async (values) => {
    setGroupLoading(true);
    try {
      if (editingGroup) {
        await metricGroupService.updateMetricGroup(editingGroup.id, values);
        message.success("Đã cập nhật");
      } else {
        await metricGroupService.createMetricGroup(values);
        message.success("Đã thêm mới");
      }
      setIsGroupModalOpen(false);
      loadGroups(groupPagination.current, groupPagination.pageSize);
      loadMetricGroups();
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setGroupLoading(false);
    }
  };

  const handleOpenGroupManage = () => {
    loadGroups(1, 5);
    setIsGroupManageOpen(true);
  };

  // Group columns (no displayOrder)
  const groupColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        (groupPagination.current - 1) * groupPagination.pageSize + index + 1,
    },
    {
      title: "Tên Nhóm",
      dataIndex: "groupName",
      key: "groupName",
      className: "font-semibold",
    },
  ];

  if (isAdmin) {
    groupColumns.push({
      title: "Hành động",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600"
            onClick={() => {
              setEditingGroup(record);
              setIsGroupModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleGroupDelete(record)}
          />
        </Space>
      ),
    });
  }

  // ========== RENDER ==========
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

  const columns = [
    {
      title: "STT",
      label: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
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

  // Filter popover content
  const filterPopoverContent = (
    <div style={{ width: 300 }}>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 6,
          }}
        >
          Nhóm
        </label>
        <Select
          value={tempGroupFilter}
          onChange={setTempGroupFilter}
          className="w-full"
          allowClear
          placeholder="Lọc theo nhóm"
          options={(metricGroups || []).map((group) => ({
            value: group.id,
            label: formatVietnameseGroupName(
              group.groupNameVi || group.nameVi || group.groupName || "",
            ),
          }))}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 6,
          }}
        >
          Kiểu dữ liệu
        </label>
        <Select
          value={tempTypeFilter}
          onChange={setTempTypeFilter}
          className="w-full"
          allowClear
          placeholder="Lọc theo kiểu"
          options={[
            { value: "manual", label: "Nhập tay" },
            { value: "formula", label: "Công thức" },
          ]}
        />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button icon={<ReloadOutlined />} onClick={handleResetPopoverFilters}>
          Đặt lại
        </Button>
        <Button
          type="primary"
          icon={<FilterOutlined />}
          onClick={handleApplyPopoverFilters}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold mb-4">Danh sách chỉ số</h2>

      {/* Search bar + Filter button + Group button + Add button */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên chỉ số..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            prefix={
              <SearchOutlined
                className="text-gray-400 cursor-pointer hover:text-blue-500"
                onClick={handleSearch}
              />
            }
            allowClear
            style={{ maxWidth: 400 }}
            size="middle"
          />

          <Popover
            content={filterPopoverContent}
            title={
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                Bộ lọc nâng cao
              </span>
            }
            trigger="click"
            open={filterPopoverOpen}
            onOpenChange={(open) => {
              if (open) {
                handleOpenFilterPopover();
              } else {
                setFilterPopoverOpen(false);
              }
            }}
            placement="bottomLeft"
          >
            <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
              <Button icon={<FilterOutlined />} size="middle">
                Bộ lọc
              </Button>
            </Badge>
          </Popover>

          {/* Active filter tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {groupFilter && (
                <Tag
                  closable
                  onClose={() => setGroupFilter(undefined)}
                  color="blue"
                >
                  Nhóm:{" "}
                  {formatVietnameseGroupName(
                    groupNameMap.get(String(groupFilter)) || groupFilter,
                  )}
                </Tag>
              )}
              {typeFilter && (
                <Tag
                  closable
                  onClose={() => setTypeFilter(undefined)}
                  color="purple"
                >
                  {typeFilter === "formula" ? "Công thức" : "Nhập tay"}
                </Tag>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            icon={<SettingOutlined />}
            onClick={handleOpenGroupManage}
            size="middle"
          >
            Nhóm chỉ số
          </Button>
          <AddNewButton
            onClick={handleAdd}
            label="Thêm chỉ số"
            className="w-full md:w-auto"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <MetricsTable
          metrics={filteredMetrics}
          metricGroups={metricGroups}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} chỉ số`,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile Responsive Table */}
      <div className="md:hidden">
        <ResponsiveTable
          data={filteredMetrics}
          columns={columns}
          loading={loading}
          renderActions={renderMobileActions}
        />
      </div>

      {/* Metric Group Management Modal */}
      <Modal
        title="Quản lý Nhóm Chỉ Số"
        open={isGroupManageOpen}
        onCancel={() => setIsGroupManageOpen(false)}
        footer={null}
        width={600}
      >
        <div className="mb-3 flex justify-end">
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}
            >
              Thêm nhóm
            </Button>
          )}
        </div>

        <Table
          columns={groupColumns}
          dataSource={groups}
          rowKey="id"
          loading={groupLoading}
          size="small"
          pagination={{
            ...groupPagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            showTotal: (total) => `Tổng ${total} nhóm`,
          }}
          onChange={(newPag) => loadGroups(newPag.current, newPag.pageSize)}
        />
      </Modal>

      {/* Modals */}
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

      <MetricGroupModal
        open={isGroupModalOpen}
        editingGroup={editingGroup}
        onSubmit={handleGroupSubmit}
        onCancel={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(null);
        }}
        loading={groupLoading}
      />
    </div>
  );
};

export default MetricsManagement;
