import { Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const MetricsSearchBar = ({
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  groupFilter,
  setGroupFilter,
  typeFilter,
  setTypeFilter,
  metricGroups,
  onSearch,
}) => {
  const formatVietnameseGroupName = (name) => {
    if (!name) return "Không có tên";
    return name
      .replace(/\s*\((?=[^)]*[A-Za-z])[^)]*\)\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 md:p-3">
      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_200px_170px_auto] gap-2 items-end">
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
            <Select.Option value="metricCode">Mã</Select.Option>
            <Select.Option value="metricNameVi">Tên chỉ số</Select.Option>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 md:mb-0.5">
            Từ khóa
          </label>
          <Input
            placeholder={
              searchField === "metricCode"
                ? "Nhập mã metric..."
                : "Nhập tên metric..."
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
            Nhóm
          </label>
          <Select
            value={groupFilter}
            onChange={setGroupFilter}
            allowClear
            className="w-full"
            size="small"
            placeholder="Lọc theo nhóm"
            options={(metricGroups || []).map((group) => ({
              value: group.id,
              label: formatVietnameseGroupName(
                group.groupNameVi || group.nameVi || group.groupName || "",
              ),
            }))}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 md:mb-0.5">
            Kiểu dữ liệu
          </label>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
            className="w-full"
            size="small"
            placeholder="Lọc theo kiểu"
            options={[
              { value: "manual", label: "Nhập tay" },
              { value: "formula", label: "Công thức" },
            ]}
          />
        </div>

        <Button type="primary" size="small" onClick={onSearch}>
          Lọc
        </Button>
      </div>
    </div>
  );
};

export default MetricsSearchBar;
