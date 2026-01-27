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
    <div className="flex gap-2 items-center">
      <Select
        value={searchField}
        onChange={setSearchField}
        style={{ width: 150 }}
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
        style={{ width: 280 }}
        suffix={
          <SearchOutlined
            className="cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={onSearch}
          />
        }
      />

      {hasActiveFilters && <Button onClick={onReset}>Đặt lại</Button>}

      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        Thêm Metric
      </Button>
    </div>
  );
};

export default MetricsSearchBar;
