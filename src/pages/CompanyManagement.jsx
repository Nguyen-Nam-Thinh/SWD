import { Modal, message } from "antd";
import { useState, useEffect, useRef } from "react";
import { Edit, Trash2 } from "lucide-react";
import companyService from "../services/companyService";
import industryService from "../services/industryService";
import CompanySearchBar from "../components/company/CompanySearchBar";
import CompanyTable from "../components/company/CompanyTable";
import CompanyModal from "../components/company/CompanyModal";
import ResponsiveTable from "../components/ResponsiveTable";
import AddNewButton from "../components/common/AddNewButton";

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
  const [industries, setIndustries] = useState([]);

  // Search states
  const [searchField, setSearchField] = useState("ticker");
  const [searchValue, setSearchValue] = useState("");
  const [stockExchangeFilter, setStockExchangeFilter] = useState(undefined);
  const [industryFilter, setIndustryFilter] = useState(undefined);
  const searchTimerRef = useRef(null);

  const loadCompanies = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({
        PageNumber: page,
        PageSize: pageSize,
        ...filterParams,
      });

      setCompanies(data.items || data);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalCount || data.length || 0,
      });
    } catch (error) {
      message.error("Không thể tải danh sách công ty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      const data = await industryService.getAllNoPaging();
      setIndustries(data || []);
    } catch (error) {
      setIndustries([]);
    }
  };

  const buildFilterParams = (value = searchValue) => {
    const newFilters = {};

    if (value.trim()) {
      if (searchField === "ticker") newFilters.Ticker = value.trim();
      else if (searchField === "companyName")
        newFilters.CompanyName = value.trim();
    }

    if (stockExchangeFilter) {
      newFilters.StockExchange = stockExchangeFilter;
    }

    if (industryFilter) {
      newFilters.IndustryId = industryFilter;
    }

    return newFilters;
  };

  const handleSearch = (value = searchValue) => {
    const newFilters = buildFilterParams(value);
    setFilters(newFilters);
    loadCompanies(1, pagination.pageSize, newFilters);
  };

  const handleResetFilters = () => {
    setSearchField("ticker");
    setSearchValue("");
    setStockExchangeFilter(undefined);
    setIndustryFilter(undefined);
    const resetFilters = {};
    setFilters(resetFilters);
    loadCompanies(1, pagination.pageSize, resetFilters);
  };

  // Debounce: tự động search khi gõ sau 500ms
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      handleSearch(searchValue);
    }, 500);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchValue, searchField, stockExchangeFilter, industryFilter]);

  const handleTableChange = (newPagination) => {
    loadCompanies(newPagination.current, newPagination.pageSize, filters);
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (record) => {
    try {
      const companyDetail = await companyService.getCompanyById(record.id);
      setEditingCompany(companyDetail);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin công ty");
    }
  };

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

  const handleSubmit = async (values, company) => {
    try {
      setLoading(true);
      if (company) {
        await companyService.updateCompany(company.id, values);
        message.success("Cập nhật công ty thành công");
      } else {
        await companyService.createCompany(values);
        message.success("Thêm công ty thành công");
      }
      setIsModalOpen(false);
      loadCompanies(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error(company ? "Cập nhật thất bại" : "Thêm công ty thất bại");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình columns cho bản Mobile (Responsive Table)
  const columns = [
    {
      title: "Mã CK (Ticker)",
      dataIndex: "ticker",
      key: "ticker",
      label: "Mã CK",
      render: (text) => text || "-",
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
      render: (ex) => ex || "-",
    },
    {
      // SỬA Ở ĐÂY CHO MOBILE:
      title: "Ngành",
      dataIndex: "industryName",
      key: "industryName",
      label: "Ngành",
      render: (text) => (text ? text : "-"),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      label: "Mô tả",
      render: (text) => (
        <span className="block truncate max-w-xs" title={text || ""}>
          {text || "-"}
        </span>
      ),
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

  const hasActiveFilters =
    !!searchValue.trim() || !!stockExchangeFilter || !!industryFilter;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold mb-4">Danh sách công ty</h2>

      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CompanySearchBar
          searchField={searchField}
          setSearchField={setSearchField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          stockExchangeFilter={stockExchangeFilter}
          setStockExchangeFilter={setStockExchangeFilter}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          industries={industries}
          onSearch={handleSearch}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <AddNewButton
          onClick={handleAdd}
          label="Thêm công ty"
          className="w-full md:w-auto"
        />
      </div>

      <div className="mb-3 text-sm text-gray-600">
        Tổng số Mã CK: <strong>{pagination.total}</strong>
      </div>

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
