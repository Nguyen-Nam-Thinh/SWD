import { Form, Modal, message, Tag } from "antd";
import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import companyService from "../services/companyService";
import CompanySearchBar from "../components/company/CompanySearchBar";
import CompanyTable from "../components/company/CompanyTable";
import CompanyModal from "../components/company/CompanyModal";
import ResponsiveTable from "../components/ResponsiveTable";

const CompanyManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});

  // Search states
  const [searchField, setSearchField] = useState("ticker");
  const [searchValue, setSearchValue] = useState("");

  // Load danh sách công ty
  const loadCompanies = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({
        pageNumber: page,
        pageSize: pageSize,
        ...filterParams,
      });

      // Giả sử API trả về { items: [], totalCount: 0 }
      // Nếu API trả về khác, cần điều chỉnh
      setCompanies(data.items || data);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalCount || data.length || 0,
      });
    } catch (error) {
      message.error("Không thể tải danh sách công ty");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const newFilters = {};
    if (searchValue.trim()) {
      if (searchField === "ticker") {
        newFilters.ticker = searchValue.trim();
      } else if (searchField === "companyName") {
        newFilters.companyName = searchValue.trim();
      } else if (searchField === "industryCode") {
        newFilters.industryCode = searchValue.trim();
      } else if (searchField === "stockExchange") {
        newFilters.stockExchange = searchValue.trim();
      }
    }
    setFilters(newFilters);
    loadCompanies(1, pagination.pageSize, newFilters);
  };

  // Reset tìm kiếm
  const handleResetSearch = () => {
    setSearchValue("");
    setSearchField("ticker");
    setFilters({});
    loadCompanies(1, pagination.pageSize, {});
  };

  // Xử lý thay đổi pagination
  const handleTableChange = (newPagination) => {
    loadCompanies(newPagination.current, newPagination.pageSize, filters);
  };

  // Mở modal thêm mới
  const handleAdd = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleEdit = async (record) => {
    try {
      const companyDetail = await companyService.getCompanyById(record.id);
      setEditingCompany(companyDetail);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin công ty");
    }
  };

  // Xóa công ty
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa công ty ${record.companyName}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await companyService.deleteCompany(record.id);
          message.success("Xóa công ty thành công");
          loadCompanies(pagination.current, pagination.pageSize, filters);
        } catch (error) {
          message.error("Xóa công ty thất bại");
        }
      },
    });
  };

  // Submit form
  const handleSubmit = async (values, company) => {
    try {
      setLoading(true);

      if (company) {
        // Cập nhật
        await companyService.updateCompany(company.id, values);
        message.success("Cập nhật công ty thành công");
      } else {
        // Tạo mới
        await companyService.createCompany(values);
        message.success("Thêm công ty thành công");
      }

      setIsModalOpen(false);
      loadCompanies(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error(company ? "Cập nhật thất bại" : "Thêm công ty thất bại");
      throw error; // Để modal không đóng khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình columns dùng chung cho desktop và mobile
  const columns = [
    {
      title: "Mã CK (Ticker)",
      dataIndex: "ticker",
      key: "ticker",
      label: "Mã CK",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
      label: "Tên công ty",
      render: (text) => (
        <span className="block truncate max-w-xs" title={text}>
          {text}
        </span>
      ),
    },
    {
      title: "Sàn",
      dataIndex: "stockExchange",
      key: "stockExchange",
      label: "Sàn",
      render: (ex) => (
        <Tag color={ex === "HOSE" ? "purple" : "orange"}>{ex}</Tag>
      ),
    },
    {
      title: "Mã ngành",
      dataIndex: "industryCode",
      key: "industryCode",
      label: "Mã ngành",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      label: "Website",
      render: (url) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline block truncate max-w-xs"
            title={url}
          >
            {url}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Hành động",
      key: "action",
      label: "Thao tác",
      render: (_, record) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Sửa"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold mb-4">Danh sách công ty</h2>

      <div className="mb-4">
        <CompanySearchBar
          searchField={searchField}
          setSearchField={setSearchField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onSearch={handleSearch}
          onReset={handleResetSearch}
          onAdd={null}
          hasActiveFilters={searchValue || Object.keys(filters).length > 0}
        />
      </div>

      <div className="mb-4">
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Edit size={16} />
          Thêm công ty
        </button>
      </div>

      {/* Desktop Table - Ẩn trên mobile */}
      <div className="hidden md:block">
        <CompanyTable
          companies={companies}
          loading={loading}
          pagination={pagination}
          onTableChange={handleTableChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile/Tablet View - Chỉ hiện trên mobile */}
      <div className="md:hidden">
        <ResponsiveTable
          columns={columns}
          data={companies}
          itemsPerPage={pagination.pageSize}
          searchable={false}
          onRowClick={(row) => handleEdit(row)}
        />
      </div>

      <CompanyModal
        open={isModalOpen}
        editingCompany={editingCompany}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
      />
    </div>
  );
};

export default CompanyManagement;
