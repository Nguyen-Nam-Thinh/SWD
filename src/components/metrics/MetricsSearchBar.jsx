import { Input, Select, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const MetricsSearchBar = ({
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
        className="w-full sm:w-36"
        size="small"
      >
        <Select.Option value="metricCode">Mã Metric</Select.Option>
        <Select.Option value="metricName">Tên Metric</Select.Option>
        <Select.Option value="unit">Đơn Vị</Select.Option>
      </Select>

      <Input
        placeholder={
          searchField === "metricCode"
            ? "Tìm kiếm theo Mã Metric"
            : searchField === "metricName"
              ? "Tìm kiếm theo Tên Metric"
              : "Tìm kiếm theo Đơn Vị"
        }
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPressEnter={onSearch}
        className="w-full sm:w-64"
        size="small"
        suffix={
          <SearchOutlined
            className="cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={onSearch}
          />
        }
      />

      <div className="flex gap-2">
        {hasActiveFilters && (
          <Button
            onClick={onReset}
            size="small"
            className="flex-1 sm:flex-none"
          >
            Đặt lại
          </Button>
        )}

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          size="small"
          className="flex-1 sm:flex-none"
        >
          <span className="hidden sm:inline">Thêm Metric</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>
    </div>
  );
};

export default MetricsSearchBar;
