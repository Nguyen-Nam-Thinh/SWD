import { Table, DatePicker, Input, Tag } from "antd";
const { RangePicker } = DatePicker;
const { Search } = Input;

const AuditLogs = () => {
  const columns = [
    { title: "Thời gian", dataIndex: "time", key: "time" },
    { title: "Người thực hiện", dataIndex: "user", key: "user" },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (text) => {
        let color = "default";
        if (text.includes("Delete")) color = "red";
        if (text.includes("Approve")) color = "green";
        if (text.includes("Update")) color = "blue";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    { title: "Đối tượng", dataIndex: "target", key: "target" },
    { title: "Chi tiết", dataIndex: "detail", key: "detail", ellipsis: true },
  ];

  const data = [
    {
      key: "1",
      time: "2024-01-25 14:30",
      user: "admin",
      action: "Approve Report",
      target: "BCTC FPT Q4/2023",
      detail: "Changed status Pending -> Approved",
    },
    {
      key: "2",
      time: "2024-01-25 10:15",
      user: "staff_hcm",
      action: "Update Company",
      target: "VNM",
      detail: "Updated website URL",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-wrap gap-4 mb-6">
        <RangePicker showTime />
        <Search
          placeholder="Tìm theo User hoặc Hành động"
          style={{ width: 300 }}
        />
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default AuditLogs;
