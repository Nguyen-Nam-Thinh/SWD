import { Modal, message, Button, Space, Input, Table } from "antd";
import { useState, useEffect, useRef } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import industryService from "../services/industryService";
import IndustryModal from "../components/industry/IndustryModal";
import authService from "../services/authService"; // THÊM IMPORT NÀY
import AddNewButton from "../components/common/AddNewButton";

const { Search } = Input;

const IndustryManagement = () => {
  // Lấy thông tin user để phân quyền
  const user = authService.getUserData();
  const isAdmin = user?.role === "Admin"; // Kiểm tra xem có phải Admin không

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimerRef = useRef(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadIndustries = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      const data = await industryService.getIndustries({
        PageNumber: page,
        PageSize: pageSize,
        SearchTerm: search,
      });
      setIndustries(data.items || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalCount,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách ngành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    loadIndustries(1, pagination.pageSize, value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      loadIndustries(1, pagination.pageSize, value);
    }, 500);
  };

  const handleTableChange = (newPagination) => {
    loadIndustries(newPagination.current, newPagination.pageSize, searchTerm);
  };

  const handleEdit = async (record) => {
    try {
      const detail = await industryService.getIndustryById(record.id);
      setEditingIndustry(detail);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa ngành ${record.code}?`,
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          await industryService.deleteIndustry(record.id);
          message.success("Xóa thành công");
          loadIndustries(pagination.current, pagination.pageSize, searchTerm);
        } catch (error) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingIndustry) {
        await industryService.updateIndustry(editingIndustry.id, values);
        message.success("Cập nhật thành công");
      } else {
        await industryService.createIndustry(values);
        message.success("Thêm mới thành công");
      }
      setIsModalOpen(false);
      loadIndustries(pagination.current, pagination.pageSize, searchTerm);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Khai báo cột mặc định
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
      title: "Mã Ngành",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (text) => (
        <span className="font-bold text-gray-800">
          {text}
        </span>
      ),
    },
    {
      title: "Tên Tiếng Việt",
      dataIndex: "nameVi",
      key: "nameVi",
      className: "font-semibold",
    },
    {
      title: "Tên Tiếng Anh",
      dataIndex: "nameEn",
      key: "nameEn",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
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
            onClick={() => handleEdit(record)}
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
        Quản lý Ngành (Industry)
      </h2>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <Search
            placeholder="Tìm theo mã, tên..."
            onSearch={handleSearch}
            onChange={handleSearchChange}
            value={searchTerm}
            className="w-full md:w-[250px]"
            allowClear
          />
        </div>

        {/* Chỉ hiện nút Thêm nếu là Admin */}
        {isAdmin && (
          <AddNewButton
            onClick={() => {
              setEditingIndustry(null);
              setIsModalOpen(true);
            }}
            label="Thêm Ngành"
            className="w-full md:w-auto"
          >
            Thêm Ngành
          </AddNewButton>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={industries}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Tổng ${total} ngành`,
        }}
        onChange={handleTableChange}
      />

      <IndustryModal
        open={isModalOpen}
        editingIndustry={editingIndustry}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingIndustry(null);
        }}
        loading={loading}
      />
    </div>
  );
};

export default IndustryManagement;
