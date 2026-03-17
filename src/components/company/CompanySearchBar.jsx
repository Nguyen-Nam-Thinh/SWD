import { Input, Select, Button } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const CompanySearchBar = ({
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  stockExchangeFilter,
  setStockExchangeFilter,
  industryFilter,
  setIndustryFilter,
  industries = [],
  onSearch,
  onReset,
  hasActiveFilters = false,
}) => {
  return (
    <div className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 md:p-3">
      <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_140px_180px_auto] gap-2 items-end">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 md:mb-0.5">
            Tìm theo
          </label>
          <Select
            value={searchField}
            onChange={setSearchField}
            className="w-full"
            size="small"
          >
            <Select.Option value="ticker">Mã CK</Select.Option>
            <Select.Option value="companyName">Tên công ty</Select.Option>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 md:mb-0.5">
            Từ khóa
          </label>
          <Input
            placeholder={
              searchField === "ticker" ? "Nhập Mã CK..." : "Nhập tên công ty..."
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={onSearch}
            size="small"
            suffix={
              <SearchOutlined
                className="cursor-pointer text-gray-400 hover:text-blue-500"
                onClick={onSearch}
              />
            }
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 md:mb-0.5">
            Sàn
          </label>
          <Select
            value={stockExchangeFilter}
            onChange={setStockExchangeFilter}
            allowClear
            placeholder="Chọn sàn"
            className="w-full"
            size="small"
            options={[
              { value: "HOSE", label: "HOSE" },
              { value: "HNX", label: "HNX" },
              { value: "UPCOM", label: "UPCOM" },
            ]}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 md:mb-0.5">
            Ngành
          </label>
          <Select
            value={industryFilter}
            onChange={setIndustryFilter}
            allowClear
            placeholder="Chọn ngành"
            className="w-full"
            size="small"
            showSearch
            optionFilterProp="label"
            options={industries.map((industry) => ({
              value: industry.id,
              label: `${industry.code} - ${industry.nameVi}`,
            }))}
          />
        </div>

        <div className="flex gap-1.5 md:justify-end">
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={onSearch}
            size="small"
          >
            Lọc
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            disabled={!hasActiveFilters}
            size="small"
          >
            Xóa lọc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySearchBar;
