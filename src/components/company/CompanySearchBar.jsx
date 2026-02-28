import { Input, Select, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const CompanySearchBar = ({
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  onSearch,
  onReset,
  onAdd,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full md:w-auto">
      <Select
        value={searchField}
        onChange={setSearchField}
        style={{ width: 150 }}
        className="w-full sm:w-auto"
      >
        <Select.Option value="ticker">Mã CK (Ticker)</Select.Option>
        <Select.Option value="companyName">Tên Công Ty</Select.Option>
        <Select.Option value="stockExchange">Sàn Giao Dịch</Select.Option>
      </Select>

      <Input
        placeholder={
          searchField === "ticker"
            ? "Tìm kiếm theo Ticker"
            : searchField === "companyName"
              ? "Tìm kiếm theo Tên Công Ty"
              : "Tìm kiếm theo Sàn GD"
        }
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 280 }}
        className="w-full sm:w-auto"
        suffix={
          <SearchOutlined
            className="cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={onSearch}
          />
        }
      />

      <div className="flex gap-2 mt-2 sm:mt-0">
        {hasActiveFilters && (
          <Button onClick={onReset} className="flex-1 sm:flex-none">
            Đặt lại
          </Button>
        )}

        {onAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} className="flex-1 sm:flex-none">
            Thêm công ty
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompanySearchBar;