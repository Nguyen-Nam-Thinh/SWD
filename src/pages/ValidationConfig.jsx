import { Table, Button, Switch, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const ValidationConfig = () => {
  const columns = [
    { title: "Tên quy tắc", dataIndex: "name", key: "name", width: "20%" },
    {
      title: "Biểu thức kiểm tra",
      dataIndex: "expression",
      key: "expression",
      render: (text) => (
        <code className="bg-slate-100 px-2 py-1 rounded text-red-500">
          {text}
        </code>
      ),
    },
    { title: "Sai số (Tolerance)", dataIndex: "tolerance", key: "tolerance" },
    {
      title: "Trạng thái",
      key: "active",
      render: (_, record) => <Switch defaultChecked={record.active} />,
    },
  ];

  const data = [
    {
      key: "1",
      name: "Check Cân đối kế toán",
      expression: "ASSETS = LIABILITIES + EQUITY",
      tolerance: "0.1",
      active: true,
    },
    {
      key: "2",
      name: "Check Lợi nhuận",
      expression: "NET_INCOME = REVENUE - EXPENSES",
      tolerance: "1.0",
      active: true,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Cấu hình Validation</h2>
          <p className="text-gray-500 text-sm">
            Thiết lập các công thức toán học để kiểm tra tính đúng đắn của báo
            cáo.
          </p>
        </div>
        <Button type="dashed" icon={<PlusOutlined />}>
          Thêm công thức
        </Button>
      </div>
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default ValidationConfig;
