// src/pages/ReportDetail/components/ReportInfo.jsx
import { Descriptions, Tag, Card } from "antd";

const ReportInfo = ({ info, loading }) => {
  if (!info) return null;

  return (
    <Card loading={loading} className="shadow-sm mb-4">
      <Descriptions
        title="Thông tin báo cáo"
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Công ty">
          <span className="font-bold text-blue-700">{info.companyName}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Kỳ báo cáo">
          Quý {info.period} / {info.year}
        </Descriptions.Item>
        <Descriptions.Item label="File gốc">
          <a href="#" className="text-blue-500 hover:underline">
            {info.fileName}
          </a>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={info.status === "Draft" ? "orange" : "green"}>
            {info.status?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ReportInfo;
