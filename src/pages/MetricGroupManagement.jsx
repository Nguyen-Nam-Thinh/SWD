import { Modal, message, Button, Tag, Space, Input, Table } from "antd";
import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import metricGroupService from "../services/metricGroupService";
import MetricGroupModal from "../components/metricGroup/MetricGroupModal";
import authService from "../services/authService"; // THÊM IMPORT NÀY
import AddNewButton from "../components/common/AddNewButton";

const { Search } = Input;

const MetricGroupManagement = () => {
  // Lấy thông tin user để phân quyền
  const user = authService.getUserData();
  const isAdmin = user?.role === "Admin"; // Kiểm tra xem có phải Admin không

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadGroups = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      const data = await metricGroupService.getMetricGroups({
        pageNumber: page,
        pageSize: pageSize,
        SearchTerm: search,
      });
      setGroups(data.items || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalCount,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleTableChange = (newPagination) => {
    loadGroups(newPagination.current, newPagination.pageSize, searchTerm);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Xóa nhóm: ${record.groupName}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await metricGroupService.deleteMetricGroup(record.id);
          message.success("Đã xóa");
          loadGroups(pagination.current, pagination.pageSize, searchTerm);
        } catch (error) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingGroup) {
        await metricGroupService.updateMetricGroup(editingGroup.id, values);
        message.success("Đã cập nhật");
      } else {
        await metricGroupService.createMetricGroup(values);
        message.success("Đã thêm mới");
      }
      setIsModalOpen(false);
      loadGroups(pagination.current, pagination.pageSize, searchTerm);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Khai báo cột mặc định (Ai cũng xem được)
  let columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên Nhóm",
      dataIndex: "groupName",
      key: "groupName",
      className: "font-semibold",
    },
    {
      title: "Thứ tự hiển thị",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 150,
      align: "center",
      render: (val) => <Tag color="purple">{val}</Tag>,
    },
  ];

  // Nếu là Admin thì Push thêm cột Hành động vào cuối mảng
  if (isAdmin) {
    columns.push({
      title: <div className="text-center">Hành động</div>,
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
              setIsModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    });
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold mb-4">
        Nhóm Chỉ Số (Metric Groups)
      </h2>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <Search
            placeholder="Tìm tên nhóm..."
            onSearch={(val) => {
              setSearchTerm(val);
              loadGroups(1, pagination.pageSize, val);
            }}
            className="w-full md:w-[250px]"
            allowClear
          />
        </div>

        {/* Chỉ hiện nút Thêm nếu là Admin */}
        {isAdmin && (
          <AddNewButton
            onClick={() => {
              setEditingGroup(null);
              setIsModalOpen(true);
            }}
            label="Thêm Nhóm"
            className="w-full md:w-auto"
          >
            Thêm Nhóm
          </AddNewButton>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhóm`,
        }}
        onChange={handleTableChange}
      />

      <MetricGroupModal
        open={isModalOpen}
        editingGroup={editingGroup}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingGroup(null);
        }}
        loading={loading}
      />
    </div>
  );
};

export default MetricGroupManagement;
