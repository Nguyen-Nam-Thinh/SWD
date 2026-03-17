import {
  Modal,
  message,
  Input,
  Select,
  Popover,
  Badge,
  Tag,
  Divider,
  Button,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import companyService from "../services/companyService";
import industryService from "../services/industryService";
import CompanyTable from "../components/company/CompanyTable";
import CompanyModal from "../components/company/CompanyModal";
import ResponsiveTable from "../components/ResponsiveTable";
import AddNewButton from "../components/common/AddNewButton";

const CompanyManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]); // All data
  const [editingCompany, setEditingCompany] = useState(null);
  const [industries, setIndustries] = useState([]);

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Filter states (applied)
  const [stockExchangeFilter, setStockExchangeFilter] = useState(undefined);
  const [industryFilter, setIndustryFilter] = useState(undefined);

  // Temp filter states (in popup)
  const [tempStockExchangeFilter, setTempStockExchangeFilter] =
    useState(undefined);
  const [tempIndustryFilter, setTempIndustryFilter] = useState(undefined);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (stockExchangeFilter) count++;
    if (industryFilter) count++;
    return count;
  }, [stockExchangeFilter, industryFilter]);

  // Client-side filtering
  const filteredCompanies = useMemo(() => {
    let result = allCompanies;

    // Search by ticker or company name
    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.ticker || "").toLowerCase().includes(keyword) ||
          (item.companyName || "").toLowerCase().includes(keyword),
      );
    }

    // Filter by stock exchange
    if (stockExchangeFilter) {
      result = result.filter(
        (item) => item.stockExchange === stockExchangeFilter,
      );
    }

    // Filter by industry
    if (industryFilter) {
      result = result.filter(
        (item) =>
          String(item.industryId) === String(industryFilter) ||
          String(item.industry?.id) === String(industryFilter),
      );
    }

    return result;
  }, [allCompanies, searchValue, stockExchangeFilter, industryFilter]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({
        PageNumber: 1,
        PageSize: 9999,
      });
      setAllCompanies(data.items || data || []);
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

  // Filter popup handlers
  const handleOpenFilterPopover = () => {
    setTempStockExchangeFilter(stockExchangeFilter);
    setTempIndustryFilter(industryFilter);
    setFilterPopoverOpen(true);
  };

  const handleApplyPopoverFilters = () => {
    setStockExchangeFilter(tempStockExchangeFilter);
    setIndustryFilter(tempIndustryFilter);
    setFilterPopoverOpen(false);
  };

  const handleResetPopoverFilters = () => {
    setTempStockExchangeFilter(undefined);
    setTempIndustryFilter(undefined);
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
          loadCompanies();
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
      loadCompanies();
    } catch (error) {
      message.error(company ? "Cập nhật thất bại" : "Thêm công ty thất bại");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Columns for mobile
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
          Sàn
        </label>
        <Select
          value={tempStockExchangeFilter}
          onChange={setTempStockExchangeFilter}
          className="w-full"
          allowClear
          placeholder="Chọn sàn"
          options={[
            { value: "HOSE", label: "HOSE" },
            { value: "HNX", label: "HNX" },
            { value: "UPCOM", label: "UPCOM" },
          ]}
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
          Ngành
        </label>
        <Select
          value={tempIndustryFilter}
          onChange={setTempIndustryFilter}
          className="w-full"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Chọn ngành"
          options={(industries || []).map((ind) => ({
            value: ind.id,
            label: ind.nameVi || ind.nameEn || ind.code || "",
          }))}
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
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold mb-4">
        Danh sách công ty
      </h2>

      {/* Search + Filter + Add */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            placeholder="Tìm kiếm theo mã CK hoặc tên công ty..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            prefix={
              <SearchOutlined className="text-gray-400 cursor-pointer hover:text-blue-500" />
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
              {stockExchangeFilter && (
                <Tag
                  closable
                  onClose={() => setStockExchangeFilter(undefined)}
                  color="blue"
                >
                  Sàn: {stockExchangeFilter}
                </Tag>
              )}
              {industryFilter && (
                <Tag
                  closable
                  onClose={() => setIndustryFilter(undefined)}
                  color="purple"
                >
                  Ngành:{" "}
                  {industries.find((i) => i.id === industryFilter)?.nameVi ||
                    industryFilter}
                </Tag>
              )}
            </div>
          )}
        </div>

        <AddNewButton
          onClick={handleAdd}
          label="Thêm công ty"
          className="w-full md:w-auto"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <CompanyTable
          companies={filteredCompanies}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} Mã CK`,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <ResponsiveTable
          columns={columns}
          data={filteredCompanies}
          itemsPerPage={10}
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
