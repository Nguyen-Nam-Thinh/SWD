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
    <div className="flex gap-2 items-center">
      <Select
        value={searchField}
        onChange={setSearchField}
        style={{ width: 150 }}
      >
        <Select.Option value="ticker">Ticker</Select.Option>
        <Select.Option value="companyName">Tên Công Ty</Select.Option>
        <Select.Option value="industryCode">Mã Ngành</Select.Option>
        <Select.Option value="stockExchange">Sàn GD</Select.Option>
      </Select>

      <Input
        placeholder={
          searchField === "ticker"
            ? "Tìm kiếm theo Ticker"
            : searchField === "companyName"
              ? "Tìm kiếm theo Tên Công Ty"
              : searchField === "industryCode"
                ? "Tìm kiếm theo Mã Ngành"
                : "Tìm kiếm theo Sàn GD"
        }
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 280 }}
        suffix={
          <SearchOutlined
            className="cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={onSearch}
          />
        }
      />

      {hasActiveFilters && <Button onClick={onReset}>Đặt lại</Button>}

      {onAdd && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm công ty
        </Button>
      )}
    </div>
  );
};

export default CompanySearchBar;
