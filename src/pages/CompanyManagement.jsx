import { Form, Modal, message } from "antd";
import { useState, useEffect } from "react";
import companyService from "../services/companyService";
import CompanySearchBar from "../components/company/CompanySearchBar";
import CompanyTable from "../components/company/CompanyTable";
import CompanyModal from "../components/company/CompanyModal";

const CompanyManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
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
    form.resetFields();
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleEdit = async (record) => {
    try {
      const companyDetail = await companyService.getCompanyById(record.id);
      setEditingCompany(companyDetail);
      form.setFieldsValue(companyDetail);
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
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingCompany) {
        // Cập nhật
        await companyService.updateCompany(editingCompany.id, values);
        message.success("Cập nhật công ty thành công");
      } else {
        // Tạo mới
        await companyService.createCompany(values);
        message.success("Thêm công ty thành công");
      }

      setIsModalOpen(false);
      form.resetFields();
      loadCompanies(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error(
          editingCompany ? "Cập nhật thất bại" : "Thêm công ty thất bại",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Danh sách công ty</h2>

        <CompanySearchBar
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

      <CompanyTable
        companies={companies}
        loading={loading}
        pagination={pagination}
        onTableChange={handleTableChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CompanyModal
        open={isModalOpen}
        editingCompany={editingCompany}
        form={form}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingCompany(null);
        }}
      />
    </div>
  );
};

export default CompanyManagement;
