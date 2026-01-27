import { useState, useMemo } from "react";
import { Card, Segmented, Typography } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// DỮ LIỆU GIẢ LẬP (MOCK DATA)
// Sau này bạn sẽ thay thế bằng API gọi từ Backend
const mockData = {
  week: [
    { name: "Thứ 2", users: 12, reports: 5 },
    { name: "Thứ 3", users: 19, reports: 8 },
    { name: "Thứ 4", users: 15, reports: 12 },
    { name: "Thứ 5", users: 22, reports: 15 },
    { name: "Thứ 6", users: 30, reports: 20 },
    { name: "Thứ 7", users: 45, reports: 28 },
    { name: "CN", users: 50, reports: 35 },
  ],
  month: [
    { name: "Tuần 1", users: 150, reports: 80 },
    { name: "Tuần 2", users: 230, reports: 120 },
    { name: "Tuần 3", users: 180, reports: 160 },
    { name: "Tuần 4", users: 320, reports: 210 },
  ],
  year: [
    { name: "Tháng 1", users: 400, reports: 200 },
    { name: "Tháng 2", users: 600, reports: 350 },
    { name: "Tháng 3", users: 550, reports: 400 },
    { name: "Tháng 4", users: 800, reports: 550 },
    { name: "Tháng 5", users: 950, reports: 700 },
    { name: "Tháng 6", users: 1200, reports: 900 },
  ],
};

const DashboardChart = () => {
  const [timeRange, setTimeRange] = useState("week"); // 'week' | 'month' | 'year'

  // Lấy data tương ứng với tab đang chọn
  const currentData = useMemo(() => mockData[timeRange], [timeRange]);

  return (
    <Card
      variant="borderless"
      className="shadow-sm"
      title="Thống kê tăng trưởng"
      // Nút chuyển đổi Tuần/Tháng/Năm nằm góc phải
      extra={
        <Segmented
          options={[
            { label: "Tuần", value: "week" },
            { label: "Tháng", value: "month" },
            { label: "Năm", value: "year" },
          ]}
          value={timeRange}
          onChange={setTimeRange}
        />
      }
    >
      <div style={{ height: 350, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c8c8c", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c8c8c", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 20 }} />

            {/* Đường User (Màu Xanh lá) */}
            <Line
              type="linear"
              dataKey="users"
              name="Người dùng mới"
              stroke="#3f8600"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3f8600", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />

            {/* Đường Báo cáo (Màu Đỏ) */}
            <Line
              type="linear"
              dataKey="reports"
              name="Báo cáo tài chính"
              stroke="#cf1322"
              strokeWidth={3}
              dot={{ r: 4, fill: "#cf1322", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DashboardChart;
